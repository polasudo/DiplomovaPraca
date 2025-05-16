# Enterprise Architecture & Infrastructure

This documentation details the **enterprise phase** of our serverless application—built for full-scale, production-grade deployments. It includes:

* A comprehensive architecture diagram (`Enterprise.png`, `enterprise.mmd`)
* A CloudFormation template (`template.yaml`) provisioning security, networking, compute, data, and observability stacks  citeturn9file0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Files in This Directory](#files-in-this-directory)
3. [Visual Diagram (Mermaid & PNG)](#visual-diagram-mermaid--png)
4. [CloudFormation Template Details](#cloudformation-template-details)

   * [Parameters](#parameters)
   * [Networking & VPC](#networking--vpc)
   * [Security & Edge Protection](#security--edge-protection)
   * [Authentication & API Layer](#authentication--api-layer)
   * [Compute & Orchestration](#compute--orchestration)
   * [Data Layer](#data-layer)
   * [Analytics & ETL](#analytics--etl)
   * [Observability & Security Ops](#observability--security-ops)
   * [Real-Time & Async Integration](#real-time--async-integration)
   * [Outputs](#outputs)
5. [Deployment Instructions](#deployment-instructions)
6. [Extending & Customization](#extending--customization)
7. [License](#license)

---

## Architecture Overview

In the **enterprise phase**, the system is enhanced for security, compliance, and scale:

* **User Access Layer**: Amplify + CloudFront for global SPA distribution
* **API Edge Protection**: AWS WAF & Shield guarding Amazon API Gateway
* **Authentication**: Amazon Cognito for user pools & AppSync for real-time GraphQL
* **Compute**: VPC‑isolated Lambdas with X‑Ray tracing, Step Functions orchestrating payments
* **Batch Processing**: AWS Fargate for long‑running tasks and AWS Glue ETL
* **Data Stores**: DynamoDB + Redis cache, RDS PostgreSQL, Redshift cluster, S3 data lake
* **Analytics & Dashboards**: Athena + QuickSight and OpenSearch dashboards
* **Observability & Security**: CloudWatch Logs/Dashboards, CloudTrail, GuardDuty, Inspector scans

This design meets enterprise requirements for isolation, threat detection, auditability, and real‑time capabilities.

---

## Files in This Directory

| File             | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `Enterprise.png` | PNG rendering of the enterprise architecture diagram                        |
| `enterprise.mmd` | Mermaid source for the diagram                                              |
| `template.yaml`  | CloudFormation template provisioning the enterprise stack citeturn9file0 |

---

## Visual Diagram (Mermaid & PNG)

**Mermaid Source** (`enterprise.mmd`): preview in VS Code with Mermaid extension:

```mermaid
---
config:
 theme: base
 fontSize: 20px
 layout: fixed
---
flowchart TD
 subgraph subGraph0["User Access Layer"]
    direction LR
        Amplify("Amplify + CloudFront")
        Users("Users / Devices")
  end
 subgraph subGraph1["API Layer & Edge Security"]
    direction TB
        WAF("AWS WAF")
        Shield("AWS Shield")
        APIGW("Amazon API Gateway")
        Cognito("Amazon Cognito")
  end
 subgraph subGraph2["Core Backend"]
    direction TB
        Lambda_OrderMgmt("Lambda: Order Management")
        Lambda_CacheCheck("Lambda: Cache Check")
        ElastiCache("Amazon ElastiCache Redis")
        DynamoDB[("Amazon DynamoDB")]
        EventBridge("Amazon EventBridge")
  end
 subgraph subGraph3["Async & Workflow & Reporting"]
    direction TB
        Lambda_Notification("Lambda: Custom Notification")
        StepFunctions("AWS Step Functions: Payment Workflow")
        Lambda_PayReq("Lambda: Payment Request")
        Lambda_PayRelease("Lambda: Payment Release")
        Lambda_DataProc("Lambda: Safe Data Processing")
        S3_DataLake[("Amazon S3: Data Lake")]
        Fargate_Process("AWS Fargate: Process Tasks")
        Fargate_LongRun("AWS Fargate: Long Running Tasks / Reports")
        ThirdPartyServices("External 3rd Party Services")
        S3_Reports[("Amazon S3: Reports Store")]
  end
 subgraph subGraph4["Data Layer"]
    direction TB
        RDS[("Amazon RDS")]
        S3_Assets[("Amazon S3: Static Assets / Other")]
        Redshift[("Amazon Redshift")]
  end
 subgraph subGraph5["Analytics & ETL"]
    direction TB
        Glue("AWS Glue ETL")
        Athena("Amazon Athena")
        QuickSight("Amazon QuickSight")
  end
 subgraph subGraph6["AppSync API Layer"]
    direction LR
        AppSync("AWS AppSync GraphQL API")
        ThirdPartyApps("3rd Party Apps / Clients")
  end
 subgraph subGraph7["Monitoring & Security Ops"]
    direction TB
        CloudWatch("AWS CloudWatch: Logs, Metrics")
        CloudTrail("AWS CloudTrail: API Logs")
        XRay("AWS X-Ray: Tracing")
        GuardDuty("Amazon GuardDuty: Threat Detection")
        Inspector("Amazon Inspector: Vulnerability Scan")
  end
    Users --> Amplify
    Amplify --> WAF
    WAF --> Shield
    Shield --> APIGW
    APIGW -- Authenticates with --> Cognito
    APIGW -- Route: /orders --> Lambda_OrderMgmt
    APIGW -- Route: /cached --> Lambda_CacheCheck
    Lambda_CacheCheck --> ElastiCache & CloudWatch & XRay
    Lambda_OrderMgmt --> DynamoDB & EventBridge & CloudWatch & XRay
    EventBridge -- Triggers --> Lambda_Notification & StepFunctions
    StepFunctions --> Lambda_PayReq & Lambda_PayRelease & CloudWatch
    Lambda_PayReq --> DynamoDB & CloudWatch & XRay
    Lambda_PayRelease --> DynamoDB & CloudWatch & XRay
    EventBridge --> Lambda_DataProc
    Lambda_DataProc --> S3_DataLake & CloudWatch & XRay
    S3_DataLake -- Report Data Source --> Fargate_LongRun
    Fargate_LongRun -- Interacts With --> ThirdPartyServices
    Fargate_LongRun -- Writes Report Results --> S3_Reports
    Amplify -- Serves Assets From --> S3_Assets
    S3_DataLake -- Source --> Glue
    DynamoDB -- Source --> Glue
    Glue -- Target --> Redshift & RDS & S3_DataLake
    S3_DataLake -- Queried by --> Athena
    Athena -- Data Source --> QuickSight
    Redshift -- Data Source --> QuickSight
    RDS -- Data Source --> QuickSight
    ThirdPartyApps --> AppSync
    AppSync -- Resolvers --> Lambda_OrderMgmt & DynamoDB
    AppSync -- Reads Reports From --> S3_Reports
    APIGW --> CloudWatch & XRay
    Lambda_Notification --> CloudWatch & XRay
    Fargate_Process --> CloudWatch
    Fargate_LongRun --> CloudWatch
    RDS --> CloudWatch
    DynamoDB --> CloudWatch
    Redshift --> CloudWatch
    Inspector -- Scans --> Fargate_Process & Fargate_LongRun & Lambda_OrderMgmt
    Inspector -- Findings --> CloudWatch
    GuardDuty -- Analyzes --> CloudTrail
    GuardDuty -- Findings --> CloudWatch
     Amplify:::awsService
     WAF:::awsService
     Shield:::awsService
     APIGW:::awsService
     Cognito:::awsService
     Lambda_OrderMgmt:::awsService
     Lambda_CacheCheck:::awsService
     ElastiCache:::awsService
     DynamoDB:::awsService
     EventBridge:::awsService
     Lambda_Notification:::awsService
     StepFunctions:::awsService
     Lambda_PayReq:::awsService
     Lambda_PayRelease:::awsService
     Lambda_DataProc:::awsService
     S3_DataLake:::awsService
     Fargate_Process:::awsService
     Fargate_LongRun:::awsService
     S3_Reports:::awsService
     RDS:::awsService
     S3_Assets:::awsService
     Redshift:::awsService
     Glue:::awsService
     Athena:::awsService
     QuickSight:::awsService
     AppSync:::awsService
     CloudWatch:::awsService
     CloudTrail:::awsService
     XRay:::awsService
     GuardDuty:::awsService
     Inspector:::awsService
    classDef awsService fill:#FF9900,color:#fff,stroke:#333,stroke-width:1px


```

**Static PNG**: `Enterprise.png` for embedding in presentations.

---

## CloudFormation Template Details

The `template.yaml` automates the enterprise-grade environment. Key sections:

### Parameters

| Parameter              | Type   | Description                                      |
| ---------------------- | ------ | ------------------------------------------------ |
| `ProjectName`          | String | Prefix for resource naming                       |
| `DbPasswordSecretName` | String | Secrets Manager key for RDS & Aurora credentials |

### Networking & VPC

* Creates a dedicated **VPC** with public subnets (A/B) and IGW
* **Route tables** and **security groups** isolating Lambda, RDS, and ElastiCache traffic

### Security & Edge Protection

* **AWS WAFv2** Web ACL with managed rule groups
* **AWS Shield** integration for DDoS defense
* **CloudTrail** for API auditing
* **Inspector** vulnerability scans on Lambda roles
* **GuardDuty** threat detection over VPC flow logs and CloudTrail

### Authentication & API Layer

* **Amazon Cognito** User Pool + App Client for JWT issuance
* **API Gateway** REST endpoints with Cognito authorizer and CORS
* **AppSync GraphQL API** for subscriptions and real-time updates

### Compute & Orchestration

* **AWS Lambda** placeholder functions for auth, orders, feedback, analytics, and payment steps—all VPC‑enabled and X‑Ray traced
* **AWS Step Functions** orchestrating multi-step payment workflow with retries and error handling
* **AWS Fargate** tasks for long‑running batch processing (>15 min)

### Data Layer

* **Amazon DynamoDB** tables (`Customers`, `Orders` with GSI, `Feedback`)
* **Amazon ElastiCache (Redis)** for caching hot keys
* **Amazon RDS PostgreSQL** in private subnets, credentials in Secrets Manager
* **Amazon Redshift** cluster for data warehousing
* **Amazon S3** bucket for data lake and static assets

### Analytics & ETL

* **AWS Glue** job for ETL between data sources (S3, RDS, Redshift)
* **Amazon Athena** for SQL-on-S3 queries
* **Amazon QuickSight** dashboards connecting to Athena and Redshift

### Observability & Security Ops

* **CloudWatch Logs & Metrics** with custom dashboards (`EnterpriseDashboard`)
* **OpenSearch** domain for centralized log analytics
* **CloudTrail** AWS API logs for audit
* **Inspector** continuous assessments

### Real-Time & Async Integration

* **EventBridge** (commented example) for decoupled cross-service events
* **AppSync Subscriptions** for order status updates in real time

### Outputs

| Output                         | Description                             |
| ------------------------------ | --------------------------------------- |
| `ApiEndpoint`                  | REST API invoke URL (stage: `showcase`) |
| `CognitoUserPoolId`            | Cognito User Pool ID                    |
| `AppSyncApiId`                 | AppSync GraphQL API ID                  |
| `CustomersTableName`           | DynamoDB Customers table name           |
| `OrdersTableName`              | DynamoDB Orders table name              |
| `FeedbackTableName`            | DynamoDB Feedback table name            |
| `PaymentStateMachineArn`       | ARN of Step Functions payment processor |
| `RedisCacheEndpoint`           | Redis cluster endpoint                  |
| `AnalyticsDBEndpoint`          | RDS PostgreSQL endpoint                 |
| `RedshiftClusterEndpoint`      | Redshift cluster endpoint               |
| `LogsOpenSearchDomainEndpoint` | OpenSearch domain endpoint              |
| `VpcId`                        | VPC ID                                  |
| `PublicSubnetIds`              | Comma‑separated public subnet IDs       |

---

## Deployment Instructions

Deploy via AWS CLI:

```bash
aws cloudformation deploy \
  --stack-name enterprise-backend-stack \
  --template-file template.yaml \
  --parameter-overrides \
    ProjectName=MyEnterpriseProj \
    DbPasswordSecretName=MyEnterpriseDbSecret \
  --capabilities CAPABILITY_NAMED_IAM
```

Monitor stack events in the AWS CloudFormation Console. Once deployed, retrieve outputs for API endpoints and resource identifiers.

---


## License

MIT License. Adapt freely for your enterprise environment.
