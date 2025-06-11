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

  const loadCompanies = async () => { /* ...código sem alteração... */ };
  const loadUnits = async () => { /* ...código sem alteração... */ };
  const loadSectors = async () => { /* ...código sem alteração... */ };
  const loadEquipments = async () => { /* ...código sem alteração... */ };
  const loadInspections = async () => { /* ...código sem alteração... */ };
  const loadEquipmentTypes = async () => { /* ...código sem alteração... */ };
  const generateCode = (name: string): string => name.replace(/\s+/g, '').substring(0, 3).toUpperCase();

  // CRUD functions for companies
  const addCompany = async (company: Company) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para adicionar uma empresa.');
        return;
      }

      const existingCompany = companies.find(c => c.name === company.name);
      if (existingCompany) {
        toast.error('Empresa com este nome já existe!');
        return;
      }
      
      const newCompany = { 
        name: company.name,
        address: company.address || '',
        phone: company.phone || '',
        website: company.website || '',
        email: company.email || '',
        responsible: company.responsible || '',
        manufacturer: company.manufacturer || '',
        central_model: company.centralModel || '',
        cb_project: company.cbProject || '',
        avcb: company.avcb || '',
        code: generateCode(company.name),
        date: new Date().toISOString(),
        user_id: user.id // CORREÇÃO APLICADA
      };
      
      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding company:', error);
        toast.error(`Erro ao adicionar empresa: ${error.message}`);
        return;
      }
      
      const transformedCompany = { ...data, centralModel: data.central_model || '', cbProject: data.cb_project || '' };
      setCompanies([transformedCompany, ...companies]);
      toast.success('Empresa adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Ocorreu um erro inesperado ao adicionar a empresa.');
    }
  };

  const updateCompany = async (company: Company) => { /* ...código sem alteração... */ };

  // CRUD functions for units
  const addUnit = async (unit: Unit) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para adicionar uma unidade.');
        return;
      }

      const existingUnit = units.find(u => u.name === unit.name && u.companyId === unit.companyId);
      if (existingUnit) {
        toast.error('Unidade com este nome já existe para esta empresa!');
        return;
      }
      
      const newUnit = { 
        name: unit.name,
        company_id: unit.companyId,
        code: generateCode(unit.name),
        user_id: user.id // CORREÇÃO APLICADA
      };
      
      const { data, error } = await supabase
        .from('units')
        .insert([newUnit])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding unit:', error);
        toast.error(`Erro ao adicionar unidade: ${error.message}`);
        return;
      }
      
      const formattedUnit = { ...data, companyId: data.company_id };
      setUnits([formattedUnit, ...units]);
      toast.success('Unidade adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Ocorreu um erro inesperado ao adicionar a unidade.');
    }
  };

  const updateUnit = async (unit: Unit) => { /* ...código sem alteração... */ };

  // CRUD functions for sectors
  const addSector = async (sector: Sector) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para adicionar um setor.');
        return;
      }

      const existingSector = sectors.find(s => s.name === sector.name && s.unitId === sector.unitId);
      if (existingSector) {
        toast.error('Setor com este nome já existe para esta unidade!');
        return;
      }
      
      const newSector = { 
        name: sector.name,
        unit_id: sector.unitId,
        code: generateCode(sector.name),
        user_id: user.id // CORREÇÃO APLICADA
      };
      
      const { data, error } = await supabase
        .from('sectors')
        .insert([newSector])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding sector:', error);
        toast.error(`Erro ao adicionar setor: ${error.message}`);
        return;
      }
      
      const formattedSector = { ...data, unitId: data.unit_id };
      setSectors([formattedSector, ...sectors]);
      toast.success('Setor adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding sector:', error);
      toast.error('Ocorreu um erro inesperado ao adicionar o setor.');
    }
  };

  const updateSector = async (sector: Sector) => { /* ...código sem alteração... */ };

  // CRUD functions for equipments
  const addEquipment = async (equipment: Equipment) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para adicionar um equipamento.');
        return;
      }

      const newEquipment = { 
        sector_id: equipment.sectorId,
        type_code: equipment.typeCode,
        model: equipment.model,
        loop: equipment.loop,
        central: equipment.central || '',
        final_code: equipment.finalCode,
        user_id: user.id // CORREÇÃO APLICADA
      };
      
      const { data, error } = await supabase
        .from('equipment')
        .insert([newEquipment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding equipment:', error);
        toast.error(`Erro ao adicionar equipamento: ${error.message}`);
        return;
      }
      
      const formattedEquipment = { ...data, sectorId: data.sector_id, typeCode: data.type_code, finalCode: data.final_code };
      setEquipments([formattedEquipment, ...equipments]);
      toast.success('Equipamento adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Ocorreu um erro inesperado ao adicionar o equipamento.');
    }
  };

  const updateEquipment = async (equipment: Equipment) => { /* ...código sem alteração... */ };

  // CRUD functions for inspections
  const addInspection = async (inspection: Inspection) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para registrar uma inspeção.');
        return;
      }

      const newInspection = { 
        equipment_id: inspection.equipmentId,
        description: inspection.description,
        description_photo: inspection.descriptionPhoto || null,
        functioning: inspection.functioning,
        malfunction_description: inspection.malfunctionDescription || null,
        malfunction_photo: inspection.malfunctionPhoto || null,
        next_date: inspection.nextDate,
        date: new Date().toISOString(),
        user_id: user.id // CORREÇÃO APLICADA
      };
      
      const { data, error } = await supabase
        .from('inspections')
        .insert([newInspection])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding inspection:', error);
        toast.error(`Erro ao registrar inspeção: ${error.message}`);
        return;
      }
      
      const formattedInspection = { ...data, equipmentId: data.equipment_id, descriptionPhoto: data.description_photo, malfunctionDescription: data.malfunction_description, malfunctionPhoto: data.malfunction_photo, nextDate: data.next_date };
      setInspections([formattedInspection, ...inspections]);
      toast.success('Inspeção registrada com sucesso!');
    } catch (error) {
      console.error('Error adding inspection:', error);
      toast.error('Ocorreu um erro inesperado ao registrar a inspeção.');
    }
  };

  const updateInspection = async (inspection: Inspection) => { /* ...código sem alteração... */ };

  // Helper and other functions
  const getCompanyById = (id: string) => companies.find(c => c.id === id);
  const getUnitById = (id: string) => units.find(u => u.id === id);
  const getSectorById = (id: string) => sectors.find(s => s.id === id);
  const getEquipmentById = (id: string) => equipments.find(e => e.id === id);
  const getEquipmentTypeByCode = (code: string) => equipmentTypes.find(t => t.code === code);
  const getEquipmentByCode = (code: string) => equipments.find(e => e.finalCode === code);
  const getUnitsByCompany = (companyId: string) => units.filter(u => u.companyId === companyId);
  const getSectorsByUnit = (unitId: string) => sectors.filter(s => s.unitId === unitId);
  const getEquipmentsBySector = (sectorId: string) => equipments.filter(e => e.sectorId === sectorId);
  const getInspectionsByEquipment = (equipmentId: string) => inspections.filter(i => i.equipmentId === equipmentId);
  const searchEquipments = (term: string) => { /* ...código sem alteração... */ };
  const exportToCSV = (data: any[]) => { /* ...código sem alteração... */ };

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