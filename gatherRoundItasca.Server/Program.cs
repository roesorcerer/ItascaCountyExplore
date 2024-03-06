using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace gatherRoundItasca.Server
{
    // Program is the main entry point for the application
    public class Program
    {
        // Main method initializes and starts the web application
        public static void Main(string[] args)
        {
            // Build and run the web host
             CreateHostBuilder(args).Build().Run();
           
        }

         public static IHostBuilder CreateHostBuilder(string[] args) =>
             Host.CreateDefaultBuilder(args)
                 .ConfigureWebHostDefaults(webBuilder =>
                 {
                     webBuilder.UseStartup<Startup>();
                 });
    }
}


