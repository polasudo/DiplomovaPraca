# AWS Lambda CRUD API with DynamoDB

This repository implements a simple CRUD (Create, Read, Update, Delete) REST API using AWS Lambda functions and DynamoDB. Each HTTP method is backed by a dedicated Lambda handler:

| HTTP Method | Path          | Lambda File    | Description                           |
| ----------- | ------------- | -------------- | ------------------------------------- |
| GET         | `/items`      | `get.py`       | Retrieves all items from DynamoDB     |
| GET         | `/items/{id}` | `get_by_id.py` | Retrieves a single item by its `id`   |
| POST        | `/items`      | `post.py`      | Inserts a new item (generates a UUID) |
| PUT         | `/items`      | `put.py`       | Updates an existing item by `id`      |
| DELETE      | `/items`      | `delete.py`    | Deletes an item by `id`               |

CORS headers are included in responses to allow cross‑origin access.

---

## Table of Contents

* [Prerequisites](#prerequisites)
* [Infrastructure](#infrastructure)
* [Deployment](#deployment)
* [API Endpoints](#api-endpoints)
* [Lambda Function Details](#lambda-function-details)
* [Testing](#testing)
* [Cleanup](#cleanup)
* [License](#license)

---

## Prerequisites

* AWS account with permissions to create Lambda, API Gateway, IAM, and DynamoDB resources
* AWS CLI v2 installed and configured (run `aws configure` to set your credentials and default region)
* Terraform v1.0+ installed (with the AWS provider plugin)
* Python 3.9+ installed for local tests (optional)
* PowerShell 5.1+ (Windows) or Bash/zsh (macOS/Linux) for the `lambda.ps1` helper script
* Compression utility available (`zip` on Linux/macOS or PowerShell `Compress-Archive` on Windows)

---

## Infrastructure

Infrastructure-as-code is provided via Terraform in `main.tf`. It defines:

* **DynamoDB Table**: `example-table` with primary key `id` (String)
* **IAM Role**: Execution role granting `dynamodb:*Item` and `logs` permissions
* **Lambda Functions**: One per CRUD handler
* **API Gateway**: REST API with a single resource `/items` and proxy integration to Lambdas

Use the included `lambda.ps1` (PowerShell) script to package and deploy each Lambda function automatically.

---

## Deployment

### 1. Terraform

```bash
# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply changes
terraform apply -auto-approve
```

This will provision the DynamoDB table, IAM roles, Lambda functions, and API Gateway.

### 2. Manual Lambda Deploy (Optional)

Use `lambda.ps1` to zip and deploy individual functions:

```powershell
# Example: deploy get.py
.\lambda.ps1 -FunctionName get-items -HandlerFile get.py
```

Adjust parameters as needed in the script.

---

## API Endpoints

Once deployed, note the **Invoke URL** from API Gateway. Append the resource paths:

| Method | URL                                          | Body Example                                                  |
| ------ | -------------------------------------------- | ------------------------------------------------------------- |
| GET    | `https://<api-id>.execute-api.../items`      | *n/a*                                                         |
| GET    | `https://<api-id>.execute-api.../items/{id}` | *n/a*                                                         |
| POST   | `https://<api-id>.execute-api.../items`      | `{ "name": "Sample", "description": "Desc", "value": "123" }` |
| PUT    | `https://<api-id>.execute-api.../items`      | `{ "id": "<uuid>", "name": "New Name" }`                      |
| DELETE | `https://<api-id>.execute-api.../items`      | `{ "id": "<uuid>" }`                                          |

All requests/response bodies are JSON‑encoded.

---

## Lambda Function Details

### `post.py`

* Parses JSON body to extract `name`, `description`, and `value`
* Generates a UUID (`id`) for the new item
* Writes the item to DynamoDB
* Returns the generated `id` on success

### `get.py`

* Scans the entire table
* Returns an array of all items

### `get_by_id.py`

* Reads `id` from path parameters
* If `id` present, fetches that item via `GetItem`
* Otherwise falls back to a full table scan
* Returns `404` if the specific item is not found

### `put.py`

* Parses JSON body for `id` and optional fields: `name`, `description`, `value`
* Builds a dynamic `UpdateExpression` to modify only provided attributes
* Returns the updated attributes on success

### `delete.py`

* Parses JSON body for `id`
* Deletes the item via `DeleteItem`, returning the old attributes if found
* Returns `404` if no item existed for the given `id`

All handlers include CORS response headers.

---

## Testing

Use `curl`, Postman, or HTTPie to exercise your API. For example:

```bash
# Create an item
curl -X POST https://.../items \
  -H "Content-Type: application/json" \
  -d '{ "name": "Test", "description": "Desc", "value": "42" }'

# List items
curl https://.../items

# Update an item
curl -X PUT https://.../items \
  -H "Content-Type: application/json" \
  -d '{ "id": "<uuid>", "value": "99" }'

# Delete an item
curl -X DELETE https://.../items \
  -H "Content-Type: application/json" \
  -d '{ "id": "<uuid>" }'
```

---

## Cleanup

To remove resources:

```bash
terraform destroy -auto-approve
```

---

## License

This project is licensed under the MIT License. Feel free to adapt for your own demos and workshops.
