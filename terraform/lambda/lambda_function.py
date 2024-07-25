import sys
import json
from io import StringIO

def lambda_handler(event, context):
    # Get code from payload
    code = event['answer']
    test_code = code + '\nprint(sum(5,5))'
    #zachytenie vystupu
    buffer = StringIO()
    sys.stdout = buffer
    # Execute
    try:
        exec(test_code)
    except:
        return False
    # Return 
    sys.stdout = sys.stdout
    # Check
    if int(buffer.getvalue()) == 25:

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({ "message": "true"})
        }    

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({ "message": "false"})
    }
   