import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import col, when, lit
from awsglue.dynamicframe import DynamicFrame

## @params: [JOB_NAME, SOURCE_S3_PATH, TARGET_S3_PATH, DISCOUNT_RATE]
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'SOURCE_S3_PATH', 'TARGET_S3_PATH', 'DISCOUNT_RATE'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Source and Target paths from job parameters
source_s3_path = args['SOURCE_S3_PATH'] # e.g., "s3://your-source-bucket-name/product_data/"
target_s3_path = args['TARGET_S3_PATH'] # e.g., "s3://your-target-bucket-name/transformed_product_data/"
discount_rate = float(args['DISCOUNT_RATE'])

# Read data from source S3 - reading all CSVs under the prefix
datasource0 = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [source_s3_path], "recurse": True},
    format="csv",
    format_options={"withHeader": True, "inferSchema": True}
)

# Convert DynamicFrame to Spark DataFrame for easier manipulation
df = datasource0.toDF()

if df.count() > 0:
    # Transformation 1: Filter out products with stock <= 0
    df_in_stock = df.filter(col("stock").cast("int") > 0)

    # Transformation 2: Add a discounted_price column
    # Ensure price is treated as a double for calculation
    df_transformed = df_in_stock.withColumn(
        "discounted_price",
        (col("price").cast("double") * (1 - discount_rate)).cast("decimal(10,2)") # Format to 2 decimal places
    )
    
    # Transformation 3: Add a processed_timestamp column
    from pyspark.sql.functions import current_timestamp
    df_final = df_transformed.withColumn("etl_processed_at", current_timestamp())

    # Convert back to DynamicFrame
    transformed_dynamic_frame = glueContext.write_dynamic_frame.from_options(
        frame=DynamicFrame.fromDF(df_final, glueContext, "transformed_df"),
        connection_type="s3",
        connection_options={"path": target_s3_path},
        format="parquet" # Writing output in Parquet format
    )
else:
    print(f"No data found in {source_s3_path}. Skipping transformation.")

job.commit()