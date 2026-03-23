using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankLoanSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LoanApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanApplications_UserId",
                table: "LoanApplications",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanApplications_Users_UserId",
                table: "LoanApplications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanApplications_Users_UserId",
                table: "LoanApplications");

            migrationBuilder.DropIndex(
                name: "IX_LoanApplications_UserId",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LoanApplications");
        }
    }
}
