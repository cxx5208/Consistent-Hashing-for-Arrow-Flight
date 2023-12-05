import pyarrow.flight as flight
import pyarrow as pa
import pyarrow.csv as csv
import time
class ArrowFlightClient:

    def __init__(self, server_url="grpc://localhost:8815"):
        self.client = flight.FlightClient(server_url)

    def get_data(self, bucket_name, file_name, local_arrow_file_path):
        ticket = flight.Ticket(f"{bucket_name},{file_name}".encode('utf-8'))

        try:
            reader = self.client.do_get(ticket)
            data = reader.read_all()

            if not isinstance(data, pa.Table):
                raise ValueError("Data is not in Arrow format")

            csv_file_path = local_arrow_file_path.replace('.arrow', '.csv')
            with open(csv_file_path, 'wb') as csv_file:
                csv.write_csv(data, csv_file)

            return csv_file_path
        except Exception as e:
            print(f"Error retrieving and converting file: {e}")
            return None
    def download_file(self):
            start_time = time.time()
            file_name = '02-14-2018.arrow'
            bucket_name = 'box-office-team-infinite-loop'
            ticket = flight.Ticket(f"{bucket_name},{file_name}".encode('utf-8'))
            reader = self.client.do_get(ticket)
            data = reader.read_all()
            end_time = time.time()
            return end_time - start_time
def main():
    client = ArrowFlightClient()

    bucket_name = "example-bucket"
    file_name = "example.arrow"
    data = client.get_data(bucket_name, file_name)
    if data:
        print("Retrieved data:")
        print(data)

if __name__ == "__main__":
    main()