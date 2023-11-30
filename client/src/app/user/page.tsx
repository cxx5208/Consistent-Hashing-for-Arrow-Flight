"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Container,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function User() {
  const [selectedUser, setSelectedUser] = useState("user-1");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [completeData, setCompleteData] = useState<any>([]);
  const [data, setData] = useState<any>([]);

  const fetchData = async () => {
    const response = await fetch(
      "http://localhost:8082/get-all-files-by-user/"
    );
    const res = await response.json();
    setCompleteData(res);
    if (typeof (res["user-1"]) === undefined) { 
      setData([]);
    } else {
      setData(res["user-1"]);
    }

    // setData(typeof(res["user-1"]) === undefined ? [] : res["user-1"]);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleUserChange = (event: any) => {
    setSelectedUser(event.target.value);
    setData(completeData[event.target.value] || []);
  };

  const handleFileChange = (event: any) => {
    setUploadedFile(event.target.files[0]);
  };

  const handleDownload = async (filename: string) => {
    const response = await fetch(
      `http://localhost:8082/get/${selectedUser}/${filename}`,
      {
        method: "GET",
      }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a link and set the URL as the href
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.split('.')[0] + ".csv";
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    console.log("Download", filename);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("user_id", selectedUser);
      console.log(selectedUser);
      const response = await fetch(
        `http://localhost:8082/upload-csv/${selectedUser}`,
        {
          method: "POST",
          body: formData,
        }
      );
      fetchData();
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="user-select-label">User</InputLabel>
          <Select
            labelId="user-select-label"
            id="user-select"
            value={selectedUser}
            label="User"
            onChange={handleUserChange}
          >
            <MenuItem value="user-1">User 1</MenuItem>
            <MenuItem value="user-2">User 2</MenuItem>
            <MenuItem value="user-3">User 3</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            sx={{ maxWidthidth: 500 }}
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            {uploadedFile ? (
              <>
                File Uploaded <CheckCircleOutlineIcon sx={{ ml: 1 }} />
              </>
            ) : (
              "Upload File"
            )}
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
        </Box>
        <Button
          sx={{ ml: 3 }}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {data &&
          <TableContainer component={Paper} sx={{ maxWidth: 650, marginTop: 2 }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Filename</TableCell>
                  <TableCell>BucketName</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row: any) => (
                  <TableRow key={row.name}>
                    <TableCell>{(row.file.split('.')[0]).split('_')[1]}</TableCell>
                    <TableCell>{row.bucket}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDownload(row.file)}>
                        <CloudDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        }
      </Box>
    </Box>
  );
}
