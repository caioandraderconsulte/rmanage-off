import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { BuildingIcon, Plus, Edit, Save } from 'lucide-react';

interface UnitFormData {
  id: string;
  companyId: string;
  name: string;
  code: string;
}

const UnitForm: React.FC = () => {
  const { companies, units, addUnit, updateUnit, getUnitsByCompany } = useData();
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const [formData, setFormData] = useState<UnitFormData>({
    id: '',
    companyId: '',
    name: '',
    code: ''
  });

  // Reset available units when company changes
  useEffect(() => {
    setSelectedUnit('');
  }, [selectedCompany]);

  // When a unit is selected from the dropdown, populate the form
  useEffect(() => {
    if (selectedUnit) {
      const unit = units.find(u => u.id === selectedUnit);
      if (unit) {
        setFormData({
          ...unit
        });
        setEditMode(true);
      }
    } else {
      resetForm();
      if (selectedCompany) {
        setFormData(prev => ({ ...prev, companyId: selectedCompany }));
      }
    }
  }, [selectedUnit, units]);

  // Update companyId in form when selectedCompany changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, companyId: selectedCompany }));
  }, [selectedCompany]);

  const resetForm = () => {
    setFormData({
      id: '',
      companyId: selectedCompany,
      name: '',
      code: ''
    });
    setEditMode(false);
    setSelectedUnit('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId) {
      alert('Por favor, selecione uma empresa');
      return;
    }
    
    if (editMode) {
      updateUnit(formData);
    } else {
      addUnit(formData);
    }
    
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  // Get units for the selected company
  const companyUnits = selectedCompany ? getUnitsByCompany(selectedCompany) : [];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Unidades</h1>
      
      {/* Company Selection Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Selecione uma Empresa</h2>
        
        <select
          className="select mb-4"
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
      
      {selectedCompany && (
        <>
          {/* Unit List Card */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BuildingIcon className="mr-2 h-5 w-5" />
              Unidades Cadastradas
            </h2>
            
            {companyUnits.length === 0 ? (
              <p className="text-gray-500">Nenhuma unidade cadastrada para esta empresa</p>
            ) : (
              <div className="mb-4">
                <select
                  className="select"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="">Selecione uma unidade para editar</option>
                  {companyUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
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
              Nova Unidade
            </button>
          </div>
          
          {/* Unit Form Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editMode ? (
                <>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Unidade
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Unidade
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nome da Unidade *</label>
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
                    <label htmlFor="code" className="form-label">Código da Unidade</label>
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

export default UnitForm;