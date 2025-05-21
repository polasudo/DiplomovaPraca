<#
.SYNOPSIS
  Send a series of GET requests to your API and print status + body.

.PARAMETER ApiUrl
  The full URL of your API endpoint.

.PARAMETER Count
  Number of requests to send (default 100).
#>
param(
    [string]$ApiUrl = "",
    [int]   $Count  = 100
)

Write-Host "Testing API: $ApiUrl (sending $Count requests)" -ForegroundColor Cyan

for ($i = 1; $i -le $Count; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri $ApiUrl -Method GET -UseBasicParsing

        # Wrap $i in $() so the colon is not taken as part of the variable name
        Write-Host "Request $($i): HTTP $($resp.StatusCode) - $($resp.Content)"
    }
    catch {
        Write-Warning  "Request $($i) failed: $($_.Exception.Message)"
    }
}
