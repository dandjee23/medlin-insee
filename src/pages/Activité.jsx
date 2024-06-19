import React from 'react';
import { Typography, Box } from '@mui/material';

const Activité = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
    >
      <Typography variant="h4" component="h1">
      Travaux en progrès...
      </Typography>
    </Box>
  );
};

export default Activité;