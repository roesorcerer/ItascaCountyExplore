using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

public class EmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> emailSettings)
    {
        _emailSettings = emailSettings.Value;
    }

    public async Task SendEmailAsync(string email, string subject, string message)
    {
        var sender = _emailSettings.Sender
            ?? throw new InvalidOperationException("EmailSettings:Sender is required.");
        var mailServer = _emailSettings.MailServer
            ?? throw new InvalidOperationException("EmailSettings:MailServer is required.");
        var mailPort = _emailSettings.MailPort
            ?? throw new InvalidOperationException("EmailSettings:MailPort is required.");

        var mailMessage = new MailMessage()
        {
            From = new MailAddress(sender, _emailSettings.SenderName),
            Subject = subject,
            Body = message,
            IsBodyHtml = true,
        };

        mailMessage.To.Add(email);

        using var smtpClient = new SmtpClient(mailServer, mailPort)
        {
            Credentials = new NetworkCredential(sender, _emailSettings.Password),
            EnableSsl = true,
        };

        await smtpClient.SendMailAsync(mailMessage);
    }
}

public class EmailSettings
{
    public string? MailServer { get; set; }
    public int? MailPort { get; set; }
    public string? SenderName { get; set; }
    public string? Sender { get; set; }
    public string? Password { get; set; }
}
