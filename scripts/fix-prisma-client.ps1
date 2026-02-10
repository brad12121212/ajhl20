# Fix "Unknown argument `name`" when creating events:
# The Prisma client must be regenerated so it includes the Event.name field.
# The dev server locks the query engine DLL, so you must run this with the server STOPPED.
#
# 1. Stop the dev server (Ctrl+C in the terminal running npm run dev)
# 2. Run this script from the project root: .\scripts\fix-prisma-client.ps1
#    Or run manually:
#    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
#    npx prisma generate
# 3. Start the dev server again: npm run dev

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Clearing Next.js cache (.next)..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Regenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Start the dev server with: npm run dev" -ForegroundColor Green
} else {
    Write-Host "Prisma generate failed. Make sure the dev server is fully stopped (no Node process using the Prisma engine)." -ForegroundColor Red
    exit 1
}
