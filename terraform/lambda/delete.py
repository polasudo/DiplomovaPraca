import json
import os
import boto3

# Fetch the table name from the environment variable
dynamodb = boto3.resource('dynamodb')
table_name = 'example-table'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        item_id = body.get('id')

        if not item_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"error": "id is required to delete an item"})
            }

        response = table.delete_item(
            Key={'id': item_id},
            ReturnValues="ALL_OLD"
        )

        if 'Attributes' in response:
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "message": "Item deleted successfully",
                    "deletedItem": response['Attributes']
                })
            }
        else:
            return {
                "statusCode": 404,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"error": "Item not found"})
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
