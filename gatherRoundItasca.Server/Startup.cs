using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using gatherRoundItasca.Server.Data;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Text.Json;

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
            //Azure Key Vault configuration
            var keyVaultUri = Configuration["AzureKeyVault:Uri"];
            if (!string.IsNullOrEmpty(keyVaultUri))
            {
                var secretClient = new SecretClient(new Uri(keyVaultUri), new DefaultAzureCredential());

                //Retrive the database connection string from the key vault
                var connectionStringSecret = secretClient.GetSecret("ExploreDatabaseConnectionString");
                var connectionString = connectionStringSecret.Value.Value;

                //configure DB file with SQL Server using the connection string
                services.AddDbContext<ExploreItascaContext>(options =>
                    options.UseSqlServer(connectionString), ServiceLifetime.Scoped);
            }
            else
            {
                //Fallback to local configuration if the key vault is not configured
                services.AddDbContext<ExploreItascaContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("ExploreItascaContext")), ServiceLifetime.Scoped);
            }



            // Add MVC controllers to the service collection
            services.AddControllers();
            // Add other necessary services here...
            // Add Swagger services
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
            });
            // Add DataFileService to the service collection
            services.AddScoped<UpdatesDataService>();

            // Add EmailService and EmailSettings to the service collection
            services.Configure<EmailSettings>(Configuration.GetSection("EmailSettings"));
            services.AddTransient<EmailService>();
            services.AddCors(options =>
            {
                options.AddPolicy(name: "MyAllowSpecificOrigins",
                                  builder =>
                                  {
                                      builder.WithOrigins("https://localhost:5173")
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
                    var context = services.GetRequiredService<ExploreItascaContext>();
                    context.Database.EnsureCreated(); // Make sure the database is created
                    var pathToJson = "/data/bestitascalocations.json"; // Update this path
                    ExploreItascaContext.SeedFromJson(context, pathToJson);
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

            app.UseHttpsRedirection();
            app.UseStaticFiles(); // Serve static files

            app.UseRouting();
            app.UseCors("MyAllowSpecificOrigins");
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

