using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace gatherRoundItasca.Server.Authorization;

// Gates every action it decorates behind a valid Admin bearer token. Applied to the
// whole AdminController so that no /admin/* endpoint is reachable without first
// logging in — the missing gate that ADR 0003 calls out. The login endpoint itself
// lives on a separate, ungated controller.
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class AdminAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var tokens = context.HttpContext.RequestServices.GetRequiredService<AdminTokenService>();

        var header = context.HttpContext.Request.Headers.Authorization.ToString();
        const string scheme = "Bearer ";
        var token = header.StartsWith(scheme, StringComparison.OrdinalIgnoreCase)
            ? header[scheme.Length..].Trim()
            : null;

        var username = tokens.Validate(token);
        if (username == null)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Admin authentication required." });
            return Task.CompletedTask;
        }

        // Make the authenticated Admin available to downstream code if it needs it.
        context.HttpContext.Items["AdminUsername"] = username;
        return Task.CompletedTask;
    }
}
