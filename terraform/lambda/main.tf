provider "aws" {
  region = "eu-central-1"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role_testing_part" {
  name = "lambda_role_testing_part"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
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

# IAM Policy for DynamoDB
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

# Attach policy to the IAM role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attach" {
  role       = aws_iam_role.lambda_role_testing_part.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

# Lambda Functions for CRUD Operations

resource "aws_lambda_function" "post_function" {
  function_name = "post"
  handler       = "post.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "post.zip"
  source_code_hash = filebase64sha256("post.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
      post_function_ENV_VARIABLE = "dev"
    }
  }
}

resource "aws_lambda_function" "get_function" {
  function_name = "get"
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

resource "aws_lambda_function" "get_by_id_function" {
  function_name = "get_by_id"
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

resource "aws_lambda_function" "put_function" {
  function_name = "put"
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

resource "aws_lambda_function" "delete_function" {
  function_name = "delete"
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

# HTTP API Gateway v2 Setup with CORS
resource "aws_apigatewayv2_api" "http_api" {
  name          = "HTTP API for Lambda"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]   # Allows all origins
    allow_methods = ["*"]   # Allows all methods
    allow_headers = ["*"]   # Allows all headers
    expose_headers = ["*"]  # Allows all headers to be exposed
    max_age        = 3600   # Sets the max age for preflight requests
  }
}

# Lambda Integration for HTTP API v2
resource "aws_apigatewayv2_integration" "post_function_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.post_function.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_function_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.get_function.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_by_id_function_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.get_by_id_function.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "put_function_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.put_function.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "delete_function_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.delete_function.invoke_arn
  integration_method = "POST"
}

# Routes for each function
resource "aws_apigatewayv2_route" "post_function_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /post_function"
  target    = "integrations/${aws_apigatewayv2_integration.post_function_integration.id}"
}

resource "aws_apigatewayv2_route" "get_function_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /get_function"
  target    = "integrations/${aws_apigatewayv2_integration.get_function_integration.id}"
}

resource "aws_apigatewayv2_route" "get_by_id_function_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /get_by_id/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.get_by_id_function_integration.id}"
}

resource "aws_apigatewayv2_route" "put_function_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /put_function"
  target    = "integrations/${aws_apigatewayv2_integration.put_function_integration.id}"
}

resource "aws_apigatewayv2_route" "delete_function_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /delete_function"
  target    = "integrations/${aws_apigatewayv2_integration.delete_function_integration.id}"
}

# Permissions for Lambda to be invoked by API Gateway
resource "aws_lambda_permission" "allow_post_function" {
  statement_id  = "AllowAPIGatewayInvokePost"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/POST/post_function"
}

resource "aws_lambda_permission" "allow_get_function" {
  statement_id  = "AllowAPIGatewayInvokeGet"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/GET/get_function"
}

resource "aws_lambda_permission" "allow_get_by_id_function" {
  statement_id  = "AllowAPIGatewayInvokeGetByID"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_by_id_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/GET/get_by_id/{id}"
}

resource "aws_lambda_permission" "allow_put_function" {
  statement_id  = "AllowAPIGatewayInvokePut"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.put_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/PUT/put_function"
}

resource "aws_lambda_permission" "allow_delete_function" {
  statement_id  = "AllowAPIGatewayInvokeDelete"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/DELETE/delete_function"
}

# Deploy the API Gateway HTTP API
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "v1"
  auto_deploy = true
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
