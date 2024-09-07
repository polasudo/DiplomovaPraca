provider "aws" {
  region = "eu-central-1"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role_testing_part" {
  name = "lambda_role_testing_part"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda to interact with DynamoDB
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  description = "Policy for Lambda to interact with DynamoDB"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:DeleteItem"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:dynamodb:eu-central-1:944769655596:table/example-table"
      }
    ]
  })
}

# Attach policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attach" {
  role       = aws_iam_role.lambda_role_testing_part.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

# POST Lambda function
resource "aws_lambda_function" "example_lambda_post_part" {
  function_name = "lambda_post_function"
  handler       = "post.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "post.zip"
  source_code_hash = filebase64sha256("post.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

# GET all items Lambda function
resource "aws_lambda_function" "example_lambda_get_part" {
  function_name = "lambda_get_function"
  handler       = "get.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "get.zip"
  source_code_hash = filebase64sha256("get.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

# GET by ID Lambda function
resource "aws_lambda_function" "example_lambda_get_by_id_part" {
  function_name = "lambda_get_by_id_function"
  handler       = "get_by_id.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "get_by_id.zip"
  source_code_hash = filebase64sha256("get_by_id.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

# PUT Lambda function
resource "aws_lambda_function" "example_lambda_put_part" {
  function_name = "lambda_put_function"
  handler       = "put.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "put.zip"
  source_code_hash = filebase64sha256("put.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

# DELETE Lambda function
resource "aws_lambda_function" "example_lambda_delete_part" {
  function_name = "lambda_delete_function"
  handler       = "delete.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "delete.zip"
  source_code_hash = filebase64sha256("delete.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "example_lambda_try_part" {
  name        = "example_lambda_try_part_api"
  description = "example_lambda_try_part API Gateway for Lambda"
}

# POST resource
resource "aws_api_gateway_resource" "example_lambda_post_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "post_example_lambda_try_part"
}

# GET resource
resource "aws_api_gateway_resource" "example_lambda_get_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "get_example_lambda_try_part"
}

# GET by ID resource
resource "aws_api_gateway_resource" "example_lambda_get_part_id" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_resource.example_lambda_get_part.id
  path_part   = "{id}"
}

# PUT resource
resource "aws_api_gateway_resource" "example_lambda_put_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "put_example_lambda_try_part"
}

# DELETE resource
resource "aws_api_gateway_resource" "example_lambda_delete_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "delete_example_lambda_try_part"
}

# POST method
resource "aws_api_gateway_method" "example_lambda_post_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_post_part.id
  http_method   = "POST"
  authorization = "NONE"
}

# GET all items method
resource "aws_api_gateway_method" "example_lambda_get_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_get_part.id
  http_method   = "GET"
  authorization = "NONE"
}

# GET by ID method
resource "aws_api_gateway_method" "example_lambda_get_part_id" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_get_part_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.id" = true
  }
}

# PUT method
resource "aws_api_gateway_method" "example_lambda_put_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_put_part.id
  http_method   = "PUT"
  authorization = "NONE"
}

# DELETE method
resource "aws_api_gateway_method" "example_lambda_delete_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_delete_part.id
  http_method   = "DELETE"
  authorization = "NONE"
}

# Integration for POST method
resource "aws_api_gateway_integration" "example_lambda_post_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_post_part.id
  http_method = aws_api_gateway_method.example_lambda_post_part.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.example_lambda_post_part.invoke_arn
}

# Integration for GET method (all items)
resource "aws_api_gateway_integration" "example_lambda_get_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part.id
  http_method = aws_api_gateway_method.example_lambda_get_part.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.example_lambda_get_part.invoke_arn
}

# Integration for GET by ID method
resource "aws_api_gateway_integration" "example_lambda_get_part_id" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part_id.id
  http_method = aws_api_gateway_method.example_lambda_get_part_id.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.example_lambda_get_by_id_part.invoke_arn
}

# Integration for PUT method
resource "aws_api_gateway_integration" "example_lambda_put_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_put_part.id
  http_method = aws_api_gateway_method.example_lambda_put_part.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.example_lambda_put_part.invoke_arn
}

# Integration for DELETE method
resource "aws_api_gateway_integration" "example_lambda_delete_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_delete_part.id
  http_method = aws_api_gateway_method.example_lambda_delete_part.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.example_lambda_delete_part.invoke_arn
}

# Method Response for POST
resource "aws_api_gateway_method_response" "post_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_post_part.id
  http_method = aws_api_gateway_method.example_lambda_post_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Method Response for GET (all items)
resource "aws_api_gateway_method_response" "get_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part.id
  http_method = aws_api_gateway_method.example_lambda_get_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Method Response for GET by ID
resource "aws_api_gateway_method_response" "get_by_id_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part_id.id
  http_method = aws_api_gateway_method.example_lambda_get_part_id.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Method Response for PUT
resource "aws_api_gateway_method_response" "put_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_put_part.id
  http_method = aws_api_gateway_method.example_lambda_put_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Method Response for DELETE
resource "aws_api_gateway_method_response" "delete_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_delete_part.id
  http_method = aws_api_gateway_method.example_lambda_delete_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "example_lambda_try_part" {
  depends_on = [
    aws_api_gateway_integration.example_lambda_post_part,
    aws_api_gateway_integration.example_lambda_get_part,
    aws_api_gateway_integration.example_lambda_get_part_id,
    aws_api_gateway_integration.example_lambda_put_part,
    aws_api_gateway_integration.example_lambda_delete_part
  ]

  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  stage_name  = "v1"
}

# DynamoDB Table
resource "aws_dynamodb_table" "example" {
  name         = "example-table"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "description"
    type = "S"
  }

  hash_key = "id"

  global_secondary_index {
    name            = "name-index"
    hash_key        = "name"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "description-index"
    hash_key        = "description"
    projection_type = "ALL"
  }

  tags = {
    Name        = "example-table"
    Environment = "dev"
  }
}
