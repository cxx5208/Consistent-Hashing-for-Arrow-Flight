import pyarrow.flight as flight
import pyarrow as pa
import boto3
from botocore.exceptions import ClientError
import io
class S3FlightServer(flight.FlightServerBase):
    def __init__(self, host="0.0.0.0", port=8816 ):
        print("Initializing Flight Server...")
        super().__init__(location=flight.Location.for_grpc_tcp(host, port))
        self.s3_client = boto3.client('s3', region_name='us-west-1', aws_access_key_id="AKIASR5UWL2YRXUX2JPY", aws_secret_access_key="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")

    def do_get(self, context, ticket):
        try:
            file_info = ticket.ticket.decode('utf-8').split(',')
            bucket_name = file_info[0]
            object_name = file_info[1]
            print('at do-get')
            print(bucket_name)
            print(object_name)
            s3_response = self.s3_client.get_object(Bucket=bucket_name, Key=object_name)
            file_stream = s3_response['Body'].read()

            reader = pa.ipc.open_stream(io.BytesIO(file_stream))
            return flight.GeneratorStream(reader.schema, self.yield_batches(reader))
        except ClientError as e:
            print(f"Error fetching file from S3: {e}")
            raise flight.FlightUnavailableError(f"Could not fetch file: {object_name}")

    def yield_batches(self, reader):
        for batch in reader:
            yield batch

def main():
    print("Starting Arrow Flight server on port 8816...")
    server = S3FlightServer(host="0.0.0.0", port=8816, s3_region='us-west-1', access_key="your_access_key", secret_key="your_secret_key")
    server.serve()

if __name__ == "__main__":
    main()