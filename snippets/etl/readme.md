# AWS SAM ETL Pipeline Example

This project demonstrates a simple ETL (Extract, Transform, Load) pipeline built using the AWS Serverless Application Model (SAM).

The pipeline consists of:
1.  An **AWS Lambda function** (`data_generator_lambda.py`) triggered on a schedule (or manually) to generate sample CSV data and upload it to an S3 source bucket.
2.  An **AWS Glue ETL job** (`glue_etl_script.py`) that reads the raw CSV data from the source bucket, performs transformations (filters out-of-stock items, calculates a discounted price, adds a timestamp), and writes the results in Parquet format to an S3 target bucket.
3.  **Three S3 buckets:** one for the Glue script, one for the raw source data, and one for the transformed target data.
4.  Necessary **IAM Roles** for the Lambda function and the Glue job.


## Prerequisites

1.  **AWS Account:** You need an AWS account.
2.  **AWS Credentials:** Configure your AWS credentials locally, typically via `aws configure` or environment variables. SAM CLI needs these to deploy resources.
3.  **AWS SAM CLI:** Install the SAM CLI: [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
4.  **Python:** A compatible Python version (e.g., Python 3.11, 3.12 or 3.13, matching the `Runtime` specified in `template.yaml`) needs to be installed and correctly configured in your system's PATH.
5.  **AWS CLI:** Install the AWS CLI (useful for uploading the Glue script): [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Deployment (PowerShell)

Execute these commands from within the project directory (`etl/`).

1.  **Build the Application:**
    This command packages the Lambda function code.
    ```powershell
    sam build
    ```
    Verify that the build succeeds without errors.

2.  **Deploy the Stack:**
    This command deploys the resources defined in `template.yaml` to your AWS account using CloudFormation. It includes necessary capabilities for IAM role creation and uses SAM's managed S3 bucket for artifacts (`--resolve-s3`).

    ```powershell
    sam deploy `
        --template-file .aws-sam/build/template.yaml `
        --stack-name "etl-skuska" `
        --region "eu-central-1" `
        --capabilities CAPABILITY_NAMED_IAM `
        --resolve-s3 `
        --parameter-overrides `
            ParameterKey=ProjectName,ParameterValue="myflatsametl" `
            ParameterKey=GlueEtlScriptName,ParameterValue="glue_etl_script.py" `
            ParameterKey=DiscountRateForEtl,ParameterValue="0.1" `
        --confirm-changeset `
        --disable-rollback # Optional: remove this line for safer deployments
    ```
    * **Note:** Replace `"eu-central-1"` with your target AWS Region if needed.
    * **Note:** Replace `"myflatsametl"` if you want a different (all lowercase) project prefix.
    * Confirm the changeset when prompted (`y`).
    * Note the `Outputs` from the deployment, especially the `GlueScriptsS3BucketName`.

## Post-Deployment Step: Upload Glue Script

The Glue ETL script needs to be uploaded manually to the S3 bucket created by SAM.

1.  **Get the Glue Scripts Bucket Name:** Find the value for `GlueScriptsS3BucketName` in the `Outputs` section of the `sam deploy` command or from the CloudFormation stack outputs in the AWS console.

2.  **Upload the script using AWS CLI (PowerShell):**
    Replace `YOUR_GLUE_SCRIPTS_BUCKET_NAME` with the actual bucket name.
    ```powershell
    # Ensure you are in the etl/ directory where glue_etl_script.py exists
    aws s3 cp .\glue_etl_script.py s3://YOUR_GLUE_SCRIPTS_BUCKET_NAME/glue_etl_script.py
    ```

## Testing the Pipeline

Follow these steps to test the deployed pipeline:

1.  **Trigger Lambda:**
    * Go to the AWS Lambda console.
    * Find the function (e.g., `myflatsametl-DataGeneratorLambda`).
    * Go to the "Test" tab, create a simple test event (e.g., `{}`), and click "Test".
    * Verify the execution succeeds and check its logs for the "Successfully uploaded..." message.

2.  **Verify Raw Data:**
    * Go to the Amazon S3 console.
    * Navigate to the `RawDataBucket` (find its name in the `sam deploy` outputs).
    * Look inside the `product_data/` prefix for a new `.csv` file.

3.  **Run Glue Job:**
    * Go to the AWS Glue console.
    * Navigate to "ETL jobs".
    * Find the job (e.g., `myflatsametl-ProductETLJob`).
    * Select the job and click "Run".
    * Monitor the job run status until it shows "Succeeded" (this may take a few minutes).

4.  **Verify Transformed Data:**
    * Go back to the Amazon S3 console.
    * Navigate to the `TransformedDataBucket` (find its name in the `sam deploy` outputs).
    * Look inside the `transformed_product_data/` prefix for `.parquet` file(s).

5.  **Check Logs (Troubleshooting):**
    * **Lambda:** Monitor -> View CloudWatch logs in the Lambda console.
    * **Glue:** Select the specific job run in the Glue console -> "Logs", "Error logs", or "Output logs" links.

## Cleaning Up

To remove all the resources created by this stack, delete the CloudFormation stack:

1.  Go to the AWS CloudFormation console.
2.  Select the stack (e.g., `etl-skuska`).
3.  Click "Delete".
4.  **Note:** The S3 buckets created might not be automatically deleted if they contain data. You may need to empty them manually before CloudFormation can successfully delete them, or configure a DeletionPolicy (not included in this template for safety).
