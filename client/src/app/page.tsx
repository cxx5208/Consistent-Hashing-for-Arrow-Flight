'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

export default function DrawerAppBar() {

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '90vh' // Adjust the height as needed 
    }}>
      <Box component="main" sx={{ textAlign: 'center' }}>
        <Typography variant="h3">
          Consistent Hashing with Arrow Flight
        </Typography>
        <Typography variant="h5">
          Team Infinite Loop
        </Typography>
      </Box>
    </Box>

  );
}
