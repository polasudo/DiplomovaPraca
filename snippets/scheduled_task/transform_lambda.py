import json
import boto3
import os
from datetime import datetime
import urllib.parse

# Initialize S3 client only once
s3_client = boto3.client('s3')

# Environment variables
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
SOURCE_DATA_PREFIX = os.environ.get('SOURCE_DATA_PREFIX', 'raw_data/')
PROCESSED_DATA_PREFIX = os.environ.get('PROCESSED_DATA_PREFIX', 'processed_data/')

def handle_s3_record(source_bucket: str, source_key: str):
    """
    Download JSON from S3, transform it, and upload to the processed prefix.
    """
    # Download
    print(f"Downloading object: s3://{source_bucket}/{source_key}")
    obj = s3_client.get_object(Bucket=source_bucket, Key=source_key)
    body = obj['Body'].read().decode('utf-8')
    data = json.loads(body)

    # Transform
    transformed = data.copy()
    transformed['processingTimestamp'] = datetime.now().isoformat()
    transformed['status'] = 'processed'

    payload = transformed.get('payload', {})
    if 'value2' in payload:
        payload['value2'] = payload['value2'].upper()
    if isinstance(payload.get('items'), list):
        payload['items_count'] = len(payload['items'])
        payload['items_sum'] = sum(payload['items'])

    out_body = json.dumps(transformed, indent=2)

    # Compute destination key
    filename = source_key.split('/')[-1]
    dest_key = f"{PROCESSED_DATA_PREFIX.rstrip('/')}/transformed-{filename}"

    # Upload
    print(f"Uploading transformed data to s3://{BUCKET_NAME}/{dest_key}")
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=dest_key,
        Body=out_body,
        ContentType='application/json'
    )
    print(f"✅ Finished transforming and uploaded {dest_key}")

def lambda_handler(event, context):
    """
    Lambda entrypoint: detect event shape, extract bucket & key,
    and invoke handle_s3_record if prefix matches.
    """
    if not BUCKET_NAME:
        msg = "Error: S3_BUCKET_NAME environment variable not set."
        print(msg)
        return {'statusCode': 500, 'body': json.dumps({'error': msg})}

    try:
        # 1) Native S3 event (Records[].s3)
        if 'Records' in event and event['Records'][0].get('s3'):
            rec = event['Records'][0]['s3']
            bucket = rec['bucket']['name']
            key = urllib.parse.unquote_plus(rec['object']['key'], encoding='utf-8')
        # 2) EventBridge S3 event (detail.bucket & detail.object)
        elif 'detail' in event and 'bucket' in event['detail']:
            det = event['detail']
            bucket = det['bucket']['name']
            key = urllib.parse.unquote_plus(det['object']['key'], encoding='utf-8')
        else:
            print("❌ Unrecognized event format:")
            print(json.dumps(event))
            return {'statusCode': 400, 'body': json.dumps({'error': 'Bad event format'})}

        print(f"Received event for bucket={bucket}, key={key}")

        # Only process files under your raw_data/ prefix
        prefix = SOURCE_DATA_PREFIX.rstrip('/')
        if not key.startswith(prefix):
            print(f"Skipping {key}; does not start with prefix '{prefix}'.")
            return {'statusCode': 200, 'body': json.dumps({'message': 'Skipped'})}

        # Delegate to handler
        handle_s3_record(bucket, key)
        return {'statusCode': 200, 'body': json.dumps({'message': 'Success'})}

    except Exception as e:
        print(f"Error processing S3 event: {e}")
        print("Full event:", json.dumps(event))
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
