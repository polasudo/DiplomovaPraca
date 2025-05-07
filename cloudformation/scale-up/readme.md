# Scale‑Up Architecture & Infrastructure

This documentation describes the **scale‑up phase** of our serverless application, showcasing a hardened, enterprise‑ready structure. You’ll find:

* A high‑level architecture diagram (`Scale‑up.png` and `scale‑up.mmd`)
* A CloudFormation template (`template.yaml`) to provision networking, security, compute, data stores, and API layers  citeturn8file0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Files in This Directory](#files-in-this-directory)
3. [Visual Diagram (Mermaid & PNG)](#visual-diagram-mermaid--png)
4. [CloudFormation Template Details](#cloudformation-template-details)

   * [Parameters](#parameters)
   * [Networking & Security](#networking--security)
   * [Data Stores](#data-stores)
   * [Compute & Orchestration](#compute--orchestration)
   * [API Layer](#api-layer)
   * [IAM Roles & Permissions](#iam-roles--permissions)
   * [Outputs](#outputs)
5. [Deployment Instructions](#deployment-instructions)
6. [Extending & Customization](#extending--customization)
7. [License](#license)

---


## Files in This Directory

| File            | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `Scale‑up.png`  | PNG rendering of the scale‑up architecture diagram                               |
| `scale‑up.mmd`  | Mermaid source for the diagram                                                   |
| `template.yaml` | CloudFormation template provisioning the entire scale‑up stack citeturn8file0 |

---

## Visual Diagram (Mermaid & PNG)

**Mermaid Source** (`scale‑up.mmd`): open in VS Code with a Mermaid extension to live‑preview:

```mermaid
graph TD
    %% --- Title ---
    %% title: Scale-up E-Shop Serverless Runtime Architecture (AWS)

    %% --- User Access & Frontend ---
    subgraph User Access Layer
        direction LR
        Users(Users / Devices) --> Amplify(AWS Amplify Hosting - SPA + CDN)
    end

    %% --- API Layer & Edge Security ---
    subgraph API Layer & Edge Security
        direction TB
        %% API Gateway introduced as mandatory entry point
        APIGW(Amazon API Gateway - Managed Interface)
        %% WAF/Shield typically used with API Gateway, assumed present
        WAF(AWS WAF) --> Shield(AWS Shield) --> APIGW
        %% Calls go through security layers first
        Amplify -- API Calls --> WAF
    end

    %% --- Authentication & Authorization ---
    subgraph Auth Layer
         direction TB
         Cognito(Amazon Cognito - User Mgmt, MFA, SSO Capable)
         LambdaAuth(Lambda Authorizer - Custom Logic)

         %% API Gateway integrates with Auth services
         APIGW -- Authorize Request --> LambdaAuth
         APIGW -- Authenticate User --> Cognito
         LambdaAuth -- Validates Token From --> Cognito
    end

    %% --- Backend Compute Layer ---
    subgraph Backend Compute
        direction TB
        %% IAM Roles are used but not explicitly shown in diagram components
        LambdaFunctions(AWS Lambda - Backend Logic)
        StepFunctions_Payment(AWS Step Functions - Payment Workflow)
        Fargate_Batch(AWS Fargate - Long Batch Jobs > 15min)

        %% API Gateway routes to backend compute
        APIGW -- /api/* --> LambdaFunctions
        APIGW -- /pay --> StepFunctions_Payment

        %% Assume some trigger mechanism for Fargate (e.g., scheduled, event)
        %% CloudWatch Events/EventBridge (not explicitly mentioned but typical) --> Fargate_Batch
    end

    %% --- Data Storage Layer ---
    subgraph Data Storage Layer
        direction TB
        ElastiCache[(AWS ElastiCache Redis - Cache)]
        DynamoDB[(Amazon DynamoDB - Primary Ops Data + GSIs)]
        RDS_Analytics[(Amazon RDS PostgreSQL - Complex Analytics)]
        S3_Media[(Amazon S3: Product Media)]
        S3_Analytics[(Amazon S3: Analytics Data Lake)]

        %% Data access patterns
        LambdaFunctions -- Read/Write --> ElastiCache
        ElastiCache -- Cache For --> DynamoDB
        LambdaFunctions -- Read/Write --> DynamoDB 

        %% Step Functions likely interacts with DynamoDB/RDS for state/data
        StepFunctions_Payment --> DynamoDB
        StepFunctions_Payment --> RDS_Analytics

        %% Fargate interacts with data stores
        Fargate_Batch -- Reads Data From --> S3_Analytics
        Fargate_Batch -- Reads Data From --> RDS_Analytics
        Fargate_Batch -- Writes Results To --> S3_Analytics 

        %% Media access
        Amplify -- Serves/Accesses Media From --> S3_Media
        LambdaFunctions -- Media URLs/Metadata --> S3_Media
    end

    %% --- ETL & Analytics Layer ---
    subgraph ETL & Analytics Layer
        direction TB
        Glue(AWS Glue - ETL Jobs)
        Athena(Amazon Athena - Query S3)
        QuickSight(Amazon QuickSight - BI Tool)

        %% Glue ETL flows
        DynamoDB -- Source --> Glue
        S3_Analytics -- Source --> Glue
        Glue -- Target --> RDS_Analytics
        Glue -- Target --> S3_Analytics

        %% Analytics Tooling
        S3_Analytics -- Queried By --> Athena
        RDS_Analytics -- Source For --> QuickSight
        Athena -- Data Source For --> QuickSight
    end

    %% --- Monitoring & Operations ---
    subgraph Monitoring & Operations
        direction TB
        CloudWatch(AWS CloudWatch: Logs, Metrics, Dashboards, Alarms)
        CloudTrail(AWS CloudTrail: API Auditing)
        XRay(AWS X-Ray: Distributed Tracing)
        GuardDuty(AWS GuardDuty: Threat Detection)

        %% Services feeding Monitoring Data
        APIGW & LambdaFunctions & StepFunctions_Payment & Fargate_Batch --> CloudWatch & XRay
        DynamoDB & RDS_Analytics & ElastiCache --> CloudWatch
        GuardDuty -- Analyzes --> CloudTrail
        GuardDuty & CloudWatch

    end

    %% --- Styling (Optional - Basic AWS Color) ---
    classDef awsService fill:#FF9900,color:#fff,stroke:#333,stroke-width:1px;
    %% Removed CFN from class list
    class Amplify,APIGW,LambdaAuth,Cognito,LambdaFunctions,StepFunctions_Payment,Fargate_Batch,ElastiCache,DynamoDB,RDS_Analytics,S3_Media,S3_Analytics,Glue,Athena,QuickSight,CloudWatch,CloudTrail,XRay,GuardDuty,WAF,Shield awsService;
    %% Removed devopsService classDef
```

**Static PNG**: `Scale‑up.png` for quick reference or embedding in docs.

---

## CloudFormation Template Details

The `template.yaml` brings up a complete scale‑up environment. Below is a summary of its key sections.

### Parameters

| Parameter              | Type   | Description                                   |
| ---------------------- | ------ | --------------------------------------------- |
| `ProjectName`          | String | Prefix for generating resource names          |
| `DbPasswordSecretName` | String | Secrets Manager entry for RDS master password |

### Networking & Security

* **VPC** with two public subnets (A/B) and Internet gateway
* **Route Table** and public routes for outbound access
* **Security Groups** for Lambdas, ElastiCache, and RDS

### Data Stores

* **DynamoDB** tables for `Customers`, `Orders` (with GSI), and `Feedback`
* **ElastiCache Redis** cluster in the VPC for hot‑data caching
* **RDS PostgreSQL** instance (private subnets) with credentials in Secrets Manager
* **Secrets Manager** secret for RDS master credentials

### Compute & Orchestration

* **Lambda Functions** (auth, order‑processing, feedback, analytics, payment placeholders) running inside the VPC, with X‑Ray tracing enabled
* **AWS Step Functions** state machine orchestrating multi‑step payment processing with retry and catch logic
* **AWS Fargate (optional)** for long‑running batch jobs (>15 min)

### API Layer

* **AWS WAF & Shield** (referenced in diagram) for edge security
* **Amazon API Gateway** (regional) exposing REST endpoints (register, login, orders, feedback, analytics)
* **Cognito User Pool** authorizer for protected routes
* **OPTIONS** methods configured for CORS

### IAM Roles & Permissions

* Fine‑grained **IAM Roles** for each Lambda category (Auth, Order, Feedback, Analytics, Payment) granting only necessary DynamoDB, Cognito, SecretsManager, and network privileges
* **Step Functions** role allowing Lambda invocations and X‑Ray permissions
* **API Gateway** CloudWatch logs role for detailed request tracing

### Outputs

| Output                   | Description                                |
| ------------------------ | ------------------------------------------ |
| `ApiEndpoint`            | Invoke URL for the API stage (`/showcase`) |
| `CognitoUserPoolId`      | ID of the Cognito User Pool                |
| `CustomersTableName`     | Name of the DynamoDB `Customers` table     |
| `OrdersTableName`        | Name of the DynamoDB `Orders` table        |
| `FeedbackTableName`      | Name of the DynamoDB `Feedback` table      |
| `PaymentStateMachineArn` | ARN of the Step Functions state machine    |
| `RedisCacheEndpoint`     | Redis cluster endpoint address             |
| `AnalyticsDBEndpoint`    | RDS PostgreSQL endpoint                    |
| `PublicSubnetIds`        | Comma‑separated public subnet IDs          |
| `VpcId`                  | VPC ID                                     |

---

## Deployment Instructions

```bash
aws cloudformation deploy \
  --stack-name scaleup-backend-stack \
  --template-file template.yaml \
  --parameter-overrides \
     ProjectName=MyScaleUpProj \
     DbPasswordSecretName=MyScaleUpDbSecret \
  --capabilities CAPABILITY_NAMED_IAM
```

Monitor progress in the CloudFormation console. Once complete, note the `ApiEndpoint` output for your REST APIs.

---

## License

MIT License. Feel free to adapt and tailor this template for your scaling requirements.
