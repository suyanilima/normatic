param([string]$NomeArquivo = 'Normatic-Plataforma-Unificada.zip')
$ErrorActionPreference = 'Stop'
if ([System.IO.Path]::GetFileName($NomeArquivo) -ne $NomeArquivo) { throw 'Informe somente o nome do arquivo ZIP.' }
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'dist/entregas'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$archivePath = Join-Path $outputDirectory $NomeArquivo
$items = @('index.html','normativos.html','farol.html','README.md','package.json','package-lock.json','vercel.json','assets','css','js','tests','tools','docs','supabase')
$sources = $items | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $sources -DestinationPath $archivePath -CompressionLevel Optimal -Force
Write-Output "Projeto completo: $archivePath"
