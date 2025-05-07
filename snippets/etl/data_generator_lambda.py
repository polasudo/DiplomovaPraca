import json
import boto3
import os
import csv
import io
from datetime import datetime

s3_client = boto3.client('s3')

# Environment variables that will be set by CloudFormation
SOURCE_S3_BUCKET = os.environ.get('SOURCE_S3_BUCKET')

def generate_sample_data():
    """Generates a list of sample product data."""
    data = [
        {"id": "prod101", "name": "Laptop Pro", "category": "Electronics", "price": 1200.50, "stock": 50, "last_updated": datetime.now().isoformat()},
        {"id": "prod102", "name": "Wireless Mouse", "category": "Accessories", "price": 25.99, "stock": 150, "last_updated": datetime.now().isoformat()},
        {"id": "prod103", "name": "Office Chair", "category": "Furniture", "price": 150.75, "stock": 30, "last_updated": datetime.now().isoformat()},
        {"id": "prod104", "name": "LED Monitor", "category": "Electronics", "price": 300.00, "stock": 75, "last_updated": datetime.now().isoformat()},
        {"id": "prod105", "name": "Mechanical Keyboard", "category": "Accessories", "price": 75.20, "stock": 0, "last_updated": datetime.now().isoformat()} # Example of out of stock
    ]
    return data

def lambda_handler(event, context):
    if not SOURCE_S3_BUCKET:
        print("Error: SOURCE_S3_BUCKET environment variable not set.")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'SOURCE_S3_BUCKET not configured'})
        }

    sample_products = generate_sample_data()
    
    # Create CSV in memory
    csv_buffer = io.StringIO()
    fieldnames = sample_products[0].keys()
    writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(sample_products)
    
    # Define S3 file name
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    s3_file_name = f"product_data/raw_products_{timestamp}.csv"
    
    try:
        s3_client.put_object(
            Bucket=SOURCE_S3_BUCKET,
            Key=s3_file_name,
            Body=csv_buffer.getvalue(),
            ContentType='text/csv'
        )
        message = f"Successfully uploaded {s3_file_name} to {SOURCE_S3_BUCKET}"
        print(message)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': message, 's3_uri': f"s3://{SOURCE_S3_BUCKET}/{s3_file_name}"})
        }
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    