Write-Host "🧹 Limpiando proyecto antes de subir a GitHub..." -ForegroundColor Cyan

# Carpetas a eliminar
$folders = @("node_modules", ".next", ".vercel")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "✅ Eliminado: $folder" -ForegroundColor Green
    }
}

# Archivos a eliminar
$files = @("package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".DS_Store", "Thumbs.db")
foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        Write-Host "✅ Eliminado: $file" -ForegroundColor Green
    }
}

Write-Host "✨ Limpieza completada." -ForegroundColor Yellow
