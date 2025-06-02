import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Building2, Plus, Edit, Save } from 'lucide-react';

interface CompanyFormData {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  responsible: string;
  manufacturer: string;
  centralModel: string;
  cbProject: string;
  avcb: string;
  date: string;
  code: string;
}

const CompanyForm: React.FC = () => {
  const { companies, addCompany, updateCompany } = useData();
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  
  const [formData, setFormData] = useState<CompanyFormData>({
    id: '',
    name: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    responsible: '',
    manufacturer: '',
    centralModel: '',
    cbProject: '',
    avcb: '',
    date: new Date().toISOString().split('T')[0],
    code: ''
  });

  // When a company is selected from the dropdown, populate the form
  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company) {
        setFormData({
          ...company,
          date: new Date(company.date).toISOString().split('T')[0]
        });
        setEditMode(true);
      }
    } else {
      resetForm();
    }
  }, [selectedCompany, companies]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      address: '',
      phone: '',
      website: '',
      email: '',
      responsible: '',
      manufacturer: '',
      centralModel: '',
      cbProject: '',
      avcb: '',
      date: new Date().toISOString().split('T')[0],
      code: ''
    });
    setEditMode(false);
    setSelectedCompany('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode) {
      updateCompany(formData);
    } else {
      addCompany(formData);
    }
    
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Empresas</h1>
      
      {/* Company List Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Empresas Cadastradas
        </h2>
        
        {companies.length === 0 ? (
          <p className="text-gray-500">Nenhuma empresa cadastrada</p>
        ) : (
          <div className="mb-4">
            <select
              className="select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Selecione uma empresa para editar</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.code})
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
          Nova Empresa
        </button>
      </div>
      
      {/* Company Form Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {editMode ? (
            <>
              <Edit className="mr-2 h-5 w-5" />
              Editar Empresa
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              Nova Empresa
            </>
          )}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nome da Empresa *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address" className="form-label">Endereço</label>
              <input
                type="text"
                id="address"
                name="address"
                className="input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Telefone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="website" className="form-label">Site</label>
              <input
                type="url"
                id="website"
                name="website"
                className="input"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="responsible" className="form-label">Responsável</label>
              <input
                type="text"
                id="responsible"
                name="responsible"
                className="input"
                value={formData.responsible}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="manufacturer" className="form-label">Fabricante</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                className="input"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="centralModel" className="form-label">Modelo Central</label>
              <input
                type="text"
                id="centralModel"
                name="centralModel"
                className="input"
                value={formData.centralModel}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cbProject" className="form-label">Projeto CB</label>
              <input
                type="text"
                id="cbProject"
                name="cbProject"
                className="input"
                value={formData.cbProject}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="avcb" className="form-label">AVCB</label>
              <input
                type="text"
                id="avcb"
                name="avcb"
                className="input"
                value={formData.avcb}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date" className="form-label">Data</label>
              <input
                type="date"
                id="date"
                name="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            
            {editMode && (
              <div className="form-group">
                <label htmlFor="code" className="form-label">Código da Empresa</label>
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
    </div>
  );
};

export default CompanyForm;