using Microsoft.EntityFrameworkCore;
using BankLoanSystem.Models;

namespace BankLoanSystem.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<LoanStatusHistory> LoanStatusHistories => Set<LoanStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<LoanApplication>()
            .Property(l => l.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LoanApplication>()
            .Property(l => l.AnnualIncome)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LoanApplication>()
            .Property(l => l.ExistingLiabilities)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LoanApplication>()
            .Property(l => l.SalarySlipFilePath)
            .HasMaxLength(500);
 

        modelBuilder.Entity<LoanApplication>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}