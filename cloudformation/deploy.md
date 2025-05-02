to deploy startup stack u can use this command: 
this applies for windows powershell only

aws cloudformation deploy `
  --template-file template.yaml `
  --stack-name AdvancedBackendStack `
  --parameter-overrides ProjectName=SimpleBackendResources `
  --capabilities CAPABILITY_NAMED_IAM


to deploy scale-up:
first we need to run this command 
sam build
after we need to run this command
sam deploy `
  --stack-name my-sam-stack `
  --s3-bucket deployment-bucket-for-diploma `
  --region eu-central-1 `
  --capabilities CAPABILITY_NAMED_IAM `
  --no-confirm-changeset `
  --no-fail-on-empty-changeset `
  --parameter-overrides `
    ProjectName=myProject `
    DbPasswordSecretName=MyDbSecretName