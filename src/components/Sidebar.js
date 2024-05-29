import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, styled, createTheme, ThemeProvider } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import WorkIcon from '@mui/icons-material/Work';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import SummaryOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SummaryIcon from '@mui/icons-material/Summarize';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HelpIcon from '@mui/icons-material/Help';

const menuItems = [
  { text: 'Accueil', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon />, path: '/' },
  { text: "Sélection de l'activité", icon: <WorkOutlineOutlinedIcon />, activeIcon: <WorkIcon />, path: '/selection-activite' },
  { text: "Localisation d'implantation", icon: <FmdGoodOutlinedIcon />, activeIcon: <FmdGoodIcon />, path: '/localisation-implantation' },
  { text: 'Synthèse de la recherche', icon: <SummaryOutlinedIcon />, activeIcon: <SummaryIcon />, path: '/synthese-recherche' },
  { text: 'Aide', icon: <HelpOutlineOutlinedIcon />, activeIcon: <HelpIcon />, path: '/aide' },
];

const theme = createTheme({
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.09)',
          },
        },
      },
    },
  },
});

const SidebarContainer = styled('div')(({ theme, sidebarOpen }) => ({
  width: sidebarOpen ? 280 : 64,
  transition: 'width 0.3s',
  marginTop: theme.spacing(8),
  position: 'fixed',
  top: 0,
  height: '100vh',
  zIndex: 1200,
  backgroundColor: 'white',
  overflowX: 'hidden',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 36,
  marginRight: theme.spacing(1), // Ajoute un peu d'espace entre l'icône et le libellé
  '&:hover': {
    color: '#286AC7',
    '@media (hover: none)': {
      color: 'inherit',
    },
  },
}));

const StyledListItemText = styled(ListItemText)({});

const Sidebar = ({ sidebarOpen }) => {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <SidebarContainer sidebarOpen={sidebarOpen}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                button
                component={Link}
                to={item.path}
                key={item.text}
                selected={isActive}
                style={{
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                }}
              >
                <StyledListItemIcon style={{ color: isActive ? '#286AC7' : '#000' }}>
                  {isActive ? item.activeIcon : item.icon}
                </StyledListItemIcon>
                {sidebarOpen && (
                  <StyledListItemText
                    primary={item.text}
                    style={{
                      color: isActive ? '#286AC7' : '#000',
                      fontWeight: isActive ? 'bold' : 'normal',
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </SidebarContainer>
    </ThemeProvider>
  );
};

export default Sidebar;
