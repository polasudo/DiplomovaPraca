import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Orders')

def query_orders(user_id):
    response = table.query(
        KeyConditionExpression=Key('userId').eq(user_id)
    )
    return response['Items']

orders = query_orders('user-123')
print(orders)
