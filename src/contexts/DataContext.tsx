import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { 
  Company, 
  Unit, 
  Sector, 
  Equipment, 
  Inspection,
  EquipmentType
} from '../types';

interface DataContextType {
  companies: Company[];
  units: Unit[];
  sectors: Sector[];
  equipments: Equipment[];
  inspections: Inspection[];
  equipmentTypes: EquipmentType[];
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  addUnit: (unit: Unit) => void;
  updateUnit: (unit: Unit) => void;
  addSector: (sector: Sector) => void;
  updateSector: (sector: Sector) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (equipment: Equipment) => void;
  addInspection: (inspection: Inspection) => void;
  updateInspection: (inspection: Inspection) => void;
  getCompanyById: (id: string) => Company | undefined;
  getUnitById: (id: string) => Unit | undefined;
  getSectorById: (id: string) => Sector | undefined;
  getEquipmentById: (id: string) => Equipment | undefined;
  getUnitsByCompany: (companyId: string) => Unit[];
  getSectorsByUnit: (unitId: string) => Sector[];
  getEquipmentsBySector: (sectorId: string) => Equipment[];
  getInspectionsByEquipment: (equipmentId: string) => Inspection[];
  getEquipmentTypeByCode: (code: string) => EquipmentType | undefined;
  getEquipmentByCode: (code: string) => Equipment | undefined;
  searchEquipments: (term: string) => Equipment[];
  exportToCSV: (data: any[]) => void;
}

