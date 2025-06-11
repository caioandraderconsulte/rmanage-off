import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { 
    inspections, 
    equipments, 
    getEquipmentById, 
    getSectorById, 
    getUnitById, 
    getCompanyById,
    companies,
    units,
    sectors,
    loading
  } = useData();
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');

  // Get filtered units based on selected company
  const filteredUnits = useMemo(() => {
    if (!selectedCompany) return units;
    return units.filter(unit => unit.companyId === selectedCompany);
  }, [units, selectedCompany]);

  // Get filtered sectors based on selected unit
  const filteredSectors = useMemo(() => {
    if (!selectedUnit) return sectors;
    return sectors.filter(sector => sector.unitId === selectedUnit);
  }, [sectors, selectedUnit]);

  // Get upcoming inspections, sorted by date
  const upcomingInspections = useMemo(() => {
    let filtered = [...inspections];
    
    // Apply filters
    if (selectedCompany || selectedUnit || selectedSector) {
      filtered = filtered.filter(inspection => {
        const equipment = getEquipmentById(inspection.equipmentId);
        if (!equipment) return false;
        
        const sector = getSectorById(equipment.sectorId);
        if (!sector) return false;
        
        const unit = getUnitById(sector.unitId);
        if (!unit) return false;
        
        const company = getCompanyById(unit.companyId);
        if (!company) return false;
        
        if (selectedSector && sector.id !== selectedSector) return false;
        if (selectedUnit && unit.id !== selectedUnit) return false;
        if (selectedCompany && company.id !== selectedCompany) return false;
        
        return true;
      });
    }
    
    // Sort by nextDate (closest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.nextDate);
      const dateB = new Date(b.nextDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [
    inspections, 
    selectedCompany, 
    selectedUnit, 
    selectedSector, 
    getEquipmentById, 
    getSectorById, 
    getUnitById, 
    getCompanyById
  ]);

  // Reset dependent filters when parent filter changes
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(e.target.value);
    setSelectedUnit('');
    setSelectedSector('');
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
    setSelectedSector('');
  };

  // Calculate days remaining and get status color
  const getDaysRemaining = (nextDate: string) => {
    const now = new Date();
    const next = new Date(nextDate);
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'bg-error text-white';
    if (daysRemaining <= 7) return 'bg-warning text-white';
    if (daysRemaining <= 30) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <LoadingSpinner text="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="company" className="form-label">Empresa</label>
            <select
              id="company"
              className="select"
              value={selectedCompany}
              onChange={handleCompanyChange}
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="unit" className="form-label">Unidade</label>
            <select
              id="unit"
              className="select"
              value={selectedUnit}
              onChange={handleUnitChange}
              disabled={!selectedCompany}
            >
              <option value="">Todas as unidades</option>
              {filteredUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="sector" className="form-label">Setor</label>
            <select
              id="sector"
              className="select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              disabled={!selectedUnit}
            >
              <option value="">Todos os setores</option>
              {filteredSectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Upcoming Inspections */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Próximas Manutenções</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-error"></span>
            <span className="mr-2">Atrasado</span>
            <span className="inline-block w-3 h-3 rounded-full bg-warning"></span>
            <span className="mr-2">Próximos 7 dias</span>
            <span className="inline-block w-3 h-3 rounded-full bg-amber-100"></span>
            <span className="mr-2">Próximos 30 dias</span>
            <span className="inline-block w-3 h-3 rounded-full bg-green-100"></span>
            <span>Mais de 30 dias</span>
          </div>
        </div>
        
        {upcomingInspections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="mx-auto h-12 w-12 mb-2" />
            <p>Nenhuma manutenção agendada encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 border-b">Equipamento</th>
                  <th className="px-4 py-3 border-b">Empresa</th>
                  <th className="px-4 py-3 border-b">Unidade</th>
                  <th className="px-4 py-3 border-b">Setor</th>
                  <th className="px-4 py-3 border-b">Última Inspeção</th>
                  <th className="px-4 py-3 border-b">Próxima Inspeção</th>
                  <th className="px-4 py-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingInspections.map(inspection => {
                  const equipment = getEquipmentById(inspection.equipmentId);
                  const sector = equipment && getSectorById(equipment.sectorId);
                  const unit = sector && getUnitById(sector.unitId);
                  const company = unit && getCompanyById(unit.companyId);
                  
                  if (!equipment || !sector || !unit || !company) return null;
                  
                  const daysRemaining = getDaysRemaining(inspection.nextDate);
                  const statusClass = getStatusColor(daysRemaining);
                  
                  return (
                    <tr key={inspection.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{equipment.finalCode}</div>
                        <div className="text-sm text-gray-500">{equipment.model}</div>
                      </td>
                      <td className="px-4 py-3">{company.name}</td>
                      <td className="px-4 py-3">{unit.name}</td>
                      <td className="px-4 py-3">{sector.name}</td>
                      <td className="px-4 py-3">
                        {new Date(inspection.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(inspection.nextDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
                          {daysRemaining < 0 ? (
                            <span className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Atrasado {Math.abs(daysRemaining)} dias
                            </span>
                          ) : daysRemaining === 0 ? (
                            'Hoje'
                          ) : (
                            `${daysRemaining} dias`
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;