using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankLoanSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeLoanWorkflowPhase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "LoanApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreditScore",
                table: "LoanApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CurrentStage",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "EligibilityScore",
                table: "LoanApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EmploymentYears",
                table: "LoanApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ExistingLiabilities",
                table: "LoanApplications",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "PendingSince",
                table: "LoanApplications",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "RecommendedDecision",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskLevel",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "LoanStatusHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanApplicationId = table.Column<int>(type: "int", nullable: false),
                    OldStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedByUserId = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanStatusHistories", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LoanStatusHistories");

            migrationBuilder.DropColumn(
                name: "Age",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "CreditScore",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "CurrentStage",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "EligibilityScore",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "EmploymentYears",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "ExistingLiabilities",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "PendingSince",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "RecommendedDecision",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "RiskLevel",
                table: "LoanApplications");
        }
    }
}
