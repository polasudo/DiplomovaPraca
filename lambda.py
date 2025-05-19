import json
          import os
          import uuid
          import boto3
          from botocore.exceptions import ClientError
          from aws_lambda_powertools import Logger, Tracer, Metrics
          from aws_lambda_powertools.event_handler import APIGatewayRestResolver
          from aws_lambda_powertools.utilities.typing import LambdaContext
          from aws_lambda_powertools.logging import correlation_paths
          from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent

          # Initialize PowerTools
          logger = Logger(service="register-user")
          tracer = Tracer(service="register-user")
          metrics = Metrics(namespace="MyApp", service="register-user")

          # Initialize DynamoDB client
          dynamodb = boto3.resource('dynamodb')

          @logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
          @tracer.capture_lambda_handler
          @metrics.log_metrics(capture_cold_start_metric=True)
          def lambda_handler(event, context: LambdaContext):
              # Create API Gateway event object for easier parsing
              event_obj = APIGatewayProxyEvent(event)
              function_name = context.function_name
              
              # Log structured information
              logger.info("Function invoked", extra={
                  "function_name": function_name,
                  "request_id": context.aws_request_id
              })
              
              # Add custom annotation for X-Ray
              tracer.put_annotation(key="function_name", value=function_name)
              
              # Add business metrics
              metrics.add_metric(name="RegistrationAttempt", unit="Count", value=1)
              
              # Get the DynamoDB table name from environment variables
              customers_table_name = os.environ.get('CUSTOMERS_TABLE_NAME')
              tracer.put_metadata(key="table_name", value=customers_table_name)
              
              # Get the table resource
              table = dynamodb.Table(customers_table_name)
              
              try:
                  # Parse the request body
                  if event_obj.body:
                      request_data = json.loads(event_obj.body)
                  else:
                      return {
                          "statusCode": 400,
                          "headers": {"Content-Type": "application/json"},
                          "body": json.dumps({"error": "Missing request body"})
                      }
                  
                  # Validate required fields
                  required_fields = ['email', 'firstName', 'lastName']
                  missing_fields = [field for field in required_fields if field not in request_data]
                  
                  if missing_fields:
                      return {
                          "statusCode": 400,
                          "headers": {"Content-Type": "application/json"},
                          "body": json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"})
                      }
                  
                  # Create a subsegment for database operations
                  with tracer.capture_method():
                    # Generate a unique user ID
                      user_id = str(uuid.uuid4())
                      
                      # Prepare user data for DynamoDB
                      user_item = {
                          'userId': user_id,
                          'email': request_data['email'],
                          'firstName': request_data['firstName'],
                          'lastName': request_data['lastName'],
                          'createdAt': int(tracer.current_trace_id.split('-')[1]),  # Use trace ID timestamp as creation time
                          'updatedAt': int(tracer.current_trace_id.split('-')[1])
                      }
                      
                      # Add optional fields if present
                      if 'phoneNumber' in request_data:
                          user_item['phoneNumber'] = request_data['phoneNumber']
                      
                      # Write to DynamoDB
                      table.put_item(Item=user_item)
                      
                      # Log success and add metrics
                      logger.info("User registered successfully", extra={"userId": user_id})
                      metrics.add_metric(name="SuccessfulRegistration", unit="Count", value=1)
                      
                      # Prepare success response
                      response_body = {
                          "message": "User registered successfully",
                          "userId": user_id
                      }
              
              except ClientError as e:
                  # Handle DynamoDB errors
                  error_code = e.response['Error']['Code']
                  error_message = e.response['Error']['Message']
                  
                  logger.error("DynamoDB error", extra={
                      "error_code": error_code,
                      "error_message": error_message
                  })
                  
                  metrics.add_metric(name="DatabaseError", unit="Count", value=1)
                  
                  return {
                      "statusCode": 500,
                      "headers": {"Content-Type": "application/json"},
                      "body": json.dumps({"error": "Database operation failed"})
                  }
              
              except Exception as e:
                  # Handle general errors
                  logger.exception("Error processing registration")
                  metrics.add_metric(name="ProcessingError", unit="Count", value=1)
                  
                  return {
                      "statusCode": 500,
                      "headers": {"Content-Type": "application/json"},
                      "body": json.dumps({"error": "Internal server error"})
                  }
              
              return {
                  "statusCode": 201,  # Created
                  "headers": {
                      "Content-Type": "application/json"
                  },
                  "body": json.dumps(response_body)
              }