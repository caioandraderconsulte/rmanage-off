import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Boxes, Plus, Edit, Save } from 'lucide-react';

interface EquipmentFormData {
  id: string;
  sectorId: string;
  typeCode: string;
  model: string;
  loop: string;
  central: string;
  finalCode: string;
}

const EquipmentForm: React.FC = () => {
  const { 
    companies, 
    units, 
    sectors, 
    equipments, 
    equipmentTypes,
    addEquipment, 
    updateEquipment, 
    getUnitsByCompany, 
    getSectorsByUnit,
    getEquipmentsBySector,
    getCompanyById,
    getUnitById,
    getSectorById
  } = useData();
  
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  
  const [formData, setFormData] = useState<EquipmentFormData>({
    id: '',
    sectorId: '',
    typeCode: '',
    model: '',
    loop: '',
    central: '',
    finalCode: ''
  });

  // Reset dependent dropdowns when parent changes
  useEffect(() => {
    setSelectedUnit('');
    setSelectedSector('');
    setSelectedEquipment('');
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedSector('');
    setSelectedEquipment('');
  }, [selectedUnit]);

  useEffect(() => {
    setSelectedEquipment('');
    if (selectedSector) {
      setFormData(prev => ({ ...prev, sectorId: selectedSector }));
    }
  }, [selectedSector]);

  // Generate final code when form data changes
  useEffect(() => {
    if (formData.sectorId && formData.typeCode) {
      const sector = getSectorById(formData.sectorId);
      if (!sector) return;
      
      const unit = getUnitById(sector.unitId);
      if (!unit) return;
      
      const company = getCompanyById(unit.companyId);
      if (!company) return;
      
      const finalCode = `${company.code}_${unit.code}_${sector.code}_${formData.typeCode}_${formData.model}_${formData.loop}`;
      setFormData(prev => ({ ...prev, finalCode }));
    }
  }, [formData.sectorId, formData.typeCode, formData.model, formData.loop, getSectorById, getUnitById, getCompanyById]);

  // When an equipment is selected from the dropdown, populate the form
  useEffect(() => {
    if (selectedEquipment) {
      const equipment = equipments.find(e => e.id === selectedEquipment);
      if (equipment) {
        setFormData({
          ...equipment
        });
        setEditMode(true);
      }
    } else {
      resetForm();
      if (selectedSector) {
        setFormData(prev => ({ ...prev, sectorId: selectedSector }));
      }
    }
  }, [selectedEquipment, equipments]);

  const resetForm = () => {
    setFormData({
      id: '',
      sectorId: selectedSector,
      typeCode: '',
      model: '',
      loop: '',
      central: '',
      finalCode: ''
    });
    setEditMode(false);
    setSelectedEquipment('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sectorId) {
      alert('Por favor, selecione um setor');
      return;
    }
    
    if (editMode) {
      updateEquipment(formData);
    } else {
      addEquipment(formData);
    }
    
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  // Get related entities
  const companyUnits = selectedCompany ? getUnitsByCompany(selectedCompany) : [];
  const unitSectors = selectedUnit ? getSectorsByUnit(selectedUnit) : [];
  const sectorEquipments = selectedSector ? getEquipmentsBySector(selectedSector) : [];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Equipamentos</h1>
      
      {/* Hierarchy Selection Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Selecione a Hierarquia</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="companySelect" className="form-label">Empresa</label>
            <select
              id="companySelect"
              className="select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              required
            >
              <option value="">Selecione uma empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="unitSelect" className="form-label">Unidade</label>
            <select
              id="unitSelect"
              className="select"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedCompany}
              required
            >
              <option value="">Selecione uma unidade</option>
              {companyUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="sectorSelect" className="form-label">Setor</label>
            <select
              id="sectorSelect"
              className="select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              disabled={!selectedUnit}
              required
            >
              <option value="">Selecione um setor</option>
              {unitSectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name} ({sector.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {selectedSector && (
        <>
          {/* Equipment List Card */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Boxes className="mr-2 h-5 w-5" />
              Equipamentos Cadastrados
            </h2>
            
            {sectorEquipments.length === 0 ? (
              <p className="text-gray-500">Nenhum equipamento cadastrado para este setor</p>
            ) : (
              <div className="mb-4">
                <select
                  className="select"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                >
                  <option value="">Selecione um equipamento para editar</option>
                  {sectorEquipments.map(equipment => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.model} - {equipment.finalCode}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              className="btn btn-primary flex items-center"
              onClick={() => {
                resetForm();
                setEditMode(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </button>
          </div>
          
          {/* Equipment Form Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editMode ? (
                <>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Equipamento
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Equipamento
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="typeCode" className="form-label">Tipo de Equipamento *</label>
                  <select
                    id="typeCode"
                    name="typeCode"
                    className="select"
                    value={formData.typeCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {equipmentTypes.map(type => (
                      <option key={type.code} value={type.code}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="model" className="form-label">Modelo do Equipamento *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    className="input"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="loop" className="form-label">Laço *</label>
                  <input
                    type="text"
                    id="loop"
                    name="loop"
                    className="input"
                    value={formData.loop}
                    onChange={handleChange}
                    placeholder="Ex: L1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="central" className="form-label">Central</label>
                  <input
                    type="text"
                    id="central"
                    name="central"
                    className="input"
                    value={formData.central}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label htmlFor="finalCode" className="form-label">Código Final</label>
                  <input
                    type="text"
                    id="finalCode"
                    name="finalCode"
                    className="input font-mono"
                    value={formData.finalCode}
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    O código final é gerado automaticamente com base na hierarquia e nos dados do equipamento.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editMode ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default EquipmentForm;