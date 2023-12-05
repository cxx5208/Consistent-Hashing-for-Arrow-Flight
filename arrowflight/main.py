from fastapi import FastAPI, UploadFile, File
import uvicorn
from ConsistentHashRing import ConsistentHashRing
from s3_handler import S3Handler
from ArrowFlightService import S3FlightServer
from ArrowFlightClient import ArrowFlightClient
import threading
import io
import pyarrow.csv as pa_csv
import pyarrow.ipc as ipc
import pyarrow as pa
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

nodes = ["273-bucket-1", "273-bucket-2","273-bucket-3"]
hash_ring = ConsistentHashRing(nodes)

s3_handler = S3Handler(access_key="AKIASR5UWL2YRXUX2JPY", secret_key="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", region="us-west-1")

flight_server = S3FlightServer(host="0.0.0.0", port=8816)
threading.Thread(target=flight_server.serve).start()

flight_client = ArrowFlightClient("grpc://localhost:8816")

@app.post("/upload-csv/{user_id}")
async def upload_file(user_id: str, file: UploadFile = File(...)):
    content = await file.read()
    arrow_table = pa_csv.read_csv(io.BytesIO(content))

    buf = io.BytesIO()
    with pa.ipc.new_stream(buf, arrow_table.schema) as writer:
        writer.write_table(arrow_table)
    buf.seek(0)

    arrow_file_name = f"{user_id}_{file.filename}".replace('.csv', '.arrow')
    bucket_name = hash_ring.get_node(arrow_file_name)
    print(bucket_name)
    s3_handler.upload_file_object(buf, bucket_name, arrow_file_name)

    return {"message": "File uploaded successfully", "bucket": bucket_name, "file": arrow_file_name}


@app.get("/get/{user_id}/{file_name}")
def get_file(user_id: str, file_name: str):
    arrow_file_name =file_name
    bucket_name = hash_ring.get_node(file_name)

    local_arrow_file_path = f"temp_{arrow_file_name}"
    start_time = time.time()
    csv_file_path = flight_client.get_data(bucket_name, arrow_file_name, local_arrow_file_path)
    end_time = time.time()
    print(f"Time taken to retrieve file: {end_time - start_time} seconds")
    if csv_file_path:
        return FileResponse(csv_file_path, media_type='text/csv', filename=csv_file_path.split('/')[-1])
    else:
        return {"error": "File not found or could not be retrieved"}

def convert_arrow_to_dict(arrow_table):
    return arrow_table.to_pandas().to_dict(orient="records")

@app.get("/get-files/")
async def get_files():
    return s3_handler.get_all_file_names('box-office-team-infinite-loop')

@app.get("/add-bucket/{new_bucket}")
def add_bucket(new_bucket: str):
    print('adding bucket')
    print(new_bucket)
    nodes.append(new_bucket)
    hash_ring.add_node(new_bucket)
    next_bucket = hash_ring.get_next_node(new_bucket)
    print('next bucket')
    all_files = s3_handler.get_all_file_names(next_bucket)
    files_to_move = hash_ring.files_to_move(all_files, new_bucket)
    s3_handler.create_bucket(new_bucket)
    s3_handler.copy_files_to_bucket(next_bucket,new_bucket,files_to_move)
    return {"message": f"Bucket {new_bucket} added and files redistributed"}


@app.get("/remove-bucket/{removed_bucket}")
def remove_bucket(removed_bucket: str):
    next_bucket = hash_ring.remove_node(removed_bucket)

    files_to_move = s3_handler.get_all_file_names(removed_bucket)
   
    s3_handler.copy_files_to_bucket(removed_bucket, next_bucket, files_to_move)
    s3_handler.delete_bucket(removed_bucket)
    nodes.remove(removed_bucket)
    return {"message": f"Bucket {removed_bucket} removed and files moved to {next_bucket}"}

@app.get("/get-all-files-by-user/")
def get_all_files():
    all_files = {}
    for node in nodes:
        all_files[node] = s3_handler.get_all_file_names(node)
    user_files = {}
    for bucket_name, files in all_files.items():
        for file in files:
            user_id = extract_user_id(file)
            if user_id:
                if user_id not in user_files:
                    user_files[user_id] = []
                user_files[user_id].append({'file': file, 'bucket': bucket_name})


    for user_id, files in user_files.items():
                print(f"{user_id} : {files}")
    return user_files
def extract_user_id(filename):
    if filename.startswith("user-"):
        return filename.split("_")[0]
    return None
@app.get("/get-all-files-by-bucket/")
def get_all_files():
    all_files = {}
    for node in nodes:
        all_files[node] = s3_handler.get_all_file_names(node)
    return all_files
@app.get("/get-file-by-s3/")
def get_file_by_s3():
    return s3_handler.download_file_from_s3()
@app.get("/get-file-by-flight/")
def get_file_by_flight():
    return flight_client.download_file()
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)


