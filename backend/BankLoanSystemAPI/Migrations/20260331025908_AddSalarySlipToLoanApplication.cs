using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankLoanSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddSalarySlipToLoanApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SalarySlipFileName",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SalarySlipFilePath",
                table: "LoanApplications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalarySlipFileName",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "SalarySlipFilePath",
                table: "LoanApplications");
        }
    }
}
