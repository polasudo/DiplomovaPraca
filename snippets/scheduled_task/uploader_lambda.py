import json
import boto3
import os
from datetime import datetime
import uuid

s3_client = boto3.client('s3')

# Environment variables from SAM template
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
SOURCE_DATA_PREFIX = os.environ.get('SOURCE_DATA_PREFIX', 'raw_data/')

def lambda_handler(event, context):
    """
    Generates sample data and uploads it to S3.
    Triggered by EventBridge schedule.
    """
    if not BUCKET_NAME:
        print("Error: S3_BUCKET_NAME environment variable not set.")
        return {'statusCode': 500, 'body': json.dumps({'error': 'S3_BUCKET_NAME not configured'})}

    try:
        # Generate some sample data
        current_time = datetime.now()
        data_id = str(uuid.uuid4())
        
        sample_data = {
            "eventId": data_id,
            "timestamp": current_time.isoformat(),
            "source": "DataUploaderLambda",
            "payload": {
                "value1": 123.45,
                "value2": "example_string",
                "items": [1, 2, 3, 4, 5],
                "metadata": {"version": "1.0", "status": "new"}
            }
        }
        
        file_content = json.dumps(sample_data, indent=2)
        
        # Create a unique filename
        file_name = f"{current_time.strftime('%Y-%m-%d-%H-%M-%S')}-{data_id}.json"
        s3_key = f"{SOURCE_DATA_PREFIX.rstrip('/')}/{file_name}"
        
        print(f"Uploading data to S3 Bucket: {BUCKET_NAME}, Key: {s3_key}")
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType='application/json'
        )
        
        print(f"Successfully uploaded {s3_key} to {BUCKET_NAME}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data uploaded successfully!',
                'bucket': BUCKET_NAME,
                'key': s3_key
            })
        }

    except Exception as e:
        print(f"Error uploading data: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
