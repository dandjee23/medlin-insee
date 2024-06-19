import React from 'react';
import { Container, Typography, Button, Box, styled } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import StepsSection from './StepsSection';

// Styled button
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#e4003a',
  color: '#fff',
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 4),
  marginTop: theme.spacing(4),
  '&:hover': {
    backgroundColor: '#d40033',
  },
  display: 'flex',
  alignItems: 'center',
}));

const Home = () => {
  const navigate = useNavigate();

  const handleStartStudy = () => {
    navigate('/selection-activite');
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 6,
          paddingBottom: 0, // Set bottom padding to 0
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mt: 2,
            mb: 0,
            px: 2,
            pb: 2, // Adjust bottom padding if necessary
          }}
        >
          <Typography variant="h3" component="h1">
            Mon entreprise
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            avec les données de l'Insee
          </Typography>
          <Typography variant="h6" component="p" sx={{ mt: 2, mb: 4 }}>
          Une application mise à disposition par l'Insee, spécialement conçue pour les futurs entrepreneurs et les néo-entrepreneurs. Cette solution vous offre la possibilité de réaliser des études de marché approfondies,
            <span style={{ color: 'blue' }}> en vous fournissant des analyses détaillées et de qualité supérieure pour soutenir vos projets entrepreneuriaux.</span>
          </Typography>
          <StyledButton onClick={handleStartStudy} variant="contained" size="large">
            Commencer l'étude
            <ArrowForwardIosIcon sx={{ ml: 1 }} />
          </StyledButton>
          <img
            src="/Analysis-pana.svg"
            alt="Analysis Illustration"
            style={{ marginTop: 40, height: 400, width: '100%' }}
          />
        </Container>
      </Box>
      <StepsSection /> {/* Add the StepsSection component here */}
      <Footer /> {/* Add the Footer component here */}
    </>
  );
};

export default Home;