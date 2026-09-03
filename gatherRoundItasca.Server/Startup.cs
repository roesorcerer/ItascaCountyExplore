using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            var mongoConnectionString = Configuration["MongoDb:ConnectionString"]
                ?? Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
            var mongoDatabaseName = Configuration["MongoDb:DatabaseName"] ?? "itascatrails";

            if (string.IsNullOrWhiteSpace(mongoConnectionString))
            {
                throw new InvalidOperationException("MongoDB connection string is missing. Set MONGODB_CONNECTION_STRING environment variable.");
            }

            services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoConnectionString));
            services.AddSingleton(sp =>
                sp.GetRequiredService<IMongoClient>().GetDatabase(mongoDatabaseName));
            services.AddSingleton<MongoCollectionsService>();
            services.AddSingleton<LeaderboardService>();
            // Derives Player progress / the current Stop from the checkins log. See docs/adr/0004.
            services.AddSingleton<TrailProgressService>();
            services.AddScoped<MongoSeedService>();
            // Issues/validates the Admin bearer token used to gate /admin/*.
            // See docs/adr/0003.
            services.AddSingleton<AdminTokenService>();

            // Add MVC controllers to the service collection
            services.AddControllers();
            // Add other necessary services here...
            // Add Swagger services
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
            });
            // Add EmailService and EmailSettings to the service collection
            services.Configure<EmailSettings>(Configuration.GetSection("EmailSettings"));
            services.AddTransient<EmailService>();
            var allowedOrigins = Configuration.GetSection("Cors:AllowedOrigins")
                .GetChildren()
                .Select(origin => origin.Value)
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .Cast<string>()
                .ToArray();
            services.AddCors(options =>
            {
                options.AddPolicy(name: "MyAllowSpecificOrigins",
                                  builder =>
                                  {
                                      builder.WithOrigins(allowedOrigins)
                                             .AllowAnyHeader()
                                             .AllowAnyMethod();
                                  });


            });
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            logger.LogInformation("ContentRootPath: {Path}", env.ContentRootPath);
            logger.LogInformation("WebRootPath: {Path}", env.WebRootPath);

            using (var scope = app.ApplicationServices.CreateScope())
            {
                var services = scope.ServiceProvider;

                // Validate the admin signing configuration during startup instead
                // of discovering a missing production secret on the first request.
                services.GetRequiredService<AdminTokenService>();

                // Schema setup (indexes/uniqueness) runs independently of data
                // seeding so the email-uniqueness invariant holds even when there's
                // nothing to seed or seed data is bad. See docs/adr/0002.
                try
                {
                    services.GetRequiredService<MongoCollectionsService>()
                        .EnsureIndexesAsync().GetAwaiter().GetResult();
                    logger.LogInformation("Database indexes ensured.");
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not ensure database indexes. Uniqueness constraints may be missing until the database connection is fixed.");
                }

                // One-off migration: normalize any existing off-catalog Favorites to
                // their canonical picklist form so Favorites-based recovery keeps
                // matching. Idempotent — a no-op once everything is canonical. See
                // docs/adr/0005.
                try
                {
                    var normalization = services.GetRequiredService<MongoCollectionsService>()
                        .NormalizeFavoritesAsync().GetAwaiter().GetResult();
                    if (normalization.PlayersUpdated > 0 || normalization.OffCatalogValues > 0)
                    {
                        logger.LogInformation(
                            "Favorites normalized: {Updated} player(s) updated, {OffCatalog} off-catalog value(s) left for manual review.",
                            normalization.PlayersUpdated, normalization.OffCatalogValues);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not normalize existing Favorites. Recovery may miss for legacy free-text rows until the database connection is fixed.");
                }

                // Seed the single Admin account from configuration (Admin:Username /
                // Admin:Password, env vars in deployment). Created once if absent and
                // never overwritten — rotating the password is a deliberate DB op.
                // See docs/adr/0003.
                try
                {
                    var adminUsername = Configuration["Admin:Username"]
                        ?? Environment.GetEnvironmentVariable("ADMIN_USERNAME");
                    var adminPassword = Configuration["Admin:Password"]
                        ?? Environment.GetEnvironmentVariable("ADMIN_PASSWORD");

                    if (string.IsNullOrWhiteSpace(adminUsername) || string.IsNullOrWhiteSpace(adminPassword))
                    {
                        logger.LogWarning("Admin credentials not configured (Admin:Username / Admin:Password). No Admin account was seeded; the admin dashboard will be unreachable until one is set.");
                    }
                    else
                    {
                        services.GetRequiredService<MongoCollectionsService>()
                            .EnsureAdminAsync(adminUsername, adminPassword).GetAwaiter().GetResult();
                        logger.LogInformation("Admin account ensured.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not ensure the Admin account. The admin dashboard may be unreachable until the database connection is fixed.");
                }

                try
                {
                    var mongoSeedService = services.GetRequiredService<MongoSeedService>();
                    mongoSeedService.SeedAsync().GetAwaiter().GetResult();
                    logger.LogInformation("Database seeding completed successfully.");
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "An error occurred seeding the DB. The app will continue but API endpoints may fail until the database connection is fixed.");
                }
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                    c.RoutePrefix = "swagger";
                });
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            if (!env.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseCors("MyAllowSpecificOrigins");
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

    }
}

