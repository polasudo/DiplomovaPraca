import json
import boto3
from uuid import uuid4

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

def lambda_handler(event, context):
    # Generate a random item ID
    item_id = str(uuid4())
    item_name = "example_name"
    item_description = "example_description"
    random_value = "random_value"

    # Put item into DynamoDB table
    table.put_item(
        Item={
            'id': item_id,
            'name': item_name,
            'description': item_description,
            'value': random_value
        }
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({ "message": "Item inserted successfully"})
    }
