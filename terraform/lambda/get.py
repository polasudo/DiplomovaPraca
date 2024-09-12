import json
import boto3
import logging

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    try:
        # Scan the entire DynamoDB table
        response = table.scan()
        items = response.get('Items', [])

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            "body": json.dumps(items)  # Ensure body is a string
        }

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
