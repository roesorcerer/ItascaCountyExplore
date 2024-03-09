using gatherRoundItasca.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Xml.Linq;

namespace gatherRoundItasca.Server.Data
{
    // The main class that coordinates Entity Framework functionality for a given data model is the database context class.
    public class ExploreItascaContext : DbContext
    {
        // Configuration property to access the application settings and connection strings.
        public readonly IConfiguration _configuration;

        // Constructor that takes options for the DbContext and the IConfiguration interface.
        // The base(options) call forwards the options to the base DbContext class.
        public ExploreItascaContext(DbContextOptions<ExploreItascaContext> options, IConfiguration configuration)
            : base(options)
        {
            _configuration = configuration;
        }

        // Represents the Locations table in the database. 
        // DbSet<TEntity> can be used to query and save instances of TEntity.
        public DbSet<LocationModel> Locations { get; set; }


        // Represents the Players table in the database. 
        // DbSet<TEntity> can be used to query and save instances of TEntity.
        public DbSet<playerDataModel> Players { get; set; }

        // Represents the Updates table in the database. 
        // DbSet<TEntity> can be used to query and save instances of TEntity.
        public DbSet<UpdateModel> Updates { get; set; }
        // Override this method to further configure the model that was discovered by convention from the entity types
        // exposed in DbSet properties on your derived context.


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure entity relationships and database constraints here.
        }

        // This method is only called if the DbContextOptions are not configured in the DI container.
        // In a typical ASP.NET Core application, this method is not used since the options are provided by DI.
        /*protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Retrieve the connection string from the configuration object and set it for the DbContext.
                string connectionString = _configuration.GetConnectionString("AnimeRatings.Website_db");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }*/
    }
}
