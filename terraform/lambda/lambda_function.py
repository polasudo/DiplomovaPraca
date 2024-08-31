import json
import boto3
from uuid import uuid4
# POST
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

def lambda_handler(event, context):
    try:
        # Parse the body of the request
        body = json.loads(event['body'])

        # Generate a random item ID
        item_id = str(uuid4())
        item_name = body.get('name', 'default_name')
        item_description = body.get('description', 'default_description')
        random_value = body.get('value', 'default_value')

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
            "body": json.dumps({ "message": "Item inserted successfully", "id": item_id })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) })
        }


# {
#     "body": "{\"name\": \"Sample Item\", \"description\": \"This is a test item\", \"value\": \"12345\"}"
# }
