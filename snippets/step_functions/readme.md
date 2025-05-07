# Mock Payment Workflow

This repository provides a fully mocked AWS Step Functions workflow simulating a payment process. It includes three AWS Lambda functions and a Step Functions state machine, with all interactions confined to DynamoDB (no external APIs).

## Table of Contents

* [Architecture Overview](#architecture-overview)
* [Prerequisites](#prerequisites)
* [Resources](#resources)
* [Deployment](#deployment)

  * [CloudFormation Stack](#cloudformation-stack)
  * [Start Execution](#start-execution)
* [Validation](#validation)
* [Cleanup](#cleanup)
* [Troubleshooting](#troubleshooting)
* [License](#license)

## Architecture Overview

1. **CreateOrderFunction**: Inserts a new order item into DynamoDB with `status: "created"`.
2. **HoldPaymentFunction**: Updates the same order item to `status: "hold"`.
3. **AcceptPaymentFunction**: Final update to `status: "paid"` and returns a confirmation message.
4. **State Machine**: Orchestrates the three functions in sequence: Create → Hold → Accept.

All Lambdas use inline zip definitions and require a single DynamoDB table.

## Prerequisites

* AWS CLI v2 configured with appropriate permissions
* AWS account with rights to create IAM roles, Step Functions, Lambda functions, and DynamoDB tables
* PowerShell (for the commands shown)

## Resources

* **DynamoDB Table**: `MockOrders` (or custom via parameters)
* **IAM Role**: Single role granting `lambda:InvokeFunction`, `dynamodb:PutItem`, and `dynamodb:UpdateItem` for Lambdas; another for Step Functions
* **Lambda Functions**:

  * `mock-create-order`
  * `mock-hold-payment`
  * `mock-accept-payment`
* **Step Functions State Machine**: `mock-payment-workflow`

## Deployment

### CloudFormation Stack

Save the template as `mock-payment-workflow.yaml`, then run in PowerShell:

```powershell
aws cloudformation deploy `
  --stack-name mock-payment-workflow-stack `
  --template-file .\mock-payment-workflow.yaml `
  --parameter-overrides OrdersTableName=MockOrders `
  --capabilities CAPABILITY_NAMED_IAM
```

This command will create all required resources.

### Start Execution

Invoke the state machine with a test order ID:

```powershell
aws stepfunctions start-execution `
  --state-machine-arn arn:aws:states:<region>:<account-id>:stateMachine:mock-payment-workflow `
  --input '{ "orderId": "1234" }'
```

Replace `<region>` and `<account-id>` accordingly.

## Validation

1. Open the DynamoDB console and inspect the `MockOrders` table.
2. You should see three updates for `orderId` `1234`:

   * After **CreateOrder**: `status = "created"`
   * After **HoldPayment**: `status = "hold"`
   * After **AcceptPayment**: `status = "paid"`

## Cleanup

To remove all resources, delete the CloudFormation stack:

```powershell
aws cloudformation delete-stack `
  --stack-name mock-payment-workflow-stack
```

## Troubleshooting

* **InvalidExecutionInput**: Ensure you wrap JSON in single quotes in PowerShell (`'...'`).
* **Permissions**: Confirm IAM roles have necessary `dynamodb` and `lambda:InvokeFunction` permissions.

## License

MIT License. Feel free to adapt and extend for your demos.
