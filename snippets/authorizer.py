import json
import jwt

def lambda_handler(event, context):
    token = event['authorizationToken']
    method_arn = event['methodArn']

    try:
        decoded = jwt.decode(token, 'YOUR_SECRET', algorithms=['HS256'])
        principal_id = decoded['user']

        policy = generate_policy(principal_id, 'Allow', method_arn)
        return policy

    except Exception as e:
        print(f"Error decoding token: {e}")
        raise Exception('Unauthorized')

def generate_policy(principal_id, effect, resource):
    auth_response = {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [{
                'Action': 'execute-api:Invoke',
                'Effect': effect,
                'Resource': resource
            }]
        }
    }
    return auth_response
