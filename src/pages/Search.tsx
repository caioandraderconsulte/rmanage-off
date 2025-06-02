import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search as SearchIcon, Download, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
  const { 
    searchEquipments, 
    getCompanyById, 
    getUnitById, 
    getSectorById, 
    getEquipmentTypeByCode,
    exportToCSV
  } = useData();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const handleSearch = () => {
    if (!searchTerm && !showResults) {
      // If first search and empty, show all
      performSearch('');
      return;
    }
    
    performSearch(searchTerm);
  };
  
  const performSearch = (term: string) => {
    const results = searchEquipments(term);
    
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
        equipmentTypeName: equipmentType?.name || 'N/A'
      };
    });
    
    setSearchResults(enhancedResults);
    setShowResults(true);
  };
  
  const handleExportCSV = () => {
    if (searchResults.length === 0) return;
    
    // Format data for CSV export
    const csvData = searchResults.map(result => ({
      Empresa: result.companyName,
      Unidade: result.unitName,
      Setor: result.sectorName,
      Equipamento: result.equipmentTypeName,
      COD: result.typeCode,
      Modelo: result.model,
      Laco: result.loop,
      Central: result.central,
      CodigoFinal: result.finalCode
    }));
    
    exportToCSV(csvData);
  };
  
  const navigateToEdit = (equipment: any) => {
    // Store selected equipment ID in session storage
    sessionStorage.setItem('selectedEquipmentId', equipment.id);
    
    // Navigate to equipment form
    navigate('/equipamentos');
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Busca de Equipamentos</h1>
      
      {/* Search Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <SearchIcon className="mr-2 h-5 w-5" />
          Buscar Equipamentos
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="input flex-grow"
            placeholder="Digite qualquer termo para buscar (empresa, unidade, setor, código, modelo...)"
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
      </div>
      
      {/* Search Results Card */}
      {showResults && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Resultados da Busca ({searchResults.length})
            </h2>
            {searchResults.length > 0 && (
              <button
                type="button"
                className="btn btn-outline flex items-center"
                onClick={handleExportCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </button>
            )}
          </div>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <SearchIcon className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhum equipamento encontrado com os termos da busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 border-b">Empresa</th>
                    <th className="px-4 py-3 border-b">Unidade</th>
                    <th className="px-4 py-3 border-b">Setor</th>
                    <th className="px-4 py-3 border-b">Equipamento</th>
                    <th className="px-4 py-3 border-b">COD</th>
                    <th className="px-4 py-3 border-b">Modelo</th>
                    <th className="px-4 py-3 border-b">Laço</th>
                    <th className="px-4 py-3 border-b">Central</th>
                    <th className="px-4 py-3 border-b">Código Final</th>
                    <th className="px-4 py-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(result => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{result.companyName}</td>
                      <td className="px-4 py-3">{result.unitName}</td>
                      <td className="px-4 py-3">{result.sectorName}</td>
                      <td className="px-4 py-3">{result.equipmentTypeName}</td>
                      <td className="px-4 py-3">{result.typeCode}</td>
                      <td className="px-4 py-3">{result.model}</td>
                      <td className="px-4 py-3">{result.loop}</td>
                      <td className="px-4 py-3">{result.central}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs bg-gray-100 p-1 rounded">
                          {result.finalCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline flex items-center"
                          onClick={() => navigateToEdit(result)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;