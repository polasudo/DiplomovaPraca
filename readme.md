Absolutely! Here’s a **README.md** for your diploma thesis repository, covering the whole project and connecting all subfolders. This version introduces your motivation, context, structure, and practical usage for new users, contributors, or examiners.

---

# Serverless Reference Architectures & Patterns for AWS

## Overview

This repository accompanies the diploma thesis “Sustainable Design and Operation of Serverless Applications in Cloud Environments,” and provides a hands-on, upgradeable catalogue of Infrastructure-as-Code (IaC) templates, patterns, and best practices for building serverless applications on AWS.

The project is rooted in real experience from Vertice, a SaaS procurement platform that grew from startup to scale-up, running almost entirely on serverless infrastructure. The aim is to help teams accelerate their cloud adoption while ensuring maintainability, security, and cost transparency as their products evolve.

---

## Repository Structure

The repository is organized into three main phases, each with its own folder:

cloudformation/
├── startup/
├── scale-up/
└── enterprise/
Each folder contains:

* IaC templates (CloudFormation, SAM, Terraform)
* Architecture diagrams (Mermaid + PNG)
* Sample code (Lambda handlers)
* Deployment instructions
* Test scripts
snippets/
repository where you can find code snippets for various AWS services and use cases.
screenshots/
repository where you can find screenshots as assets for the thesis.
terraform/
repository where you can find terraform for showcasing as mentioned in thesis.

front-end/
repository where you can find the front-end which is not working with aws stack due to CORS problems.

Each phase comes with:

* A CloudFormation template (`template.yaml`)
* Mermaid + PNG architecture diagrams (`.mmd`, `.png`)
* Example Lambda code and integration points
* Step-by-step instructions in subfolder README files

---

## Getting Started

### Prerequisites

* **AWS CLI v2** (configured with sufficient IAM permissions)
* **Node.js v20+** (if using the Next.js frontend)
* **PowerShell** or Bash/zsh for CLI operations
* Optional: Terraform (for alternate deployments)

   See subfolder READMEs for specific commands.
4. **Inspect outputs**: Find API endpoints, User Pool IDs, resource names in AWS Console or via CLI.
5. **Extend as needed**: Add triggers (API Gateway, S3, EventBridge), integrate with CI/CD, or plug in your own code.

---

## What’s Included

* **Reference Architectures:** Startup → Scale-Up → Enterprise, with easy upgrade path.
* **IaC Templates:** All infrastructure is described using CloudFormation/SAM for repeatability.
* **Documentation:** Step-by-step instructions, visual diagrams, parameter descriptions, and test scripts.
* **Sample Code:** Lambda handler samples (Python), ready to be customized.

---

## Why This Repository?

* **Real-world-tested:** Based on challenges and lessons learned at Vertice, including log visibility, canary deployments, analytics performance, and vendor lock-in.
* **Adaptable:** Start simple and scale up as requirements grow.
* **Educational:** Meant as a learning tool for engineers, students, and teams entering the world of serverless.

---

## Further Reading

For detailed explanations, see the thesis text in `/docs/`, or individual READMEs in each phase folder:

* [`cloudformation/startup/README.md`](cloudformation/startup/README.md)
* [`cloudformation/scale-up/README.md`](cloudformation/scale-up/README.md)
* [`cloudformation/enterprise/README.md`](cloudformation/enterprise/README.md)

Architecture diagrams (`.mmd`, `.png`) in each folder help visualize the deployed stack.

---


## License

MIT License.
Feel free to fork, adapt, or use these templates for research, prototyping, or production—contributions welcome!

---

**Keywords:**
serverless, AWS, cloud computing, infrastructure as code, sustainability, architecture, automation, DevOps, microservices, Vertice, SaaS, best practices

---
