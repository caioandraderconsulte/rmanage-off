import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Factory, Plus, Edit, Save } from 'lucide-react';

interface SectorFormData {
  id: string;
  unitId: string;
  name: string;
  code: string;
}

const SectorForm: React.FC = () => {
  const { companies, units, sectors, addSector, updateSector, getUnitsByCompany, getSectorsByUnit } = useData();
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  
  const [formData, setFormData] = useState<SectorFormData>({
    id: '',
    unitId: '',
    name: '',
    code: ''
  });

  // Reset available units when company changes
  useEffect(() => {
    setSelectedUnit('');
    setSelectedSector('');
  }, [selectedCompany]);

  // Reset available sectors when unit changes
  useEffect(() => {
    setSelectedSector('');
    if (selectedUnit) {
      setFormData(prev => ({ ...prev, unitId: selectedUnit }));
    }
  }, [selectedUnit]);

  // When a sector is selected from the dropdown, populate the form
  useEffect(() => {
    if (selectedSector) {
      const sector = sectors.find(s => s.id === selectedSector);
      if (sector) {
        setFormData({
          ...sector
        });
        setEditMode(true);
      }
    } else {
      resetForm();
      if (selectedUnit) {
        setFormData(prev => ({ ...prev, unitId: selectedUnit }));
      }
    }
  }, [selectedSector, sectors]);

  const resetForm = () => {
    setFormData({
      id: '',
      unitId: selectedUnit,
      name: '',
      code: ''
    });
    setEditMode(false);
    setSelectedSector('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unitId) {
      alert('Por favor, selecione uma unidade');
      return;
    }
    
    if (editMode) {
      updateSector(formData);
    } else {
      addSector(formData);
    }
    
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  // Get units for the selected company
  const companyUnits = selectedCompany ? getUnitsByCompany(selectedCompany) : [];
  
  // Get sectors for the selected unit
  const unitSectors = selectedUnit ? getSectorsByUnit(selectedUnit) : [];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Setores</h1>
      
      {/* Hierarchy Selection Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Selecione a Hierarquia</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
      
      {selectedUnit && (
        <>
          {/* Sector List Card */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Factory className="mr-2 h-5 w-5" />
              Setores Cadastrados
            </h2>
            
            {unitSectors.length === 0 ? (
              <p className="text-gray-500">Nenhum setor cadastrado para esta unidade</p>
            ) : (
              <div className="mb-4">
                <select
                  className="select"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="">Selecione um setor para editar</option>
                  {unitSectors.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name} ({sector.code})
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
              Novo Setor
            </button>
          </div>
          
          {/* Sector Form Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editMode ? (
                <>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Setor
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Setor
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nome do Setor *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    O código será gerado automaticamente com as 3 primeiras letras do nome.
                  </p>
                </div>
                
                {editMode && (
                  <div className="form-group">
                    <label htmlFor="code" className="form-label">Código do Setor</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      className="input"
                      value={formData.code}
                      disabled
                    />
                  </div>
                )}
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

export default SectorForm;