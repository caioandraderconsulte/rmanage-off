import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Search, Plus, Save, Filter, Eye, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface InspectionFormData {
  id: string;
  equipmentId: string;
  description: string;
  descriptionPhoto?: string;
  functioning: boolean;
  malfunctionDescription: string;
  malfunctionPhoto?: string;
  date: string;
  nextDate: string;
}

const InspectionForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    companies, 
    equipments, 
    inspections,
    addInspection,
    getCompanyById,
    getUnitById,
    getSectorById,
    getInspectionsByEquipment,
    getEquipmentById,
    getUnitsByCompany,
    getSectorsByUnit,
    getEquipmentsBySector,
    getEquipmentTypeByCode
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [showNewInspectionForm, setShowNewInspectionForm] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'working' | 'notWorking'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState('');
  
  const [formData, setFormData] = useState<InspectionFormData>({
    id: '',
    equipmentId: '',
    description: '',
    functioning: true,
    malfunctionDescription: '',
    date: new Date().toISOString().split('T')[0],
    nextDate: ''
  });

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setSelectedUnit('');
    setSelectedSector('');
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedSector('');
  }, [selectedUnit]);
  
  // Search for equipment
  const handleSearch = () => {
    if (!searchTerm) return;
    
    const results = equipments.filter(equipment => 
      equipment.finalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Enhance results with related entity information
    const enhancedResults = results.map(equipment => {
      const sector = getSectorById(equipment.sectorId);
      const unit = sector ? getUnitById(sector.unitId) : null;
      const company = unit ? getCompanyById(unit.companyId) : null;
      const equipmentType = getEquipmentTypeByCode(equipment.typeCode);
      
      return {
        ...equipment,
        sectorName: sector?.name || 'N/A',
        unitName: unit?.name || 'N/A',
        companyName: company?.name || 'N/A',
        typeName: equipmentType?.name || 'N/A'
      };
    });
    
    setSearchResults(enhancedResults);
  };
  
  // Handle equipment selection
  useEffect(() => {
    if (selectedEquipment) {
      setFormData(prev => ({ ...prev, equipmentId: selectedEquipment }));
    } else {
      resetForm();
    }
  }, [selectedEquipment]);
  
  const resetForm = () => {
    setFormData({
      id: '',
      equipmentId: '',
      description: '',
      functioning: true,
      malfunctionDescription: '',
      date: new Date().toISOString().split('T')[0],
      nextDate: ''
    });
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (e.target as HTMLInputElement).checked 
      }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            [name]: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentId) {
      alert('Por favor, selecione um equipamento');
      return;
    }
    
    addInspection(formData);
    resetForm();
    setSelectedEquipment('');
    setSearchResults([]);
    setSearchTerm('');
    setShowNewInspectionForm(false);
  };

  // Get filtered units and sectors
  const filteredUnits = selectedCompany ? getUnitsByCompany(selectedCompany) : [];
  const filteredSectors = selectedUnit ? getSectorsByUnit(selectedUnit) : [];
  const filteredEquipments = selectedSector ? getEquipmentsBySector(selectedSector) : [];

  // Get unique equipment types and models
  const uniqueTypes = [...new Set(filteredEquipments.map(e => e.typeCode))];
  const uniqueModels = [...new Set(filteredEquipments.map(e => e.model))];

  // Filter inspections based on all criteria
  const filteredInspections = inspections.filter(inspection => {
    const equipment = getEquipmentById(inspection.equipmentId);
    if (!equipment) return false;

    const sector = getSectorById(equipment.sectorId);
    if (!sector) return false;

    const unit = getUnitById(sector.unitId);
    if (!unit) return false;

    const company = getCompanyById(unit.companyId);
    if (!company) return false;

    // Apply filters
    if (selectedCompany && company.id !== selectedCompany) return false;
    if (selectedUnit && unit.id !== selectedUnit) return false;
    if (selectedSector && sector.id !== selectedSector) return false;
    if (selectedType && equipment.typeCode !== selectedType) return false;
    if (selectedModel && equipment.model !== selectedModel) return false;
    if (filterStatus === 'working' && !inspection.functioning) return false;
    if (filterStatus === 'notWorking' && inspection.functioning) return false;

    if (dateFilter !== 'all') {
      const inspectionDate = new Date(inspection.date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === '7days' && diffDays > 7) return false;
      if (dateFilter === '30days' && diffDays > 30) return false;
      if (dateFilter === '90days' && diffDays > 90) return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return equipment.finalCode.toLowerCase().includes(searchLower);
    }

    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const lineHeight = 7;

      // Company Information (Contractor)
      doc.setFontSize(18);
      doc.text('RELATÓRIO TÉCNICO DE INSPEÇÃO', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 3;

      // Contractor Information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('EMPRESA CONTRATADA:', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text('Razão Social: NOME DA EMPRESA LTDA', 15, yPos);
      yPos += lineHeight;
      doc.text('CNPJ: XX.XXX.XXX/0001-XX', 15, yPos);
      yPos += lineHeight;
      doc.text('Endereço: Rua Example, 123 - Cidade/UF', 15, yPos);
      yPos += lineHeight;
      doc.text('Responsável Técnico: Nome do Responsável', 15, yPos);
      yPos += lineHeight;
      doc.text('CREA: XXXXX-X', 15, yPos);
      yPos += lineHeight * 2;

      // Client Information
      if (selectedCompany) {
        const company = getCompanyById(selectedCompany);
        if (company) {
          doc.setFont(undefined, 'bold');
          doc.text('EMPRESA CONTRATANTE:', 15, yPos);
          yPos += lineHeight;
          doc.setFont(undefined, 'normal');
          doc.text(`Razão Social: ${company.name}`, 15, yPos);
          yPos += lineHeight;
          doc.text(`Endereço: ${company.address}`, 15, yPos);
          yPos += lineHeight;
          doc.text(`Responsável: ${company.responsible}`, 15, yPos);
          yPos += lineHeight;
          doc.text(`Projeto CB: ${company.cbProject}`, 15, yPos);
          yPos += lineHeight;
          doc.text(`AVCB: ${company.avcb}`, 15, yPos);
          yPos += lineHeight * 2;
        }
      }

      // Inspections Summary
      doc.setFont(undefined, 'bold');
      doc.text('RESUMO DAS INSPEÇÕES:', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(`Total de equipamentos inspecionados: ${filteredInspections.length}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Equipamentos em funcionamento: ${
        filteredInspections.filter(i => i.functioning).length
      }`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Equipamentos com problemas: ${
        filteredInspections.filter(i => !i.functioning).length
      }`, 15, yPos);
      yPos += lineHeight * 2;

      // Detailed Inspections
      doc.setFont(undefined, 'bold');
      doc.text('DETALHAMENTO DAS INSPEÇÕES:', 15, yPos);
      yPos += lineHeight * 2;

      for (const inspection of filteredInspections) {
        const equipment = getEquipmentById(inspection.equipmentId);
        if (!equipment) continue;

        const sector = getSectorById(equipment.sectorId);
        const unit = sector ? getUnitById(sector.unitId) : null;
        const equipmentType = getEquipmentTypeByCode(equipment.typeCode);

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`Equipamento: ${equipment.finalCode}`, 15, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');
        doc.text(`Tipo: ${equipmentType?.name || 'N/A'}`, 15, yPos);
        yPos += lineHeight;
        doc.text(`Modelo: ${equipment.model}`, 15, yPos);
        yPos += lineHeight;
        doc.text(`Local: ${unit?.name || 'N/A'} - ${sector?.name || 'N/A'}`, 15, yPos);
        yPos += lineHeight;
        doc.text(`Data da Inspeção: ${new Date(inspection.date).toLocaleDateString('pt-BR')}`, 15, yPos);
        yPos += lineHeight;
        doc.text(`Status: ${inspection.functioning ? 'Em funcionamento' : 'Com problemas'}`, 15, yPos);
        yPos += lineHeight;

        const descriptionLines = doc.splitTextToSize(`Descrição: ${inspection.description}`, pageWidth - 30);
        doc.text(descriptionLines, 15, yPos);
        yPos += (descriptionLines.length * lineHeight);

        if (!inspection.functioning) {
          const malfunctionLines = doc.splitTextToSize(
            `Problema Encontrado: ${inspection.malfunctionDescription}`,
            pageWidth - 30
          );
          doc.text(malfunctionLines, 15, yPos);
          yPos += (malfunctionLines.length * lineHeight);
        }

        yPos += lineHeight * 2;
      }

      // Footer
      const today = new Date().toLocaleDateString('pt-BR');
      doc.text(`Data de emissão: ${today}`, 15, doc.internal.pageSize.getHeight() - 20);

      // Save the PDF
      const fileName = `relatorio_inspecoes_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar relatório PDF');
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registro de Inspeções</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-outline flex items-center"
            onClick={generatePDF}
            disabled={filteredInspections.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Gerar Relatório
          </button>
          <button
            className="btn btn-primary flex items-center"
            onClick={() => setShowNewInspectionForm(!showNewInspectionForm)}
          >
            {showNewInspectionForm ? (
              'Voltar para Lista'
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Nova Inspeção
              </>
            )}
          </button>
        </div>
      </div>

      {showNewInspectionForm ? (
        <>
          {/* Equipment Search Card */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Buscar Equipamento
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                className="input flex-grow"
                placeholder="Digite o código ou modelo do equipamento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Resultados da Busca</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2 border-b">Código</th>
                        <th className="px-4 py-2 border-b">Tipo</th>
                        <th className="px-4 py-2 border-b">Modelo</th>
                        <th className="px-4 py-2 border-b">Empresa</th>
                        <th className="px-4 py-2 border-b">Unidade</th>
                        <th className="px-4 py-2 border-b">Setor</th>
                        <th className="px-4 py-2 border-b">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(equipment => (
                        <tr key={equipment.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{equipment.finalCode}</td>
                          <td className="px-4 py-2">{equipment.typeName}</td>
                          <td className="px-4 py-2">{equipment.model}</td>
                          <td className="px-4 py-2">{equipment.companyName}</td>
                          <td className="px-4 py-2">{equipment.unitName}</td>
                          <td className="px-4 py-2">{equipment.sectorName}</td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelectedEquipment(equipment.id)}
                            >
                              Selecionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {selectedEquipment && (
            <>
              {/* Inspection Form Card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Inspeção
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group md:col-span-2">
                      <label htmlFor="description" className="form-label">Descrição da Inspeção *</label>
                      <textarea
                        id="description"
                        name="description"
                        className="input h-32 resize-none"
                        value={formData.description}
                        onChange={handleChange}
                        maxLength={1000}
                        placeholder="Descreva a inspeção em até 1000 caracteres"
                        required
                      ></textarea>
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/1000 caracteres
                      </p>
                    </div>

                    <div className="form-group md:col-span-2">
                      <label htmlFor="descriptionPhoto" className="form-label">Foto da Inspeção</label>
                      <input
                        type="file"
                        id="descriptionPhoto"
                        name="descriptionPhoto"
                        className="input"
                        accept="image/*"
                        onChange={handleChange}
                      />
                      {formData.descriptionPhoto && (
                        <img
                          src={formData.descriptionPhoto}
                          alt="Preview"
                          className="mt-2 max-w-xs rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="form-group">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="functioning"
                          name="functioning"
                          className="w-4 h-4 rounded"
                          checked={formData.functioning}
                          onChange={handleChange}
                        />
                        <label htmlFor="functioning" className="form-label m-0">
                          Equipamento em funcionamento
                        </label>
                      </div>
                    </div>
                    
                    {!formData.functioning && (
                      <>
                        <div className="form-group md:col-span-2">
                          <label htmlFor="malfunctionDescription" className="form-label">
                            Descrição do Mau Funcionamento *
                          </label>
                          <textarea
                            id="malfunctionDescription"
                            name="malfunctionDescription"
                            className="input h-24 resize-none"
                            value={formData.malfunctionDescription}
                            onChange={handleChange}
                            placeholder="Descreva o problema encontrado"
                            required={!formData.functioning}
                          ></textarea>
                        </div>

                        <div className="form-group md:col-span-2">
                          <label htmlFor="malfunctionPhoto" className="form-label">Foto do Problema</label>
                          <input
                            type="file"
                            id="malfunctionPhoto"
                            name="malfunctionPhoto"
                            className="input"
                            accept="image/*"
                            onChange={handleChange}
                          />
                          {formData.malfunctionPhoto && (
                            <img
                              src={formData.malfunctionPhoto}
                              alt="Preview"
                              className="mt-2 max-w-xs rounded-lg"
                            />
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">Data da Inspeção *</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="nextDate" className="form-label">Data da Próxima Inspeção *</label>
                      <input
                        type="date"
                        id="nextDate"
                        name="nextDate"
                        className="input"
                        value={formData.nextDate}
                        onChange={handleChange}
                        min={formData.date}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Registrar Inspeção
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </>
      ) : (
        /* Inspections List View */
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Empresa</label>
                <select
                  className="select"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">Todas as empresas</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Unidade</label>
                <select
                  className="select"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
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

              <div>
                <label className="form-label">Setor</label>
                <select
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

              <div>
                <label className="form-label">Tipo de Equipamento</label>
                <select
                  className="select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={!selectedSector}
                >
                  <option value="">Todos os tipos</option>
                  {uniqueTypes.map(type => {
                    const equipType = getEquipmentTypeByCode(type);
                    return (
                      <option key={type} value={type}>
                        {equipType?.name || type}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="form-label">Modelo</label>
                <select
                  className="select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedSector}
                >
                  <option value="">Todos os modelos</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="working">Em funcionamento</option>
                  <option value="notWorking">Com problemas</option>
                </select>
              </div>

              <div>
                <label className="form-label">Período</label>
                <select
                  className="select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                >
                  <option value="all">Todo período</option>
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                </select>
              </div>

              <div>
                <label className="form-label">Código do Equipamento</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Digite o código"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredInspections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardCheck className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhuma inspeção encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 border-b">Data</th>
                    <th className="px-4 py-3 border-b">Próxima</th>
                    <th className="px-4 py-3 border-b">Equipamento</th>
                    <th className="px-4 py-3 border-b">Local</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInspections.map(inspection => {
                    const equipment = getEquipmentById(inspection.equipmentId);
                    if (!equipment) return null;

                    const sector = getSectorById(equipment.sectorId);
                    const unit = sector ? getUnitById(sector.unitId) : null;
                    const company = unit ? getCompanyById(unit.companyId) : null;
                    const equipmentType = getEquipmentTypeByCode(equipment.typeCode);

                    return (
                      <tr key={inspection.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {new Date(inspection.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(inspection.nextDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{equipment.finalCode}</div>
                          <div className="text-sm text-gray-500">
                            {equipmentType?.name} - {equipment.model}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{company?.name}</div>
                          <div className="text-sm text-gray-500">
                            {unit?.name} - {sector?.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            inspection.functioning ? 'bg-green-100 text-green-800' : 'bg-error text-white'
                          }`}>
                            {inspection.functioning ? 'OK' : 'Problema'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline flex items-center"
                            onClick={() => navigate(`/inspecoes/${inspection.id}`)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionForm;