import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Box, Table, Skeleton, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Typography } from '@mui/material';

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const fetchData = async (communeCodes, urlTemplate) => {
  const responses = await Promise.all(communeCodes.map(async (communeCode) => {
    let response;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second

    while (retryCount < maxRetries) {
      try {
        response = await axios.get(urlTemplate.replace('{communeCode}', communeCode), {
          headers: {
            Authorization: 'Bearer c1962a62-85fd-3e69-94a8-9a23ea7306a6'
          }
        });
        break; // Break out of the loop if request is successful
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw error;
        }
      }
    }

    if (response) {
      return response.data;
    } else {
      throw new Error(`Failed to fetch data for commune code: ${communeCode}`);
    }
  }));

  return responses.reduce((acc, curr) => {
    if (!acc.Variable && curr.Variable) {
      acc.Variable = curr.Variable;
    }
    if (curr.Cellule && Array.isArray(curr.Cellule)) {
      curr.Cellule.forEach(cell => {
        const found = acc.Cellule.find(c =>
          c.Modalite.some(mod => mod['@code'] === cell.Modalite[0]['@code']) &&
          c.Modalite.some(mod => mod['@code'] === cell.Modalite[1]['@code'])
        );
        if (found) {
          found.Valeur = (parseFloat(found.Valeur) + parseFloat(cell.Valeur)).toString();
        } else {
          acc.Cellule.push({ ...cell });
        }
      });
    }
    return acc;
  }, { Cellule: [] });
};

