using System.Net;
using System.Net.Mail;

namespace BankLoanSystem.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public void SendEmail(string toEmail, string subject, string body)
    {
        var smtp = _config["EmailSettings:SmtpServer"] 
                   ?? throw new Exception("SMTP Server not configured");

        var portString = _config["EmailSettings:Port"] 
                         ?? throw new Exception("Port not configured");

        var username = _config["EmailSettings:Username"] 
                       ?? throw new Exception("Username not configured");

        var password = _config["EmailSettings:Password"] 
                       ?? throw new Exception("Password not configured");

        int port = int.Parse(portString);

        var client = new SmtpClient(smtp, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mail = new MailMessage
        {
            From = new MailAddress(username),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        mail.To.Add(toEmail);

        client.Send(mail);
    }
}