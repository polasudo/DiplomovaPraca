# Define a hashtable of lambda function source filenames and corresponding zip filenames
$lambdas = @{
    "get.py" = "get.zip"
    "put.py" = "put.zip"
    "delete.py" = "delete.zip"
    "post.py" = "post.zip"
    "get_by_id.py" = "get_by_id.zip"
}

# Loop through each Lambda function, zip them, and create the corresponding .zip file
foreach ($lambda in $lambdas.Keys) {
    $zip_file = $lambdas[$lambda]

    # Check if the Python file exists
    if (Test-Path $lambda) {
        Write-Host "Zipping $lambda into $zip_file..."
        Compress-Archive -Path $lambda -DestinationPath $zip_file -Force
    } else {
        Write-Host "Error: $lambda not found! Skipping..." -ForegroundColor Red
    }
}

Write-Host "All Lambda functions have been zipped!" -ForegroundColor Green
