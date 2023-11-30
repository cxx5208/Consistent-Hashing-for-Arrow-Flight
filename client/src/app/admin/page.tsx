"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

type BucketData = {
  [key: string]: string[];
};

type FormattedData = {
  bucketName: string;
  fileName: string;
  userName: string;
};

function BucketChips() {
  const [buckets, setBuckets] = useState<any>([]);
  const [data, setData] = useState<any>([]); // Dummy data for the table
  const [open, setOpen] = useState(false); // To control the modal visibility
  const [serverName, setServerName] = useState("");
  const [bucketToDelete, setBucketToDelete] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [completeData, setCompleteData] = useState<any>([]);

  const formatData = (bucketData: BucketData): FormattedData[] => {
    let formattedData: FormattedData[] = [];

    Object.entries(bucketData).forEach(([bucketName, files]) => {
      console.log(bucketName, files);
      console.log(files.length);  
      if (files.length != 0) {        
        files.forEach((fileName) => {
          const userNameMatch = fileName.match(/user-\d+/);
          const userName = userNameMatch ? userNameMatch[0] : "unknown";
  
          formattedData.push({
            bucketName,
            fileName,
            userName,
          });
        });
      } 
    });

    return formattedData;
  };

  const fetchData = async () => {
    const response = await fetch(
      "http://localhost:8082/get-all-files-by-bucket/"
    );
    const res = await response.json();
    setCompleteData(res);
    const bucketsList = Object.keys(res);
    setBuckets(bucketsList);
    const formattedData = formatData(res);
    setData(formattedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (bucket: any) => {
    setBucketToDelete(bucket);
    setOpenDeleteDialog(true);
    setBuckets((prevBuckets: any) =>
      prevBuckets.filter((bucket: any) => bucket !== bucketToDelete)
    );
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmAdd = async() => {
    if (serverName.trim()) {
      setBuckets([...buckets, serverName]);
    }

    const response = await fetch(`http://localhost:8082/add-bucket/${serverName}`);
    const res = await response.json();
    fetchData();

    setServerName(""); // Reset the input field
    handleClose(); // Close the modal
  };

  const handleServerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServerName(event.target.value);
  };

  const handleAdd = () => {
    const newBucket = `Bucket ${buckets.length + 1}`;
    setBuckets([...buckets, newBucket]);
  };

  const handleDownload = (filename: string) => {
    // Add download logic
    console.log("Download", filename);
  };

  const handleConfirmDelete = async() => {
     const response = await fetch(
       `http://localhost:8082/remove-bucket/${bucketToDelete}`
     );
     fetchData();
    setBuckets((prevBuckets: any) =>
      prevBuckets.filter((bucket: any) => bucket !== bucketToDelete)
    );
    handleCloseDeleteDialog();
  };

  const circleRadius = 125; // Radius of the circle
  const circleCenter = circleRadius + 10;

  return (
    <Box>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Stack direction="row" spacing={1}>
          <Typography>Buckets:</Typography>
          {buckets.map((bucket: any, index: any) => (
            <Chip
              key={index}
              label={bucket}
              variant="outlined"
              onDelete={() => handleDelete(bucket)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
          <IconButton onClick={handleClickOpen}>
            <AddCircleOutlineIcon />
          </IconButton>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add a Server</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To add a server, please enter the server name here.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="serverName"
                label="Server Name"
                type="text"
                fullWidth
                variant="standard"
                value={serverName}
                onChange={handleServerNameChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>No</Button>
              <Button onClick={handleConfirmAdd}>Confirm Add</Button>
            </DialogActions>
          </Dialog>
        </Stack>
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this server?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>No</Button>
            <Button onClick={handleConfirmDelete}>Yes</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box
        sx={{
          mt: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          width={circleCenter * 2 + 100} // Add extra width for overflow
          height={circleCenter * 2 + 100} // Add extra height for overflow
          className="circle-svg"
          viewBox={`0 0 ${circleCenter * 2 + 100} ${circleCenter * 2 + 100}`} // Adjust the viewbox accordingly
          style={{ overflow: "visible" }} // This style allows the text to overflow outside of the SVG element
        >
          <circle
            cx={circleCenter + 50} // Adjust the center to account for the extra width
            cy={circleCenter + 50} // Adjust the center to account for the extra height
            r={circleRadius}
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
          {buckets.map((bucket: any, index: any) => {
            const angle = (index / buckets.length) * 2 * Math.PI;
            const nodeRadius = 10; // Radius of the node circle
            const x = circleCenter + 50 + circleRadius * Math.cos(angle); // Adjust positions to account for the new center
            const y = circleCenter + 50 + circleRadius * Math.sin(angle);

            return (
              <React.Fragment key={bucket}>
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill="black"
                  className="circle-node"
                />
                {/* Bucket name text */}
                <text
                  x={x}
                  y={y + 20} // Position the text below the node
                  textAnchor="middle"
                  className="circle-node-label"
                >
                  {bucket}
                </text>
              </React.Fragment>
            );
          })}
        </svg>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <TableContainer component={Paper} sx={{ maxWidth: 650, marginTop: 2 }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>UserName</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>BucketName</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row: any, index: any) => (
                <TableRow key={index}>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.fileName}</TableCell>
                  <TableCell>{row.bucketName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default BucketChips;
