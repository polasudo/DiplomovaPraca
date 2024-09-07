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
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:DeleteItem" # Added DeleteItem permission
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

# POST
resource "aws_lambda_function" "post_function" {
  function_name = "post"
  handler       = "post.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "post.zip"

  source_code_hash = filebase64sha256("post.zip")

  environment {
    variables = {
      post_function_ENV_VARIABLE = "dev"
      DYNAMODB_TABLE_NAME                  = "example-table"
    }
  }
}

# GET
resource "aws_lambda_function" "get_function" {
  function_name = "get"
  handler       = "get.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.lambda_role_testing_part.arn

  filename = "get.zip"

  source_code_hash = filebase64sha256("get.zip")

  environment {
    variables = {
      DYNAMODB_TABLE_NAME                  = "example-table"
      post_function_ENV_VARIABLE = "dev"
    }
  }
}

# GET BY ID
resource "aws_lambda_function" "get_by_id_function" {
  function_name = "get_by_id_function_function"
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


# PUT
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

# DELETE
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

resource "aws_api_gateway_rest_api" "post_function" {
  name        = "post_function_api"
  description = "post_function API Gateway for Lambda"
}

# POST
resource "aws_api_gateway_resource" "post_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  parent_id   = aws_api_gateway_rest_api.post_function.root_resource_id
  path_part   = "post_function"
}

# GET
resource "aws_api_gateway_resource" "get_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  parent_id   = aws_api_gateway_rest_api.post_function.root_resource_id
  path_part   = "get_post_function"
}

# GET BY ID
resource "aws_api_gateway_resource" "get_by_id_function" {
  rest_api_id = aws_api_gateway_rest_api.lambda_api.id
  parent_id   = aws_api_gateway_rest_api.lambda_api.root_resource_id
  path_part   = "{id}" 
}
# PUT
resource "aws_api_gateway_resource" "put_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  parent_id   = aws_api_gateway_rest_api.post_function.root_resource_id
  path_part   = "put_post_function"
}

# New API Gateway resource for DELETE request
resource "aws_api_gateway_resource" "delete_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  parent_id   = aws_api_gateway_rest_api.post_function.root_resource_id
  path_part   = "delete_post_function"
}

resource "aws_api_gateway_method" "post_function" {
  rest_api_id   = aws_api_gateway_rest_api.post_function.id
  resource_id   = aws_api_gateway_resource.post_function.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "get_function" {
  rest_api_id   = aws_api_gateway_rest_api.post_function.id
  resource_id   = aws_api_gateway_resource.get_function.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "put_function" {
  rest_api_id   = aws_api_gateway_rest_api.post_function.id
  resource_id   = aws_api_gateway_resource.put_function.id
  http_method   = "PUT"
  authorization = "NONE"
}

# New API Gateway method for DELETE request
resource "aws_api_gateway_method" "delete_function" {
  rest_api_id   = aws_api_gateway_rest_api.post_function.id
  resource_id   = aws_api_gateway_resource.delete_function.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.post_function.id
  http_method = aws_api_gateway_method.post_function.http_method

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.post_function.invoke_arn
}

resource "aws_api_gateway_integration" "get_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.get_function.id
  http_method = aws_api_gateway_method.get_function.http_method

  integration_http_method = "POST" # POST to invoke Lambda
  type                    = "AWS"
  uri                     = aws_lambda_function.get_function.invoke_arn
}

resource "aws_api_gateway_integration" "put_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.put_function.id
  http_method = aws_api_gateway_method.put_function.http_method

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.put_function.invoke_arn
}

# New API Gateway integration for DELETE request
resource "aws_api_gateway_integration" "delete_function" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.delete_function.id
  http_method = aws_api_gateway_method.delete_function.http_method

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.delete_function.invoke_arn
}

resource "aws_lambda_permission" "post_function" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.post_function.execution_arn}/*/${aws_api_gateway_method.post_function.http_method}${aws_api_gateway_resource.post_function.path}"
}

resource "aws_lambda_permission" "get_function" {
  statement_id  = "AllowAPIGatewayInvokeGet"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.post_function.execution_arn}/*/${aws_api_gateway_method.get_function.http_method}${aws_api_gateway_resource.get_function.path}"
}

resource "aws_lambda_permission" "put_function" {
  statement_id  = "AllowAPIGatewayInvokePut"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.put_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.post_function.execution_arn}/*/${aws_api_gateway_method.put_function.http_method}${aws_api_gateway_resource.put_function.path}"
}

# New Lambda permission for DELETE request
resource "aws_lambda_permission" "delete_function" {
  statement_id  = "AllowAPIGatewayInvokeDelete"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.post_function.execution_arn}/*/${aws_api_gateway_method.delete_function.http_method}${aws_api_gateway_resource.delete_function.path}"
}

resource "aws_api_gateway_method_response" "respone_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.post_function.id
  http_method = aws_api_gateway_method.post_function.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_method_response" "get_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.get_function.id
  http_method = aws_api_gateway_method.get_function.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_method_response" "put_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.put_function.id
  http_method = aws_api_gateway_method.put_function.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# New method response for DELETE request
resource "aws_api_gateway_method_response" "delete_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.delete_function.id
  http_method = aws_api_gateway_method.delete_function.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.post_function.id
  http_method = aws_api_gateway_method.post_function.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.post_function
  ]
}

resource "aws_api_gateway_integration_response" "get_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.get_function.id
  http_method = aws_api_gateway_method.get_function.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.get_function
  ]
}

resource "aws_api_gateway_integration_response" "put_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.put_function.id
  http_method = aws_api_gateway_method.put_function.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.put_function
  ]
}

# New integration response for DELETE request
resource "aws_api_gateway_integration_response" "delete_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.post_function.id
  resource_id = aws_api_gateway_resource.delete_function.id
  http_method = aws_api_gateway_method.delete_function.http_method
  status_code = "200"

  depends_on = [
    aws_api_gateway_integration.delete_function
  ]
}

resource "aws_api_gateway_deployment" "post_function" {
  depends_on = [
    aws_api_gateway_integration.post_function,
    aws_api_gateway_method_response.respone_200,
    aws_api_gateway_integration_response.integration_response_200,
    aws_api_gateway_integration.get_function,
    aws_api_gateway_method_response.get_response_200,
    aws_api_gateway_integration_response.get_integration_response_200,
    aws_api_gateway_integration.put_function,
    aws_api_gateway_method_response.put_response_200,
    aws_api_gateway_integration_response.put_integration_response_200,
    aws_api_gateway_integration.delete_function,
    aws_api_gateway_method_response.delete_response_200,
    aws_api_gateway_integration_response.delete_integration_response_200
  ]

  rest_api_id = aws_api_gateway_rest_api.post_function.id
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