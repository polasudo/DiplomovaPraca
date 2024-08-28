import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

def lambda_handler(event, context):
    try:
        # Parse the body of the request
        body = json.loads(event.get('body', '{}'))
        
        # Check if 'id' is provided in the request body
        item_id = body.get('id')
        if not item_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"error": "id is required to delete an item"})
            }
        
        # Perform the delete operation
        response = table.delete_item(
            Key={'id': item_id},
            ReturnValues="ALL_OLD"
        )
        
        # Check if the item was actually deleted
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
