# HTTP API + Lambda + Cognito JWT Authorizer

This directory contains a **single CloudFormation template** (`template.yaml`) that provisions an HTTP API (v2) integrated with a Lambda function and protected by a Cognito JWT authorizer, all created from scratch.

---

## Contents

* `template.yaml` – CloudFormation template creating:

  * **Cognito User Pool** & **App Client**
  * **IAM Role** for Lambda execution
  * **CRUD Demo Lambda** (returns HTTP method & path)
  * **HTTP API v2** with CORS
  * **Cognito JWT Authorizer** on `/items` routes

---

## Prerequisites

* AWS CLI v2 installed and configured (`aws configure`)
* PowerShell (Windows) or bash/zsh (macOS/Linux)
* Permissions to create IAM roles, Cognito resources, Lambda functions, and API Gateway

---

## Architecture Overview

1. **Cognito User Pool** – user directory for sign-up and authentication
2. **User Pool Client** – issues JWTs (IdToken) to authenticated users
3. **LambdaExecutionRole** – IAM role granting CloudWatch Logs permissions
4. **CrudFunction** – inline Python handler for all HTTP methods
5. **HttpApi** – HTTP API v2 with CORS (GET/POST/OPTIONS)
6. **JwtAuthorizer** – validates Authorization header JWTs via Cognito
7. **Routes** – `GET /items` and `POST /items` protected by the authorizer
8. **DefaultStage** – auto‐deploys the API to `$default` stage

---

## Deployment

### Bash

```bash
aws cloudformation deploy \
  --stack-name crud-http-api-stack \
  --template-file ./template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

### PowerShell

```powershell
aws cloudformation deploy `
  --stack-name crud-http-api-stack `
  --template-file .\template.yaml `
  --capabilities CAPABILITY_NAMED_IAM
```

This command creates all necessary resources in your AWS account.

---

## Testing

Below is an end-to-end guide using PowerShell (with backticks for line continuations). Adjust usernames and passwords as needed.

1. **Retrieve Stack Outputs**

   ```powershell
   $stack = 'crud-http-api-stack'

   $apiUrl = (aws cloudformation describe-stacks `
     --stack-name $stack `
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" `
     --output text).Trim()

   $poolId = (aws cloudformation describe-stacks `
     --stack-name $stack `
     --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolId'].OutputValue" `
     --output text).Trim()

   $clientId = (aws cloudformation describe-stacks `
     --stack-name $stack `
     --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolClientId'].OutputValue" `
     --output text).Trim()
   ```

2. **Sign Up & Confirm a Test User**

   ```powershell
   aws cognito-idp sign-up `
     --client-id $clientId `
     --username testuser@example.com `
     --password 'Test1234!'

   aws cognito-idp admin-confirm-sign-up `
     --user-pool-id $poolId `
     --username testuser@example.com
   ```

3. **Authenticate to Obtain an IdToken**

   ```powershell
   $auth = aws cognito-idp initiate-auth `
     --client-id $clientId `
     --auth-flow USER_PASSWORD_AUTH `
     --auth-parameters USERNAME=testuser@example.com,PASSWORD='Test1234!' `
     --output json

   $IdToken = ($auth | ConvertFrom-Json).AuthenticationResult.IdToken
   ```

4. **Invoke the API**

   ```powershell
   # GET
   Invoke-RestMethod `
     -Method GET `
     -Uri "$apiUrl/items" `
     -Headers @{ Authorization = "Bearer $IdToken" }

   # POST
   Invoke-RestMethod `
     -Method POST `
     -Uri "$apiUrl/items" `
     -Headers @{
         Authorization = "Bearer $IdToken";
         'Content-Type'  = 'application/json'
       } `
     -Body '{ "foo": "bar" }'
   ```

---

## Cleanup

To delete all resources created by this stack:

```bash
aws cloudformation delete-stack --stack-name crud-http-api-stack
```
