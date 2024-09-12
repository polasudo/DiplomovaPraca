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
                        "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    },
                "body": json.dumps({"error": "id is required to update an item"})
            }
        
        # Check if there is at least one field to update
        if not any(field in body for field in ['name', 'description', 'value']):
            return {
                "statusCode": 400,
                "headers": {
                        "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    },
                "body": json.dumps({"error": "No fields to update"})
            }
        
        # Update item attributes
        update_expression = "set"
        expression_attribute_values = {}
        
        if 'name' in body:
            update_expression += " #name = :name,"
            expression_attribute_values[":name"] = body['name']
        if 'description' in body:
            update_expression += " description = :description,"
            expression_attribute_values[":description"] = body['description']
        if 'value' in body:
            update_expression += " #value = :value,"
            expression_attribute_values[":value"] = body['value']
        
        # Remove the trailing comma from the update expression
        update_expression = update_expression.rstrip(',')

        # Define the attribute names to update
        expression_attribute_names = {
            "#name": "name",
            "#value": "value"
        }

        # Perform the update operation
        response = table.update_item(
            Key={'id': item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="UPDATED_NEW"
        )
        
        return {
            "statusCode": 200,
            "headers": {
                        "Access-Control-Allow-Origin": "*",  # Allow all origins (adjust as needed)
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Content-Type": "application/json"
                    },
            "body": json.dumps({
                "message": "Item updated successfully",
                "updatedAttributes": response.get('Attributes')
            })
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
