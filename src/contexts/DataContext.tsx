import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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
  loading: boolean;
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (company: Company) => Promise<void>;
  addUnit: (unit: Unit) => Promise<void>;
  updateUnit: (unit: Unit) => Promise<void>;
  addSector: (sector: Sector) => Promise<void>;
  updateSector: (sector: Sector) => Promise<void>;
  addEquipment: (equipment: Equipment) => Promise<void>;
  updateEquipment: (equipment: Equipment) => Promise<void>;
  addInspection: (inspection: Inspection) => Promise<void>;
  updateInspection: (inspection: Inspection) => Promise<void>;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCompanies(),
        loadUnits(),
        loadSectors(),
        loadEquipments(),
        loadInspections(),
        loadEquipmentTypes()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading companies:', error);
      return;
    }
    
    setCompanies(data || []);
  };

  const loadUnits = async () => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading units:', error);
      return;
    }
    
    setUnits(data || []);
  };

  const loadSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading sectors:', error);
      return;
    }
    
    setSectors(data || []);
  };

  const loadEquipments = async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading equipment:', error);
      return;
    }
    
    setEquipments(data || []);
  };

  const loadInspections = async () => {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading inspections:', error);
      return;
    }
    
    setInspections(data || []);
  };

  const loadEquipmentTypes = async () => {
    const { data, error } = await supabase
      .from('equipment_types')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Error loading equipment types:', error);
      return;
    }
    
    setEquipmentTypes(data || []);
  };

  // Generate code from name (first 3 characters, uppercase)
  const generateCode = (name: string): string => {
    return name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  };

  // CRUD functions for companies
  const addCompany = async (company: Company) => {
    try {
      const existingCompany = companies.find(c => c.name === company.name);
      if (existingCompany) {
        toast.error('Empresa com este nome já existe!');
        return;
      }
      
      const newCompany = { 
        ...company,
        code: generateCode(company.name),
        date: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding company:', error);
        toast.error('Erro ao adicionar empresa');
        return;
      }
      
      setCompanies([data, ...companies]);
      toast.success('Empresa adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Erro ao adicionar empresa');
    }
  };

  const updateCompany = async (company: Company) => {
    try {
      const existingCompany = companies.find(c => c.name === company.name && c.id !== company.id);
      if (existingCompany) {
        toast.error('Empresa com este nome já existe!');
        return;
      }

      const { error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', company.id);
      
      if (error) {
        console.error('Error updating company:', error);
        toast.error('Erro ao atualizar empresa');
        return;
      }
      
      setCompanies(companies.map(c => c.id === company.id ? company : c));
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  // CRUD functions for units
  const addUnit = async (unit: Unit) => {
    try {
      const existingUnit = units.find(u => u.name === unit.name && u.companyId === unit.companyId);
      if (existingUnit) {
        toast.error('Unidade com este nome já existe para esta empresa!');
        return;
      }
      
      const newUnit = { 
        ...unit,
        company_id: unit.companyId,
        code: generateCode(unit.name)
      };
      
      const { data, error } = await supabase
        .from('units')
        .insert([newUnit])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding unit:', error);
        toast.error('Erro ao adicionar unidade');
        return;
      }
      
      const formattedUnit = {
        ...data,
        companyId: data.company_id
      };
      
      setUnits([formattedUnit, ...units]);
      toast.success('Unidade adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Erro ao adicionar unidade');
    }
  };

  const updateUnit = async (unit: Unit) => {
    try {
      const existingUnit = units.find(u => u.name === unit.name && u.companyId === unit.companyId && u.id !== unit.id);
      if (existingUnit) {
        toast.error('Unidade com este nome já existe para esta empresa!');
        return;
      }

      const updateData = {
        ...unit,
        company_id: unit.companyId
      };

      const { error } = await supabase
        .from('units')
        .update(updateData)
        .eq('id', unit.id);
      
      if (error) {
        console.error('Error updating unit:', error);
        toast.error('Erro ao atualizar unidade');
        return;
      }
      
      setUnits(units.map(u => u.id === unit.id ? unit : u));
      toast.success('Unidade atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Erro ao atualizar unidade');
    }
  };

  // CRUD functions for sectors
  const addSector = async (sector: Sector) => {
    try {
      const existingSector = sectors.find(s => s.name === sector.name && s.unitId === sector.unitId);
      if (existingSector) {
        toast.error('Setor com este nome já existe para esta unidade!');
        return;
      }
      
      const newSector = { 
        ...sector,
        unit_id: sector.unitId,
        code: generateCode(sector.name)
      };
      
      const { data, error } = await supabase
        .from('sectors')
        .insert([newSector])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding sector:', error);
        toast.error('Erro ao adicionar setor');
        return;
      }
      
      const formattedSector = {
        ...data,
        unitId: data.unit_id
      };
      
      setSectors([formattedSector, ...sectors]);
      toast.success('Setor adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding sector:', error);
      toast.error('Erro ao adicionar setor');
    }
  };

  const updateSector = async (sector: Sector) => {
    try {
      const existingSector = sectors.find(s => s.name === sector.name && s.unitId === sector.unitId && s.id !== sector.id);
      if (existingSector) {
        toast.error('Setor com este nome já existe para esta unidade!');
        return;
      }

      const updateData = {
        ...sector,
        unit_id: sector.unitId
      };

      const { error } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', sector.id);
      
      if (error) {
        console.error('Error updating sector:', error);
        toast.error('Erro ao atualizar setor');
        return;
      }
      
      setSectors(sectors.map(s => s.id === sector.id ? sector : s));
      toast.success('Setor atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating sector:', error);
      toast.error('Erro ao atualizar setor');
    }
  };

  // CRUD functions for equipments
  const addEquipment = async (equipment: Equipment) => {
    try {
      const newEquipment = { 
        ...equipment,
        sector_id: equipment.sectorId,
        type_code: equipment.typeCode,
        final_code: equipment.finalCode
      };
      
      const { data, error } = await supabase
        .from('equipment')
        .insert([newEquipment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding equipment:', error);
        toast.error('Erro ao adicionar equipamento');
        return;
      }
      
      const formattedEquipment = {
        ...data,
        sectorId: data.sector_id,
        typeCode: data.type_code,
        finalCode: data.final_code
      };
      
      setEquipments([formattedEquipment, ...equipments]);
      toast.success('Equipamento adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Erro ao adicionar equipamento');
    }
  };

  const updateEquipment = async (equipment: Equipment) => {
    try {
      const updateData = {
        ...equipment,
        sector_id: equipment.sectorId,
        type_code: equipment.typeCode,
        final_code: equipment.finalCode
      };

      const { error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', equipment.id);
      
      if (error) {
        console.error('Error updating equipment:', error);
        toast.error('Erro ao atualizar equipamento');
        return;
      }
      
      setEquipments(equipments.map(e => e.id === equipment.id ? equipment : e));
      toast.success('Equipamento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Erro ao atualizar equipamento');
    }
  };

  // CRUD functions for inspections
  const addInspection = async (inspection: Inspection) => {
    try {
      const newInspection = { 
        ...inspection,
        equipment_id: inspection.equipmentId,
        description_photo: inspection.descriptionPhoto,
        malfunction_description: inspection.malfunctionDescription,
        malfunction_photo: inspection.malfunctionPhoto,
        next_date: inspection.nextDate,
        date: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('inspections')
        .insert([newInspection])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding inspection:', error);
        toast.error('Erro ao registrar inspeção');
        return;
      }
      
      const formattedInspection = {
        ...data,
        equipmentId: data.equipment_id,
        descriptionPhoto: data.description_photo,
        malfunctionDescription: data.malfunction_description,
        malfunctionPhoto: data.malfunction_photo,
        nextDate: data.next_date
      };
      
      setInspections([formattedInspection, ...inspections]);
      toast.success('Inspeção registrada com sucesso!');
    } catch (error) {
      console.error('Error adding inspection:', error);
      toast.error('Erro ao registrar inspeção');
    }
  };

  const updateInspection = async (inspection: Inspection) => {
    try {
      const updateData = {
        ...inspection,
        equipment_id: inspection.equipmentId,
        description_photo: inspection.descriptionPhoto,
        malfunction_description: inspection.malfunctionDescription,
        malfunction_photo: inspection.malfunctionPhoto,
        next_date: inspection.nextDate
      };

      const { error } = await supabase
        .from('inspections')
        .update(updateData)
        .eq('id', inspection.id);
      
      if (error) {
        console.error('Error updating inspection:', error);
        toast.error('Erro ao atualizar inspeção');
        return;
      }
      
      setInspections(inspections.map(i => i.id === inspection.id ? inspection : i));
      toast.success('Inspeção atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error('Erro ao atualizar inspeção');
    }
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
    loading,
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