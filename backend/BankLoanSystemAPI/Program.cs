using System.Text;
using BankLoanSystem.Data;
using BankLoanSystem.Hubs;
using BankLoanSystem.Middleware;
using BankLoanSystem.Services;
using BankLoanSystem.Models;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
 
var builder = WebApplication.CreateBuilder(args);
 
// ================= DATABASE =================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
 
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new Exception("DefaultConnection is missing in appsettings.json");
}
 
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    }));
 
// ================= SERVICES =================
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<EligibilityService>();
builder.Services.AddScoped<BankDataService>();
 
// ================= CONTROLLERS =================
builder.Services.AddControllers();
 
// ================= CORS =================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
 
// ================= JWT =================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
 
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT key is missing in appsettings.json");
}
 
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
 
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
 
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
 
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = key
    };
 
    // For SignalR support
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
 
            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/notificationHub"))
            {
                context.Token = accessToken;
            }
 
            return Task.CompletedTask;
        }
    };
});
 
builder.Services.AddAuthorization();
 
// ================= SWAGGER =================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BankLoanSystem API",
        Version = "v1"
    });
 
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your JWT token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
 
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
 
// ================= SIGNALR =================
builder.Services.AddSignalR();
 
var app = builder.Build();
 
// ================= MIDDLEWARE =================
app.UseMiddleware<ExceptionMiddleware>();
 
app.UseSwagger();
app.UseSwaggerUI();
 
app.UseHttpsRedirection();
 
// ================= FILE UPLOAD =================
var uploadsPath = Path.Combine(builder.Environment.WebRootPath, "Uploads");
 
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
 
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
 
    // Ensure DB is created
    context.Database.EnsureCreated();
 
    // Check if officer already exists
    if (!context.Users.Any(u => u.Email == "officer@bank.com"))
    {
        context.Users.Add(new User
        {
            FullName = "System Officer",
            Email = "officer@bank.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Officer@123"),
            Role = "Officer",
            CreatedAt = DateTime.UtcNow
        });
 
        context.SaveChanges();
    }
}
 
app.Run();



