Param(
  [Parameter(Mandatory = $true)] [string] $Path,
  [string] $Type,
  [string] $Url = "http://localhost:3000/api/upload-resume",
  [string] $UserId
)

if (-not (Test-Path -LiteralPath $Path)) {
  Write-Error "File not found: $Path"; exit 1
}

if (-not $Type) {
  switch (([IO.Path]::GetExtension($Path)).ToLower()) {
    ".pdf" { $Type = "application/pdf" }
    ".txt" { $Type = "text/plain" }
    default { $Type = "application/octet-stream" }
  }
}

$bytes = [IO.File]::ReadAllBytes($Path)
$b64 = [Convert]::ToBase64String($bytes)

$payload = @{ filename = [IO.Path]::GetFileName($Path); type = $Type; content = $b64 } | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }
if ($UserId) { $headers["x-user-id"] = $UserId }

$resp = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -Body $payload
$resp | ConvertTo-Json -Depth 6


