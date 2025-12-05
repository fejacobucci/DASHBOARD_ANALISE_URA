import React, { useState } from 'react';
import { Activity, Upload } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import MetricsCards from '../components/MetricsCards';
import NavigationFlow from '../components/NavigationFlow';
import JourneyTable from '../components/JourneyTable';
import DrillDownTable from '../components/DrillDownTable';
import { processarArquivoURA } from '../utils/etlProcessor';

const URADashboard = () => {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileLoad = (fileContent) => {
    console.log('=== INICIANDO PROCESSAMENTO ===');
    console.log('Tamanho do arquivo:', fileContent.length, 'caracteres');
    console.log('Primeiras 200 caracteres:', fileContent.substring(0, 200));

    setLoading(true);
    setError(null);
    setSelectedNode(null);

    // Simula pequeno delay para mostrar loading
    setTimeout(() => {
      try {
        console.log('Chamando processarArquivoURA...');
        const result = processarArquivoURA(fileContent);

        console.log('Resultado do processamento:', result);

        if (result.success) {
          console.log('✅ Sucesso!');
          console.log('Nodes:', result.data.nodes);
          console.log('Links:', result.data.links);
          console.log('Métricas:', result.data.metricas);
          console.log('Passos:', result.data.passos);

          setData(result.data);
          setLoading(false);
        } else {
          console.log('❌ Erro:', result.error);
          setError(result.error);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Exceção capturada:', err);
        setError(err.message || 'Erro desconhecido ao processar arquivo');
        setLoading(false);
      }
    }, 500);
  };

  const handleNodeClick = (nodeName) => {
    setSelectedNode(nodeName);
    // Scroll suave até o diagrama Sankey quando clicar em uma linha da tabela
    setTimeout(() => {
      const sankey = document.querySelector('.sankey-container');
      if (sankey) {
        sankey.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleReset = () => {
    setData(null);
    setSelectedNode(null);
    setError(null);
  };

  return (
    <div className="ura-dashboard">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processando dados...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao processar arquivo</h3>
          <p>{error}</p>
          <button className="error-button" onClick={handleReset}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!data && !loading && !error && (
        <FileUploader onFileLoad={handleFileLoad} />
      )}

      {data && !loading && (
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="dashboard-header-title">
              <Activity size={24} />
              <h2>Dashboard URA - Análise de Fluxos</h2>
            </div>
            <button className="reset-button" onClick={handleReset}>
              <Upload size={18} />
              Carregar Novo Arquivo
            </button>
          </div>

          <MetricsCards metricas={data.metricas} />

          <div className="analysis-grid">
            <div className="sankey-column">
              <NavigationFlow
                data={{ nodes: data.nodes, links: data.links }}
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
                variant="compact"
              />

              <JourneyTable
                passos={data.passos}
                selectedNode={selectedNode}
              />
            </div>

            <DrillDownTable
              passos={data.passos}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default URADashboard;
