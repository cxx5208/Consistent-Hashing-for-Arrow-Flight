

# Consistent Hashing for Arrow Flight

This project implements a consistent hashing mechanism for the Arrow Flight RPC framework to enhance load distribution among servers. The integration of consistent hashing optimizes data retrieval and storage processes, making the system more scalable and fault-tolerant.

## Overview

Apache Arrow Flight is an RPC framework optimized for high performance data transfer for analytical workloads. This project extends Arrow Flight by introducing a consistent hashing algorithm to distribute requests evenly across a cluster of servers. This ensures efficient use of resources and improves system resilience.

## Features

- **Consistent Hashing**: Implements a consistent hashing ring to distribute data and request load evenly across servers.
- **Scalability**: Easily add or remove servers from the cluster with minimal impact on the system's overall performance and data distribution.
- **Fault Tolerance**: Enhances system resilience by ensuring that the failure of a single server does not significantly impact the data availability or the performance of the system.

## Getting Started

### Prerequisites

- Apache Arrow
- gRPC
- Python 3.6 or later

### Installation

Clone the repository:

```bash
git clone https://github.com/cxx5208/Consistent-Hashing-for-Arrow-Flight.git
cd Consistent-Hashing-for-Arrow-Flight
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Running the Server

Start the Arrow Flight server with consistent hashing:

```bash
python server.py
```

### Running the Client

Send requests to the server using the client script:

```bash
python client.py
```

## Architecture

The architecture of the Consistent Hashing for Arrow Flight project includes clients, a consistent hashing layer, and a cluster of Arrow Flight servers. Clients send requests to the consistent hashing layer, which then directs these requests to the appropriate server based on the hashing algorithm.


![image](https://github.com/cxx5208/Consistent-Hashing-for-Arrow-Flight/assets/76988460/eb0f48ce-7a25-42a2-b231-0994e401b5cd)



## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Apache Arrow Flight developers
- Contributors to the consistent hashing algorithms

---

