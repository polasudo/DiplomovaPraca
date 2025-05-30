import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('example-table')

def lambda_handler(event, context):
    try:
        # Check if 'id' is present in path parameters
        path_parameters = event.get('pathParameters')
        item_id = path_parameters.get('id') if path_parameters else None
        
        if item_id:
            # Fetch a single item if 'id' is provided
            response = table.get_item(Key={'id': item_id})
            item = response.get('Item')

            if item:
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps(item)
                }
            else:
                return {
                    "statusCode": 404,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps({"message": "Item not found"})
                }
        else:
            # If no 'id' is provided, return all items
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
                "body": json.dumps(items)
            }

    except Exception as e:
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