const Activité = forwardRef(({ communeCodes }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const chartsRef = useRef([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const activiteUrl = 'https://api.insee.fr/donnees-locales/V0.1/donnees/geo-CS1_6-TACTR_2@GEO2023RP2020/COM-{communeCode}.all.all';
        const mergedData = await fetchData(communeCodes, activiteUrl);
        //console.log('Fetched data:', JSON.stringify(mergedData, null, 2)); // Detailed log of fetched data
        setData(mergedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (communeCodes.length > 0) {
      fetchAllData();
    }
  }, [communeCodes]);

  useImperativeHandle(ref, () => ({
    getActiviteData: () => {
      if (!data) return [];
      return data.Cellule.map(cell => ({
        csCode: cell.Modalite['@code'],
        valeur: Math.round(parseFloat(cell.Valeur))
      }));
    },
    getTableElement: () => tableRef.current,
    getChartElements: () => chartsRef.current
  }));

  if (loading) {
    return (
      <Box>
  <Skeleton variant="text" width="600px" mt={6} height={40} style={{ width: '600px', marginLeft:'250px', marginTop: '20px' }} />
  <Grid container spacing={2} mt={4}>
    <Grid item xs={12} md={6}>
      <Box style={{ height: 400 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box style={{ height: 400 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    </Grid>
  </Grid>
  <Grid container spacing={2} mt={4}>
    <Grid item xs={12} md={6}>
      <Box style={{ height: 400 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box style={{ height: 400 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    </Grid>
  </Grid>
</Box>

    );
  }

  const transformDataForTable = (data) => {
    if (!data || !data.Cellule || !data.Variable) return [];

    const csVariable = data.Variable.find(v => v['@code'] === 'CS1_6');
    const activiteVariable = data.Variable.find(v => v['@code'] === 'TACTR_2');

    const categoryLabels = {};
    const activityLabels = {};

    csVariable.Modalite.forEach(mod => {
      categoryLabels[mod['@code']] = mod.Libelle;
    });

    activiteVariable.Modalite.forEach(mod => {
      activityLabels[mod['@code']] = mod.Libelle;
    });

    const categoryData = {};

    data.Cellule.forEach(cell => {
      const csMod = cell.Modalite.find(m => m['@variable'] === 'CS1_6');
      const actMod = cell.Modalite.find(m => m['@variable'] === 'TACTR_2');

      if (!csMod || !actMod) {
        console.warn('Missing modalities in cell:', cell);
        return;
      }

      const csCode = csMod['@code'];
      const actCode = actMod['@code'];
      const value = Math.round(parseFloat(cell.Valeur));
      const measureCode = cell.Mesure['@code'];

      if (!categoryData[csCode]) {
        categoryData[csCode] = { category: categoryLabels[csCode] };
      }

      if (!categoryData[csCode][actCode]) {
        categoryData[csCode][actCode] = 0;
      }

      if (measureCode === 'POP') {
        categoryData[csCode][actCode] += value;
      }
    });

    //console.log('Transformed data for table:', JSON.stringify(categoryData, null, 2)); // Detailed log of transformed data

    return Object.entries(categoryData).map(([csCode, values]) => ({
      category: values.category,
      Ensemble: values["ENS"] || 0,
      "Actifs ayant un emploi": values["11"] || 0,
      Chômeurs: values["12"] || 0
    }));
  };

  const tableData = transformDataForTable(data);

  // Déplacer la dernière ligne au deuxième index
  if (tableData.length > 1) {
    const lastRow = tableData.pop();
    tableData.splice(0, 0, lastRow);
  }

  const chartData = tableData.filter(row => row.category !== 'Ensemble');

  //console.log('Chart data:', chartData); // Detailed log of chart data

  if (chartData.length === 0 && tableData.length === 0) {
    return (
      <Box style={{ textAlign: 'center', marginTop: '20px' }}>
        <img src='/no-results.png' alt="No results" style={{ width: '200px', height: '200px', marginTop: '20px', marginBottom: '10px' }} />
        <Typography variant='h5'>Ups... résultats non trouvés</Typography>
        <Typography variant='h6'>Veuillez sélectionner une autre commune</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" mt={6} mb={6} style={{ textAlign: 'center' }}>Activité selon la catégorie socioprofessionnelle </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box style={{ height: 600 }}>
            <Plot
              data={[
                {
                  x: chartData.map(row => row.category),
                  y: chartData.map(row => row["Actifs ayant un emploi"]),
                  type: 'bar',
                  name: 'Actifs ayant un emploi',
                  marker: { color: 'blue' },
                  hovertemplate: '%{x}<br>Population: %{y:,}<extra></extra>'
                },
                {
                  x: chartData.map(row => row.category),
                  y: chartData.map(row => row["Chômeurs"]),
                  type: 'bar',
                  name: 'Chômeurs',
                  marker: { color: 'orange' },
                  hovertemplate: '%{x}<br>Nombre de Logements: %{y:,}<extra></extra>'
                }
              ]}
              layout={{
                title: '',
                yaxis: {
                  title: 'Population',
                  titlefont: {
                    size: 13,
                    
                  },
                  tickfont: {
                    
                    color: ''
                  }
                },
                autosize: true,
                barmode: 'group',
                margin: { l: 70, r: 50, b: 50, t: 50, pad: 10 },
                legend: {
                  orientation: 'h',
                  y: -0.6,
                  x: 0.2
                }
              }}
              style={{ width: '100%', height: '100%' }}
              ref={el => chartsRef.current[0] = el}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper}>
            <Table ref={tableRef}>
              <TableHead style={{ backgroundColor: 'grey' }}>
                <TableRow>
                  <TableCell style={{ color: 'white' }}>Catégorie Socioprofessionnelle</TableCell>
                  
                  <TableCell style={{ color: 'white' }}>Actifs ayant un emploi</TableCell>
                  <TableCell style={{ color: 'white' }}>Chômeurs</TableCell>
                  <TableCell style={{ color: 'white' }}>Ensemble</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? 'lightgrey' : 'white' }}>
                    <TableCell style={{textAlign: 'center', fontWeight: row.category === 'Ensemble' ? 'bold' : 'normal' }}>{row.category}</TableCell>
                    
                    <TableCell style={{textAlign: 'center', fontWeight: row.category === 'Ensemble' ? 'bold' : 'normal'  }}>{formatNumber(row["Actifs ayant un emploi"] || 0)}</TableCell>
                    <TableCell style={{textAlign: 'center', fontWeight: row.category === 'Ensemble' ? 'bold' : 'normal'  }}>{formatNumber(row["Chômeurs"] || 0)}</TableCell>
                    <TableCell style={{textAlign: 'center', fontWeight: row.category === 'Ensemble' ? 'bold' : 'normal'  }}>{formatNumber(row["Ensemble"] || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Typography variant="caption" style={{display: 'flex', justifyContent: 'flex-end', marginTop: '40px'}}> Source : Insee, RP2020 exploitation principale, géographie au 01/01/2023.</Typography>
    </Box>
  );
});

export default Activité;