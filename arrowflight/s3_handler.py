from dotenv import load_dotenv

load_dotenv()
import logging
import boto3
from botocore.exceptions import ClientError
import os
import time

class S3Handler:
    def __init__(self, access_key, secret_key, region):
        self.s3_client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)
    
    def create_bucket(self,bucket_name,region='us-west-1'):
        print('created buckettttt')
        try:
            print('created bucket')
            if(region is None):
                self.s3_client.create_bucket(Bucket=bucket_name)
            else:
                location = {'LocationConstraint':region}
                self.s3_client.create_bucket(Bucket=bucket_name,CreateBucketConfiguration=location)
            
        except ClientError as e:
                logging.error(e)
                return 'false'
        return 'true'
        
    def upload_file(self,file_name, bucket, object_name=None):
        print('at upload file')
        if object_name is None:
            object_name = os.path.basename(file_name)
       
        try:
            response = self.s3_client.upload_file(file_name, bucket, object_name)
            print('uploaded file')
        except ClientError as e:
            logging.error(e)
            return False
        return True
    def upload_file_object(self, file_object, bucket, object_name):
        print('at upload file object')
        try:
           
            self.s3_client.upload_fileobj(file_object, bucket, object_name)
            print('uploaded file object')
        except ClientError as e:
            logging.error(e)
            return False
        return True
    def copy_files_to_bucket(self, src_bucket, dest_bucket, files):
        for file in files:
            self.copy_file(src_bucket, dest_bucket, file)
            if self.check_file_exists(dest_bucket, file):
                self.delete_file(src_bucket, file)
                
        
        print(f"copied successfully")
    def copy_file(self, src_bucket, dest_bucket, file_name):
        copy_source = {'Bucket': src_bucket, 'Key': file_name}
        self.s3_client.copy(copy_source, dest_bucket, file_name)
        
    def check_file_exists(self, bucket, file_name):
        try:
            self.s3_client.head_object(Bucket=bucket, Key=file_name)
            return True
        except ClientError:
            return False

    def delete_file(self, bucket, file_name):
        self.s3_client.delete_object(Bucket=bucket, Key=file_name)
        
    def get_all_file_names(self, bucket_name):
        print('getting all file names')
        print(bucket_name)  
       
        response = self.s3_client.list_objects_v2(Bucket=bucket_name)

        file_names = [obj['Key'] for obj in response.get('Contents', [])]

        return file_names
    def download_file_from_s3(self):
        bucket_name = 'box-office-team-infinite-loop'
        file_name = '02-14-2018.csv'
        start_time = time.time()
        self.s3_client.download_file(bucket_name, file_name, file_name)
        end_time = time.time()
        return end_time - start_time
    
    def delete_bucket(self, bucket_name):
        # Empty the bucket by deleting all objects
        try:
            # List all objects in the bucket
            response = self.s3_client.list_objects_v2(Bucket=bucket_name)
            objects = response.get('Contents', [])

            # Delete each object
            for obj in objects:
                self.s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])

            # Once all objects are deleted, delete the bucket
            self.s3_client.delete_bucket(Bucket=bucket_name)
            print(f"Bucket '{bucket_name}' deleted successfully.")
            return True
        except ClientError as e:
            print(f"Error occurred while deleting bucket '{bucket_name}': {e}")
            return False


        
