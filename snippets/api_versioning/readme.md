**Overview**

This AWS Serverless Application Model (SAM) template defines:

* An API Gateway REST API (`AWS::Serverless::Api`).
* Two Lambda functions (`AWS::Serverless::Function`):

  * A **Prod** version with alias `prod`.
  * A **Canary** version with alias `canary`.
* Canary deployment settings on the API stage, routing a percentage of traffic to the canary alias.
* Stage variables to switch between the `prod` and `canary` aliases without changing the integration URI directly.
* Lambda permissions on both aliases so API Gateway can invoke them.

The result is a fully automated canary rollout for the `/hello` endpoint, controlled by a single CloudFormation/SAM deployment.

---

## Parameters

| Parameter         | Type   | Default | Description                               |
| ----------------- | ------ | ------- | ----------------------------------------- |
| **ApiVersion**    | String | `v1`    | API version; also used as the stage name. |
| **CanaryPercent** | Number | `10`    | Percent of traffic routed to canary.      |

These parameters can be overridden at deployment time:

```bash
sam deploy \
  --parameter-overrides ApiVersion=prod CanaryPercent=20
```

---

## Resources

### 1. `ApiGateway` (`AWS::Serverless::Api`)

* **Name**: `MyApi-<ApiVersion>`
* **StageName**: `<ApiVersion>`
* **Stage Variables**:

  * `lambdaFunction`: `<FunctionName>` (alias base name)
  * `lambdaAlias`: `prod` or `canary`
* **MethodSettings**: Enables `INFO`-level logging and data tracing for all methods.
* **CanarySetting**:

  * `PercentTraffic`: driven by the `CanaryPercent` parameter.
  * Overrides:

    * `lambdaFunction` → points to `CanaryFunction-<ApiVersion>`.
    * `lambdaAlias` → `canary`.
* **DefinitionBody**: A basic Swagger spec exposing a `GET /hello` path with an AWS\_PROXY integration. The integration URI is built with a `Fn::Join` or `!Sub` to insert the stage variables into the ARN:

  ```yaml
  uri: !Sub |
    arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31
    /functions/arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${stageVariables.lambdaFunction}:${stageVariables.lambdaAlias}/invocations
  ```

### 2. Prod Lambda (`ProdFunction`, `ProdFunctionVersion`, `ProdAlias`)

* **ProdFunction** (`AWS::Serverless::Function`)

  * Runtime: Python 3.13
  * Handler: `index.handler`
  * Inline code returns a JSON greeting.
* **ProdFunctionVersion** (`AWS::Lambda::Version`)

  * Locks the current function code into a numbered version.
* **ProdAlias** (`AWS::Lambda::Alias`)

  * Alias name: `prod`
  * Points to the version created above.

### 3. Canary Lambda (`CanaryFunction`, `CanaryFunctionVersion`, `CanaryAlias`)

* Same structure as *Prod*, but inline code returns a different greeting (`👋 Hello from Canary deployment!`).
* Alias name: `canary`.

### 4. Lambda Permissions (`LambdaPermissionProd`, `LambdaPermissionCanary`)

* Grants `apigateway.amazonaws.com` permission to invoke each alias.
* Restricts to the `GET /hello` method on this specific API and stage.

```yaml
SourceArn: !Sub arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${ApiGateway}/*/GET/hello
```

---

## Outputs

* **EndpointUrl**: The full URL to call the `/hello` endpoint:

  ```text
  https://{ApiGateway}.execute-api.{Region}.amazonaws.com/{ApiVersion}/hello
  ```

---

## Usage & Deployment

1. **Validate** the template locally:

   ```bash
   sam validate --template-file template.yaml
   ```
2. **Package** (if you have external code or layers):

   ```bash
   sam package \
     --template-file template.yaml \
     --s3-bucket <your-bucket> \
     --output-template-file packaged.yaml
   ```
3. **Deploy**:

   ```bash
   sam deploy \
     --template-file packaged.yaml \
     --stack-name MyApiStack \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides ApiVersion=v1 CanaryPercent=10
   ```

To adjust the canary roll‑out percentage at any time, simply update the stack with a different `CanaryPercent` value.

---

## Canary Promotion Workflow

1. Deploy the stack with `CanaryPercent` = small value (e.g. 10).
2. Monitor logs/metrics for errors in the canary slice.
3. If healthy, update `CanaryPercent` → `0` and update stage variables so that `prod` alias uses the new function version.
4. Optionally remove canary function resources once promotion is complete.

---

*End of documentation*
