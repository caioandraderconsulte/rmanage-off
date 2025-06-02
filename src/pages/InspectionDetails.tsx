import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, CheckCircle, XCircle, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const InspectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    inspections, 
    getEquipmentById, 
    getSectorById, 
    getUnitById, 
    getCompanyById 
  } = useData();

  const inspection = inspections.find(i => i.id === id);
  
  if (!inspection) {
    return (
      <div className="container mx-auto p-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-error">Inspeção não encontrada</h1>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => navigate('/inspecoes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  const equipment = getEquipmentById(inspection.equipmentId);
  const sector = equipment ? getSectorById(equipment.sectorId) : null;
  const unit = sector ? getUnitById(sector.unitId) : null;
  const company = unit ? getCompanyById(unit.companyId) : null;

  const generateReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const lineHeight = 7;

      // Title
      doc.setFontSize(18);
      doc.text('Relatório de Inspeção', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset font size for content
      doc.setFontSize(12);

      // Company and Location Info
      doc.setFont(undefined, 'bold');
      doc.text('Informações da Empresa e Localização', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(`Empresa: ${company?.name || 'N/A'}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Unidade: ${unit?.name || 'N/A'}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Setor: ${sector?.name || 'N/A'}`, 15, yPos);
      yPos += lineHeight * 2;

      // Equipment Info
      doc.setFont(undefined, 'bold');
      doc.text('Informações do Equipamento', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(`Código: ${equipment?.finalCode || 'N/A'}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Modelo: ${equipment?.model || 'N/A'}`, 15, yPos);
      yPos += lineHeight * 2;

      // Inspection Info
      doc.setFont(undefined, 'bold');
      doc.text('Detalhes da Inspeção', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(`Data da Inspeção: ${new Date(inspection.date).toLocaleDateString('pt-BR')}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Próxima Inspeção: ${new Date(inspection.nextDate).toLocaleDateString('pt-BR')}`, 15, yPos);
      yPos += lineHeight;
      doc.text(`Status: ${inspection.functioning ? 'Em funcionamento' : 'Com problemas'}`, 15, yPos);
      yPos += lineHeight * 2;

      // Description
      doc.setFont(undefined, 'bold');
      doc.text('Descrição da Inspeção', 15, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      const descriptionLines = doc.splitTextToSize(inspection.description, pageWidth - 30);
      doc.text(descriptionLines, 15, yPos);
      yPos += (descriptionLines.length * lineHeight) + lineHeight;

      // Malfunction Info (if applicable)
      if (!inspection.functioning) {
        doc.setFont(undefined, 'bold');
        doc.text('Descrição do Problema', 15, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');
        const malfunctionLines = doc.splitTextToSize(inspection.malfunctionDescription, pageWidth - 30);
        doc.text(malfunctionLines, 15, yPos);
      }

      // Add photos if they exist
      if (inspection.descriptionPhoto || inspection.malfunctionPhoto) {
        doc.addPage();
        yPos = 20;
        doc.setFont(undefined, 'bold');
        doc.text('Fotos da Inspeção', pageWidth / 2, yPos, { align: 'center' });
        yPos += lineHeight * 2;

        if (inspection.descriptionPhoto) {
          doc.text('Foto da Inspeção:', 15, yPos);
          yPos += lineHeight;
          doc.addImage(inspection.descriptionPhoto, 'JPEG', 15, yPos, 180, 100);
          yPos += 110;
        }

        if (inspection.malfunctionPhoto) {
          doc.text('Foto do Problema:', 15, yPos);
          yPos += lineHeight;
          doc.addImage(inspection.malfunctionPhoto, 'JPEG', 15, yPos, 180, 100);
        }
      }

      // Save the PDF
      const fileName = `inspecao_${equipment?.finalCode}_${new Date(inspection.date).toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <button 
          className="btn btn-outline mr-4"
          onClick={() => navigate('/inspecoes')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold flex-grow">Detalhes da Inspeção</h1>
        <button
          className="btn btn-primary"
          onClick={generateReport}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Gerar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment and Location Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Informações do Equipamento</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Código do Equipamento</label>
              <p className="font-mono">{equipment?.finalCode}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Modelo</label>
              <p>{equipment?.model}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Empresa</label>
              <p>{company?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Unidade</label>
              <p>{unit?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Setor</label>
              <p>{sector?.name}</p>
            </div>
          </div>
        </div>

        {/* Inspection Status */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Status da Inspeção</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Data da Inspeção</label>
              <p>{new Date(inspection.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Próxima Inspeção</label>
              <p>{new Date(inspection.nextDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Estado</label>
              <div className="flex items-center mt-1">
                {inspection.functioning ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success mr-2" />
                    <span className="text-success">Em funcionamento</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-error mr-2" />
                    <span className="text-error">Com problemas</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Description */}
        <div className="card md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Descrição da Inspeção</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Descrição</label>
              <p className="mt-1 whitespace-pre-wrap">{inspection.description}</p>
            </div>
            {inspection.descriptionPhoto && (
              <div>
                <label className="text-sm text-gray-500">Foto da Inspeção</label>
                <img 
                  src={inspection.descriptionPhoto} 
                  alt="Foto da inspeção"
                  className="mt-2 max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Malfunction Description (if applicable) */}
        {!inspection.functioning && (
          <div className="card md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-error">
              Descrição do Problema
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Problema Encontrado</label>
                <p className="mt-1 whitespace-pre-wrap">{inspection.malfunctionDescription}</p>
              </div>
              {inspection.malfunctionPhoto && (
                <div>
                  <label className="text-sm text-gray-500">Foto do Problema</label>
                  <img 
                    src={inspection.malfunctionPhoto} 
                    alt="Foto do problema"
                    className="mt-2 max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetails;