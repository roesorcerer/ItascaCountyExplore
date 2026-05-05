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
            var mongoConnectionString = Configuration["MongoDb:ConnectionString"] ?? Configuration.GetConnectionString("MongoDb");
            var mongoDatabaseName = Configuration["MongoDb:DatabaseName"] ?? "itascatrails";

            if (string.IsNullOrWhiteSpace(mongoConnectionString))
            {
                throw new InvalidOperationException("MongoDB connection string is missing. Set MongoDb:ConnectionString in appsettings or user secrets.");
            }

            if (mongoConnectionString.Contains("<db_password>", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("MongoDB connection string still contains <db_password>. Replace it with your real database password.");
            }

            services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoConnectionString));
            services.AddSingleton(sp =>
                sp.GetRequiredService<IMongoClient>().GetDatabase(mongoDatabaseName));
            services.AddSingleton<MongoCollectionsService>();
            services.AddScoped<MongoSeedService>();

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
            services.AddCors(options =>
            {
                options.AddPolicy(name: "MyAllowSpecificOrigins",
                                  builder =>
                                  {
                                      builder.WithOrigins(
                                                "https://localhost:5173",
                                                "http://localhost:5164",
                                                "https://localhost:5165"
                                             )
                                             .AllowAnyHeader()
                                             .AllowAnyMethod();
                                  });


            });
        }


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var mongoSeedService = services.GetRequiredService<MongoSeedService>();
                    mongoSeedService.SeedAsync().GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    // Log the error if something goes wrong
                    var logger = services.GetRequiredService<ILogger<Startup>>();
                    logger.LogError(ex, "An error occurred seeding the DB.");
                }
            }
        
            if (env.IsDevelopment())
            {

                app.UseDeveloperExceptionPage();
                // Enable middleware to serve generated Swagger as a JSON endpoint
                app.UseSwagger();

                // Enable middleware to serve swagger-ui assets (HTML, JS, CSS)
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

            if (env.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }
            app.UseStaticFiles(); // Serve static files

            app.UseCors("MyAllowSpecificOrigins");
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers(); // Map Controller routes
                // Map fallback to root for SPA
                endpoints.MapFallbackToFile("index.html");
            });

        }

    }
}

