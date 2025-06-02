import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CompanyForm from './pages/CompanyForm';
import UnitForm from './pages/UnitForm';
import SectorForm from './pages/SectorForm';
import EquipmentForm from './pages/EquipmentForm';
import InspectionForm from './pages/InspectionForm';
import InspectionDetails from './pages/InspectionDetails';
import Search from './pages/Search';

function App() {
  return (
    <DataProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/empresas" element={<CompanyForm />} />
            <Route path="/unidades" element={<UnitForm />} />
            <Route path="/setores" element={<SectorForm />} />
            <Route path="/equipamentos" element={<EquipmentForm />} />
            <Route path="/inspecoes" element={<InspectionForm />} />
            <Route path="/inspecoes/:id" element={<InspectionDetails />} />
            <Route path="/busca" element={<Search />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;