// Initial data for equipment types
const initialEquipmentTypes: EquipmentType[] = [
  { code: 'SF', name: 'Sensor de Fumaça' },
  { code: 'SC', name: 'Sensor de Calor' },
  { code: 'AL', name: 'Alarme' },
  { code: 'AV', name: 'Avisador' },
  { code: 'EX', name: 'Extintor' },
  { code: 'HD', name: 'Hidrante' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [equipmentTypes] = useState<EquipmentType[]>(initialEquipmentTypes);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedCompanies = localStorage.getItem('companies');
    const loadedUnits = localStorage.getItem('units');
    const loadedSectors = localStorage.getItem('sectors');
    const loadedEquipments = localStorage.getItem('equipments');
    const loadedInspections = localStorage.getItem('inspections');

    if (loadedCompanies) setCompanies(JSON.parse(loadedCompanies));
    if (loadedUnits) setUnits(JSON.parse(loadedUnits));
    if (loadedSectors) setSectors(JSON.parse(loadedSectors));
    if (loadedEquipments) setEquipments(JSON.parse(loadedEquipments));
    if (loadedInspections) setInspections(JSON.parse(loadedInspections));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('equipments', JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem('inspections', JSON.stringify(inspections));
  }, [inspections]);

  // Generate code from name (first 3 characters, uppercase)
  const generateCode = (name: string): string => {
    return name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  };

  // CRUD functions for companies
  const addCompany = (company: Company) => {
    const existingCompany = companies.find(c => c.name === company.name);
    if (existingCompany) {
      toast.error('Empresa com este nome já existe!');
      return;
    }
    
    const newCompany = { 
      ...company,
      id: Date.now().toString(),
      code: generateCode(company.name),
      date: new Date().toISOString()
    };
    
    setCompanies([...companies, newCompany]);
    toast.success('Empresa adicionada com sucesso!');
  };

  const updateCompany = (company: Company) => {
    const existingCompany = companies.find(c => c.name === company.name && c.id !== company.id);
    if (existingCompany) {
      toast.error('Empresa com este nome já existe!');
      return;
    }

    setCompanies(companies.map(c => c.id === company.id ? company : c));
    toast.success('Empresa atualizada com sucesso!');
  };

  // CRUD functions for units
  const addUnit = (unit: Unit) => {
    const existingUnit = units.find(u => u.name === unit.name && u.companyId === unit.companyId);
    if (existingUnit) {
      toast.error('Unidade com este nome já existe para esta empresa!');
      return;
    }
    
    const newUnit = { 
      ...unit,
      id: Date.now().toString(),
      code: generateCode(unit.name)
    };
    
    setUnits([...units, newUnit]);
    toast.success('Unidade adicionada com sucesso!');
  };

  const updateUnit = (unit: Unit) => {
    const existingUnit = units.find(u => u.name === unit.name && u.companyId === unit.companyId && u.id !== unit.id);
    if (existingUnit) {
      toast.error('Unidade com este nome já existe para esta empresa!');
      return;
    }

    setUnits(units.map(u => u.id === unit.id ? unit : u));
    toast.success('Unidade atualizada com sucesso!');
  };

  // CRUD functions for sectors
  const addSector = (sector: Sector) => {
    const existingSector = sectors.find(s => s.name === sector.name && s.unitId === sector.unitId);
    if (existingSector) {
      toast.error('Setor com este nome já existe para esta unidade!');
      return;
    }
    
    const newSector = { 
      ...sector,
      id: Date.now().toString(),
      code: generateCode(sector.name)
    };
    
    setSectors([...sectors, newSector]);
    toast.success('Setor adicionado com sucesso!');
  };

  const updateSector = (sector: Sector) => {
    const existingSector = sectors.find(s => s.name === sector.name && s.unitId === sector.unitId && s.id !== sector.id);
    if (existingSector) {
      toast.error('Setor com este nome já existe para esta unidade!');
      return;
    }

    setSectors(sectors.map(s => s.id === sector.id ? sector : s));
    toast.success('Setor atualizado com sucesso!');
  };

  // CRUD functions for equipments
  const addEquipment = (equipment: Equipment) => {
    const newEquipment = { 
      ...equipment,
      id: Date.now().toString()
    };
    
    setEquipments([...equipments, newEquipment]);
    toast.success('Equipamento adicionado com sucesso!');
  };

  const updateEquipment = (equipment: Equipment) => {
    setEquipments(equipments.map(e => e.id === equipment.id ? equipment : e));
    toast.success('Equipamento atualizado com sucesso!');
  };

  // CRUD functions for inspections
  const addInspection = (inspection: Inspection) => {
    const newInspection = { 
      ...inspection,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    setInspections([...inspections, newInspection]);
    toast.success('Inspeção registrada com sucesso!');
  };

  const updateInspection = (inspection: Inspection) => {
    setInspections(inspections.map(i => i.id === inspection.id ? inspection : i));
    toast.success('Inspeção atualizada com sucesso!');
  };

  // Helper functions to get entities by ID
  const getCompanyById = (id: string) => companies.find(c => c.id === id);
  const getUnitById = (id: string) => units.find(u => u.id === id);
  const getSectorById = (id: string) => sectors.find(s => s.id === id);
  const getEquipmentById = (id: string) => equipments.find(e => e.id === id);
  const getEquipmentTypeByCode = (code: string) => equipmentTypes.find(t => t.code === code);
  const getEquipmentByCode = (code: string) => equipments.find(e => e.finalCode === code);

  // Helper functions to get related entities
  const getUnitsByCompany = (companyId: string) => units.filter(u => u.companyId === companyId);
  const getSectorsByUnit = (unitId: string) => sectors.filter(s => s.unitId === unitId);
  const getEquipmentsBySector = (sectorId: string) => equipments.filter(e => e.sectorId === sectorId);
  const getInspectionsByEquipment = (equipmentId: string) => inspections.filter(i => i.equipmentId === equipmentId);

  // Search function
  const searchEquipments = (term: string) => {
    if (!term) return equipments;
    
    const lowerTerm = term.toLowerCase();
    return equipments.filter(equipment => {
      const company = getCompanyById(getSectorById(equipment.sectorId)?.unitId ? 
        getUnitById(getSectorById(equipment.sectorId)?.unitId || '')?.companyId || '' : '');
      const unit = getUnitById(getSectorById(equipment.sectorId)?.unitId || '');
      const sector = getSectorById(equipment.sectorId);
      
      return (
        equipment.finalCode.toLowerCase().includes(lowerTerm) ||
        equipment.model.toLowerCase().includes(lowerTerm) ||
        equipment.loop.toLowerCase().includes(lowerTerm) ||
        equipment.central.toLowerCase().includes(lowerTerm) ||
        (company && company.name.toLowerCase().includes(lowerTerm)) ||
        (unit && unit.name.toLowerCase().includes(lowerTerm)) ||
        (sector && sector.name.toLowerCase().includes(lowerTerm))
      );
    });
  };

  // CSV export function
  const exportToCSV = (data: any[]) => {
    if (data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const cellValue = row[header] || '';
        // Escape quotes and wrap with quotes if there's a comma
        return `"${cellValue.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'equipamentos_export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contextValue: DataContextType = {
    companies,
    units,
    sectors,
    equipments,
    inspections,
    equipmentTypes,
    addCompany,
    updateCompany,
    addUnit,
    updateUnit,
    addSector,
    updateSector,
    addEquipment,
    updateEquipment,
    addInspection,
    updateInspection,
    getCompanyById,
    getUnitById,
    getSectorById,
    getEquipmentById,
    getUnitsByCompany,
    getSectorsByUnit,
    getEquipmentsBySector,
    getInspectionsByEquipment,
    getEquipmentTypeByCode,
    getEquipmentByCode,
    searchEquipments,
    exportToCSV
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};