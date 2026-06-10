using System.Security.Cryptography;
using System.Text;

namespace gatherRoundItasca.Server.Services;

// Issues and validates the bearer token an Admin presents to reach the gated
// /admin/* endpoints (see docs/adr/0003). The token is stateless and signed with
// HMAC-SHA256 over "username.expiry", so no server-side session store is needed and
// it cannot be forged without the secret. The secret comes from configuration
// (Admin:TokenSecret, an env var in deployment); if none is set a random one is
// generated per process, which means tokens simply stop validating after a restart
// — safe, just means the Admin logs in again.
public class AdminTokenService
{
    private readonly byte[] _secret;
    private readonly TimeSpan _lifetime = TimeSpan.FromHours(8);

    public AdminTokenService(IConfiguration configuration, ILogger<AdminTokenService> logger)
    {
        var configured = configuration["Admin:TokenSecret"]
            ?? Environment.GetEnvironmentVariable("ADMIN_TOKEN_SECRET");

        if (string.IsNullOrWhiteSpace(configured))
        {
            logger.LogWarning(
                "Admin:TokenSecret is not set; using a per-process random secret. Admin sessions will not survive a restart. Set ADMIN_TOKEN_SECRET to fix this.");
            _secret = RandomNumberGenerator.GetBytes(32);
        }
        else
        {
            _secret = Encoding.UTF8.GetBytes(configured);
        }
    }

    public string Issue(string username)
    {
        var expiry = DateTimeOffset.UtcNow.Add(_lifetime).ToUnixTimeSeconds();
        var payload = $"{username}.{expiry}";
        var signature = Sign(payload);
        var bytes = Encoding.UTF8.GetBytes($"{payload}.{signature}");
        return Convert.ToBase64String(bytes);
    }

    // Returns the authenticated username, or null if the token is missing,
    // malformed, expired, or its signature doesn't verify.
    public string? Validate(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        string decoded;
        try
        {
            decoded = Encoding.UTF8.GetString(Convert.FromBase64String(token));
        }
        catch (FormatException)
        {
            return null;
        }

        // payload is "username.expiry"; the third segment is the signature over it.
        var lastDot = decoded.LastIndexOf('.');
        if (lastDot <= 0)
        {
            return null;
        }

        var payload = decoded[..lastDot];
        var signature = decoded[(lastDot + 1)..];

        if (!FixedTimeEquals(signature, Sign(payload)))
        {
            return null;
        }

        var firstDot = payload.IndexOf('.');
        if (firstDot <= 0)
        {
            return null;
        }

        var username = payload[..firstDot];
        if (!long.TryParse(payload[(firstDot + 1)..], out var expiry))
        {
            return null;
        }

        if (DateTimeOffset.FromUnixTimeSeconds(expiry) < DateTimeOffset.UtcNow)
        {
            return null;
        }

        return username;
    }

    private string Sign(string payload)
    {
        using var hmac = new HMACSHA256(_secret);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        var ba = Encoding.UTF8.GetBytes(a);
        var bb = Encoding.UTF8.GetBytes(b);
        return CryptographicOperations.FixedTimeEquals(ba, bb);
    }
}
