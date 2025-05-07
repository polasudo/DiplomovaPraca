# CloudFormation Templates

This folder aggregates the core **CloudFormation** templates that power each phase of the Martin Diplomka serverless journey. Use these templates to spin up environments at different stages of maturity:

```
/cloudformation/               Root of CloudFormation templates
├── startup/                    Minimal, serverless MVP setup
│   ├── template.yaml           Core resources: Cognito, DynamoDB, Lambda
│   ├── startup.mmd             Mermaid diagram source
│   └── Startup.png             Static architecture diagram
│
├── scale-up/                   Hardened, VPC‑aware scale‑out architecture
│   ├── template.yaml           Networking, caching, RDS, Step Functions, Glue
│   ├── scale-up.mmd            Mermaid diagram source
│   └── Scale-up.png            Static architecture diagram
│
└── enterprise/                 Production‑grade, secure, analytics‑ready stack
    ├── template.yaml           WAF, Shield, AppSync, Redshift, Inspector, OpenSearch
    ├── enterprise.mmd          Mermaid diagram source
    └── Enterprise.png          Static architecture diagram
```

---

## Prerequisites

* **AWS CLI v2** (configured via `aws configure`)
* **IAM Permissions** to provision IAM roles, VPC, Lambda, API Gateway, and managed services
* **PowerShell** or **bash/zsh** for CLI commands

---

## Usage

1. **Select a phase** based on your needs: `startup`, `scale-up`, or `enterprise`.

2. **Review** and adjust `template.yaml` parameters (e.g., `ProjectName`, `DbPasswordSecretName`).

3. **Deploy** via AWS CLI

4. **Inspect Outputs** (API endpoints, table names, ARNs) in the CloudFormation console or:

   ```bash
   aws cloudformation describe-stacks --stack-name <stack-name>
   ```

5. **Extend** by adding triggers (API Gateway, EventBridge, S3 events) or integrating CI/CD pipelines.

---

## Customization & Extensions

* **Regional settings**: set `--region` on the CLI or in your AWS CLI profile.
* **Naming conventions**: adjust `ProjectName` for resource prefixes.
* **Service integrations**: append or modify resources (e.g., attach API Gateway, add alarms, enable autoscaling).
* **CI/CD**: plug these templates into CodePipeline, GitHub Actions, or Terraform to manage drift and versioning.

---

## References

* For detailed instructions, see each phase’s README:

  * `startup/README.md`
  * `scale-up/README.md`
  * `enterprise/README.md`

* **Mermaid diagrams** for visual context are available in each phase folder.

