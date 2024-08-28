import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

def lambda_handler(event, context):
    try:
        # Parse the body of the request
        body = json.loads(event.get('body', '{}'))
        
        # Check if an 'id' is provided in the request body
        item_id = body.get('id')
        
        if item_id:
            # If 'id' is provided, get the specific item from the table
            response = table.get_item(Key={'id': item_id})
            item = response.get('Item')

            if item:
                return {
                    "statusCode": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps(item)
                }
            else:
                return {
                    "statusCode": 404,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps({"message": "Item not found"})
                }
        else:
            # If no 'id' is provided, scan the entire table
            response = table.scan()
            items = response.get('Items', [])
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps(items)
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                        "Content-Type": "application/json"
                    },
            "body": json.dumps({"error": str(e)})
        }
