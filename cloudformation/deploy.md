to deploy startup stack u can use this command: 
aws cloudformation deploy `
  --template-file template.yaml `
  --stack-name AdvancedBackendStack `
  --parameter-overrides ProjectName=SimpleBackendResources `
  --capabilities CAPABILITY_NAMED_IAM


  to deploy scale-up:

