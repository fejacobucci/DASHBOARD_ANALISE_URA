import React, { useState } from 'react';
import { Upload, TrendingUp, Download, FileText } from 'lucide-react';
import CustomSankey from '../components/CustomSankey';
import SankeyMetrics from '../components/SankeyMetrics';
import HeatmapTemporal from '../components/HeatmapTemporal';
import TemporalComparison from '../components/TemporalComparison';
import SankeyDetailModal from '../components/SankeyDetailModal';
import { processSpreadsheet, validateSpreadsheetFormat, exportSankeyData } from '../utils/spreadsheetProcessor';
import { exportSankeyReportToPDF } from '../utils/pdfExporter';
import './SankeyDiagramPage.css';

const SankeyDiagramPage = () => {
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validExtensions = ['.xls', '.xlsx', '.csv', '.ods'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      setError('Formato de arquivo não suportado. Use XLS, XLSX, CSV ou ODS.');
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const result = await processSpreadsheet(file);

      if (result.success) {
        // Valida formato dos dados
        const validation = validateSpreadsheetFormat(result.data);

        if (!validation.valid) {
          setError(validation.error);
          setLoading(false);
          return;
        }

        console.log('Dados processados com sucesso:', result.data);
        setData(result.data);
        setRawData(result.rawData);
        setLoading(false);
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError(err.error || 'Erro desconhecido ao processar arquivo');
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (data) {
      exportSankeyData(data, `sankey-${fileName.replace(/\.[^/.]+$/, '')}.json`);
    }
  };

  const handleExportPDF = async () => {
    if (data) {
      setLoading(true);
      try {
        const result = await exportSankeyReportToPDF(data, fileName);
        if (result.success) {
          console.log('PDF exportado com sucesso:', result.fileName);
        } else {
          console.error('Erro ao exportar PDF:', result.message);
          setError(result.message);
        }
      } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        setError('Erro ao gerar relatório PDF');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setData(null);
    setRawData(null);
    setError(null);
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleNodeClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleLinkClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="sankey-page">
      <div className="sankey-page-header">
        <div className="sankey-page-title-group">
          <TrendingUp size={32} className="sankey-page-icon" />
          <div>
            <h1 className="sankey-page-title">Diagrama de Sankey Customizado</h1>
            <p className="sankey-page-subtitle">
              Visualização de fluxos a partir de planilhas
            </p>
          </div>
        </div>

        {data && !loading && (
          <label className="sankey-header-upload-button">
            <input
              type="file"
              accept=".xls,.xlsx,.csv,.ods"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Upload size={18} />
            Carregar Novo Arquivo
          </label>
        )}
      </div>

      <div className="sankey-page-content">
        {!data && !loading && (
          <div className="sankey-upload-container">
            <div className="sankey-upload-card">
              <Upload size={48} className="sankey-upload-icon" />
              <h2>Carregar Planilha</h2>
              <p>Faça upload de um arquivo XLS, XLSX, CSV ou ODS</p>

              <label className="sankey-upload-button">
                <input
                  type="file"
                  accept=".xls,.xlsx,.csv,.ods"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                Selecionar Arquivo
              </label>

              <div className="sankey-upload-info">
                <p><strong>Formatos aceitos:</strong></p>
                <ul>
                  <li>Excel (.xls, .xlsx)</li>
                  <li>CSV (.csv)</li>
                  <li>OpenDocument (.ods)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="sankey-loading">
            <div className="sankey-loading-spinner"></div>
            <p>Processando arquivo...</p>
          </div>
        )}

        {error && (
          <div className="sankey-error">
            <div className="sankey-error-icon">⚠️</div>
            <h3>Erro ao processar arquivo</h3>
            <p>{error}</p>
            <button className="sankey-error-button" onClick={handleReset}>
              Tentar Novamente
            </button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Métricas e Dimensões Temporais */}
            <SankeyMetrics data={data} />

            {/* Diagrama de Fluxo Principal */}
            <div className="sankey-visualization">
              <div className="sankey-viz-header">
                <div>
                  <h3>Diagrama de Fluxo da Jornada</h3>
                  <p className="sankey-viz-subtitle">
                    {data.stats.totalNodes} nós • {data.stats.totalLinks} transições •
                    {data.stats.totalJornadas && ` ${data.stats.totalJornadas} jornadas`}
                  </p>
                </div>
                <div className="sankey-viz-actions">
                  <button className="sankey-pdf-button" onClick={handleExportPDF} title="Exportar relatório em PDF">
                    <FileText size={18} />
                    Exportar PDF
                  </button>
                  <button className="sankey-export-button" onClick={handleExportData} title="Exportar dados">
                    <Download size={18} />
                    Exportar JSON
                  </button>
                </div>
              </div>

              <div className="sankey-viz-container">
                <CustomSankey
                  data={data}
                  onNodeClick={handleNodeClick}
                  onLinkClick={handleLinkClick}
                />
              </div>
            </div>

            {/* Mapa de Calor Temporal */}
            <div className="sankey-section">
              <div className="section-header">
                <h3>Análise Temporal</h3>
                <p>Visualização do volume de chamadas por hora e dia da semana</p>
              </div>
              <HeatmapTemporal data={data} />
            </div>

            {/* Comparação Temporal */}
            <div className="sankey-section">
              <TemporalComparison data={data} />
            </div>

            {/* Modal de Detalhes */}
            <SankeyDetailModal
              isOpen={modalOpen}
              onClose={handleCloseModal}
              selectedItem={selectedItem}
              rawData={rawData}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SankeyDiagramPage;
