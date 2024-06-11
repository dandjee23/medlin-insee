import React, { useEffect, useState, useRef } from 'react';
import { Container, Paper, Typography, Box, Tabs, Tab, IconButton, Tooltip, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PopulationTab from './PopulationTab';
import EntreprisesTab from './EntreprisesTab';
import GetAppIcon from '@mui/icons-material/GetApp';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const SyntheseRecherche = () => {
  const [selectedNAF, setSelectedNAF] = useState('');
  const [selectedNAF1, setSelectedNAF1] = useState('');
  const [selectedCommunes, setSelectedCommunes] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const populationRef = useRef();
  const entreprisesRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const naf = localStorage.getItem('selectedNAF');
    const communes = JSON.parse(localStorage.getItem('selectedCommunes')) || [];
    setSelectedNAF(naf || '');
    setSelectedCommunes(communes || []);
  }, []);

  useEffect(() => {
    const naf1 = localStorage.getItem('selectedNAF1');
    setSelectedNAF1(naf1 || '');
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleDownload = async () => {
    const populationData = populationRef.current ? populationRef.current.getPopulationData() : [];
    const entreprisesData = entreprisesRef.current ? entreprisesRef.current.getEntreprisesData() : [];

    console.log("Population Data for export:", populationData);
    console.log("Entreprises Data for export:", entreprisesData);

    const workbook = XLSX.utils.book_new();
    const populationSheet = XLSX.utils.json_to_sheet(populationData);
    XLSX.utils.book_append_sheet(workbook, populationSheet, "Population");
    const entreprisesSheet = XLSX.utils.json_to_sheet(entreprisesData);
    XLSX.utils.book_append_sheet(workbook, entreprisesSheet, "Entreprises");

    XLSX.writeFile(workbook, "Medl'In.xlsx");

    if (tabIndex === 0 && populationRef.current) {
      const populationElement = populationRef.current.getTableElement();
      if (populationElement) {
        const canvas = await html2canvas(populationElement);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'PopulationTab.png';
        link.click();
      }
    }
  };

  const handleBack = () => {
    navigate('/localisation-implantation'); // Adjust this path as needed
  };

  const handleNext = () => {
    // Implement navigation to the next page if needed
    navigate('/Aide'); // Adjust this path as needed
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2} >
        <Typography variant="h4" gutterBottom>Synthèse de la recherche</Typography>
        <Box display="flex" alignItems="center">
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
            style={{ marginRight: 10, borderRadius: '8px', textTransform: 'none' }}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<NavigateNextIcon />}
            style={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Suivant
          </Button>
        </Box>
      </Box>
      <Typography variant="body1" paragraph style={{ marginTop: '20px' }}>
        Veuillez trouver ci-dessous les résultats issus de votre étude.
      </Typography>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6" gutterBottom>Activité choisie :</Typography>
        <Typography variant="body1">{selectedNAF1 || 'Aucune activité choisie'}</Typography>
      </Paper>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6" gutterBottom>Communes choisies :</Typography>
        <Typography variant="body1">
          {selectedCommunes.length > 0 ? selectedCommunes.map(commune => commune.value).join(', ') : 'Aucune commune choisie'}
        </Typography>
      </Paper>

      <Box marginTop={10} position="relative">
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="standard"
          textColor="primary"
          TabIndicatorProps={{ style: { display: 'none' } }}
        >
          <Tab 
            label="Population" 
            style={{ 
              backgroundColor: tabIndex === 0 ? 'transparent' : '#f5f5f5', 
              textTransform: 'none', 
              borderBottom: '2px solid', 
              borderColor: tabIndex === 0 ? '#286AC7' : 'transparent',
              alignSelf: 'flex-start',
              fontSize: '20px' 
            }} 
          />
          <Tab 
            label="Entreprises" 
            style={{ 
              backgroundColor: tabIndex === 1 ? 'transparent' : '#f5f5f5', 
              textTransform: 'none', 
              borderBottom: '2px solid', 
              borderColor: tabIndex === 1 ? '#286AC7' : 'transparent',
              alignSelf: 'flex-start',
              fontSize: '20px'  
            }} 
          />
        </Tabs>
        <Tooltip title="Exporter les données">
          <IconButton
            style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              border: '1px solid lightgrey',
            }}
            onClick={handleDownload}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
        <Divider style={{ marginTop: '16px' }} />
      </Box>
      {tabIndex === 0 && (
        <div style={{ backgroundColor: 'white', marginTop: '16px', padding: '16px' }}>
          <PopulationTab ref={populationRef} communeCodes={selectedCommunes.map(commune => commune.value)} />
        </div>
      )}
      {tabIndex === 1 && (
        <div style={{ backgroundColor: 'white', marginTop: '16px', padding: '16px' }}>
        <EntreprisesTab ref={entreprisesRef} selectedNAF={selectedNAF} selectedCommunes={selectedCommunes} />

        </div>
      )}
    </Container>
  );
};

export default SyntheseRecherche;