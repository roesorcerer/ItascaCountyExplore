using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace gatherRoundItasca.Server.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class PlayerAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var tokens = context.HttpContext.RequestServices.GetRequiredService<AdminTokenService>();
        var header = context.HttpContext.Request.Headers.Authorization.ToString();
        const string scheme = "Bearer ";
        var token = header.StartsWith(scheme, StringComparison.OrdinalIgnoreCase)
            ? header[scheme.Length..].Trim()
            : null;
        var identity = tokens.Validate(token);
        if (identity?.Scope != "player")
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Player authentication required." });
            return Task.CompletedTask;
        }

        context.HttpContext.Items["PlayerId"] = identity.Subject;
        return Task.CompletedTask;
    }
}