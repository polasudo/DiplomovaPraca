provider "aws" {
  region = "eu-central-1"
}

resource "aws_iam_role" "lambda_role_testing_part" {
  name = "lambda_role_testing_part"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  description = "Policy for Lambda to interact with DynamoDB"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Scan"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:dynamodb:eu-central-1:944769655596:table/example-table"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attach" {
  role       = aws_iam_role.lambda_role_testing_part.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

resource "aws_lambda_function" "example_lambda_try_part" {
  function_name = "example_lambda_try_part_lambda_function"
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "main.zip"

  source_code_hash = filebase64sha256("main.zip")

  environment {
    variables = {
      example_lambda_try_part_ENV_VARIABLE = "dev"
      DYNAMODB_TABLE_NAME                  = "example-table"
    }
  }
}

resource "aws_lambda_function" "example_lambda_get_part" {
  function_name = "example_lambda_get_part_lambda_function"
  handler       = "lambda_get_function.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "lambda_get_function.zip"

  source_code_hash = filebase64sha256("lambda_get_function.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "example-table"
    }
  }
}

resource "aws_api_gateway_rest_api" "example_lambda_try_part" {
  name        = "example_lambda_try_part_api"
  description = "example_lambda_try_part API Gateway for Lambda"
}

resource "aws_api_gateway_resource" "example_lambda_try_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "example_lambda_try_part"
}

resource "aws_api_gateway_resource" "example_lambda_get_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  parent_id   = aws_api_gateway_rest_api.example_lambda_try_part.root_resource_id
  path_part   = "get_example_lambda_try_part"
}

resource "aws_api_gateway_method" "example_lambda_try_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_try_part.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "example_lambda_get_part" {
  rest_api_id   = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id   = aws_api_gateway_resource.example_lambda_get_part.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "example_lambda_try_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_try_part.id
  http_method = aws_api_gateway_method.example_lambda_try_part.http_method

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.example_lambda_try_part.invoke_arn
}

resource "aws_api_gateway_integration" "example_lambda_get_part" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part.id
  http_method = aws_api_gateway_method.example_lambda_get_part.http_method

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.example_lambda_get_part.invoke_arn
}

resource "aws_lambda_permission" "example_lambda_try_part" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.example_lambda_try_part.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.example_lambda_try_part.execution_arn}/*/${aws_api_gateway_method.example_lambda_try_part.http_method}${aws_api_gateway_resource.example_lambda_try_part.path}"
}

resource "aws_lambda_permission" "example_lambda_get_part" {
  statement_id  = "AllowAPIGatewayInvokeGet"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.example_lambda_get_part.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.example_lambda_try_part.execution_arn}/*/${aws_api_gateway_method.example_lambda_get_part.http_method}${aws_api_gateway_resource.example_lambda_get_part.path}"
}

resource "aws_api_gateway_method_response" "respone_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_try_part.id
  http_method = aws_api_gateway_method.example_lambda_try_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_method_response" "get_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part.id
  http_method = aws_api_gateway_method.example_lambda_get_part.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_try_part.id
  http_method = aws_api_gateway_method.example_lambda_try_part.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.example_lambda_try_part
  ]
}

resource "aws_api_gateway_integration_response" "get_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  resource_id = aws_api_gateway_resource.example_lambda_get_part.id
  http_method = aws_api_gateway_method.example_lambda_get_part.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.example_lambda_get_part
  ]
}

resource "aws_api_gateway_deployment" "example_lambda_try_part" {
  depends_on = [
    aws_api_gateway_integration.example_lambda_try_part,
    aws_api_gateway_method_response.respone_200,
    aws_api_gateway_integration_response.integration_response_200,
    aws_api_gateway_integration.example_lambda_get_part,
    aws_api_gateway_method_response.get_response_200,
    aws_api_gateway_integration_response.get_integration_response_200
  ]

  rest_api_id = aws_api_gateway_rest_api.example_lambda_try_part.id
  stage_name  = "v1"
}

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
    name               = "name-index"
    hash_key           = "name"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "description-index"
    hash_key           = "description"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "example-table"
    Environment = "dev"
  }
}
