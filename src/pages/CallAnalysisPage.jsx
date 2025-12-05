import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Search, Phone, Filter, X, FileSpreadsheet } from 'lucide-react';
import { processSpreadsheet } from '../utils/spreadsheetProcessor';
import CallSearchFilters from '../components/CallSearchFilters';
import CallsTable from '../components/CallsTable';
import CallFlowModal from '../components/CallFlowModal';
import './CallAnalysisPage.css';

const CallAnalysisPage = () => {
  const [rawData, setRawData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [flowModalCall, setFlowModalCall] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      if (result.success && result.rawData) {
        const dataHeaders = result.rawData[0];
        const dataRows = result.rawData.slice(1);

        setHeaders(dataHeaders);
        setRawData(result.rawData);

        // Processa as ligações
        const processedCalls = processCalls(dataHeaders, dataRows);
        setCalls(processedCalls);
        setFilteredCalls(processedCalls);
        setLoading(false);
      } else {
        setError(result.error || 'Erro ao processar arquivo');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError('Erro desconhecido ao processar arquivo');
      setLoading(false);
    }
  };

  const processCalls = (headers, rows) => {
    const colIndexes = {
      dataRef: headers.indexOf('DATA_REF'),
      horaRef: headers.indexOf('HORA_REF'),
      diaSemana: headers.indexOf('DIA_DA_SEMANA'),
      horaInteira: headers.indexOf('HORA_INTEIRA'),
      codLigacao: headers.indexOf('COD_IDENTIFICACAO_LIGACAO'),
      fluxo: headers.indexOf('FLUXO'),
      indicador: headers.indexOf('INDICADOR'),
      duracao: headers.indexOf('DURACAO'),
      produto: headers.indexOf('PRODUTO'),
      tipoServico: headers.indexOf('TIPO_SERVICO'),
      ultimoPonto: headers.indexOf('ULTIMO_PONTO'),
      timestamp: headers.indexOf('TMP_TIMESTAMP'),
      ani: headers.indexOf('ANI'),
      dnis: headers.indexOf('DNIS'),
      documento: headers.indexOf('DOCUMENTO'),
      nomeEvento: headers.indexOf('NOME_EVENTO'),
      codigoPonto: headers.indexOf('CODIGO_PONTO'),
      nomeMenu: headers.indexOf('NOME_MENU')
    };

    // Agrupa por COD_IDENTIFICACAO_LIGACAO
    const callsMap = new Map();

    rows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const codLigacao = row[colIndexes.codLigacao];
      if (!codLigacao) return;

      if (!callsMap.has(codLigacao)) {
        callsMap.set(codLigacao, {
          id: codLigacao,
          dataRef: row[colIndexes.dataRef] || '',
          horaRef: row[colIndexes.horaRef] || '',
          diaSemana: row[colIndexes.diaSemana] || '',
          horaInteira: row[colIndexes.horaInteira] || '',
          indicador: row[colIndexes.indicador] || '',
          duracao: parseInt(row[colIndexes.duracao]) || 0,
          produto: row[colIndexes.produto] || 'Não Identificado',
          tipoServico: row[colIndexes.tipoServico] || '',
          ultimoPonto: row[colIndexes.ultimoPonto] || '',
          ani: row[colIndexes.ani] || '',
          dnis: row[colIndexes.dnis] || '',
          documento: row[colIndexes.documento] || '',
          fluxoCompleto: row[colIndexes.fluxo] || '',
          steps: [],
          detailedSteps: [], // Array para armazenar todas as linhas com detalhes
          rawRow: row,
          rowIndex: index
        });
      }

      const call = callsMap.get(codLigacao);

      // Adiciona informações detalhadas de cada linha
      call.detailedSteps.push({
        nomeMenu: row[colIndexes.nomeMenu] || '',
        nomeEvento: row[colIndexes.nomeEvento] || '',
        codigoPonto: row[colIndexes.codigoPonto] || '',
        timestamp: row[colIndexes.timestamp] || '',
        fluxo: row[colIndexes.fluxo] || '',
        ordem: call.detailedSteps.length + 1
      });

      // Adiciona step se houver fluxo (para o diagrama)
      const fluxo = row[colIndexes.fluxo];
      if (fluxo) {
        const fluxos = fluxo.split('|').map(f => f.trim()).filter(f => f !== '');

        fluxos.forEach(f => {
          if (!call.steps.some(s => s.name === f)) {
            call.steps.push({
              name: f,
              timestamp: row[colIndexes.timestamp] || '',
              ordem: call.steps.length + 1
            });
          }
        });
      }
    });

    return Array.from(callsMap.values());
  };

  // Debouncing para busca
  const debounceTimer = useRef(null);

  const filterCalls = useCallback((term) => {
    if (!term || term.trim() === '') {
      setFilteredCalls(calls);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = calls.filter(call => {
      return (
        call.id?.toLowerCase().includes(searchLower) ||
        call.ani?.toLowerCase().includes(searchLower) ||
        call.dnis?.toLowerCase().includes(searchLower) ||
        call.documento?.toLowerCase().includes(searchLower) ||
        call.produto?.toLowerCase().includes(searchLower) ||
        call.fluxoCompleto?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCalls(filtered);
  }, [calls]);

  const handleSearch = (term) => {
    setSearchTerm(term);

    // Limpa o timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Cria novo timer de 300ms
    debounceTimer.current = setTimeout(() => {
      filterCalls(term);
    }, 300);
  };

  // Cleanup do timer ao desmontar componente
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSelectCall = (call) => {
    setSelectedCall(call);
  };

  const handleClearSelection = () => {
    setSelectedCall(null);
  };

  const handleReset = () => {
    setRawData(null);
    setHeaders([]);
    setCalls([]);
    setFilteredCalls([]);
    setSelectedCall(null);
    setError(null);
    setSearchTerm('');
  };

  const handleApplyFilters = (filters) => {
    let filtered = [...calls];

    if (filters.produto && filters.produto !== 'todos') {
      filtered = filtered.filter(call => call.produto === filters.produto);
    }

    if (filters.indicador && filters.indicador !== 'todos') {
      filtered = filtered.filter(call => call.indicador?.toLowerCase().includes(filters.indicador.toLowerCase()));
    }

    if (filters.diaSemana && filters.diaSemana !== 'todos') {
      filtered = filtered.filter(call => call.diaSemana === filters.diaSemana);
    }

    if (filters.horaInicio && filters.horaFim) {
      filtered = filtered.filter(call => {
        const hora = parseInt(call.horaInteira);
        return hora >= parseInt(filters.horaInicio) && hora <= parseInt(filters.horaFim);
      });
    }

    setFilteredCalls(filtered);
  };

  return (
    <div className="call-analysis-page">
      <div className="call-analysis-header">
        <div className="call-analysis-title-group">
          <Phone size={32} className="call-analysis-icon" />
          <div>
            <h1 className="call-analysis-title">Análise de Ligações</h1>
            <p className="call-analysis-subtitle">
              Busca e análise detalhada de chamadas individuais
            </p>
          </div>
        </div>
      </div>

      <div className="call-analysis-content">
        {!rawData && !loading && (
          <div className="call-upload-container">
            <div className="call-upload-card">
              <FileSpreadsheet size={48} className="call-upload-icon" />
              <h2>Carregar Arquivo de Chamadas</h2>
              <p>Faça upload de um arquivo XLS, XLSX, CSV ou ODS com os dados das ligações</p>

              <label className="call-upload-button">
                <input
                  type="file"
                  accept=".xls,.xlsx,.csv,.ods"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                Selecionar Arquivo
              </label>

              <div className="call-upload-info">
                <p><strong>Colunas esperadas:</strong></p>
                <ul>
                  <li>COD_IDENTIFICACAO_LIGACAO</li>
                  <li>ANI, DNIS, DOCUMENTO (opcionais para busca)</li>
                  <li>FLUXO (etapas da ligação)</li>
                  <li>INDICADOR, PRODUTO, DATA_REF, HORA_REF</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="call-loading">
            <div className="call-loading-spinner"></div>
            <p>Processando arquivo...</p>
          </div>
        )}

        {error && (
          <div className="call-error">
            <div className="call-error-icon">⚠️</div>
            <h3>Erro ao processar arquivo</h3>
            <p>{error}</p>
            <button className="call-error-button" onClick={handleReset}>
              Tentar Novamente
            </button>
          </div>
        )}

        {rawData && !loading && (
          <>
            {/* Barra de busca e filtros */}
            <div className="call-search-section">
              <div className="call-search-bar">
                <Search size={20} className="call-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por ID, ANI, DNIS, Documento, Produto..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="call-search-input"
                />
                {searchTerm && (
                  <button
                    className="call-search-clear"
                    onClick={() => handleSearch('')}
                    title="Limpar busca"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <button
                className="call-filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filtros Avançados
              </button>

              <div className="call-stats">
                <span className="call-stat-item">
                  <strong>{filteredCalls.length}</strong> de {calls.length} ligações
                </span>
                <button className="call-reset-button" onClick={handleReset}>
                  Carregar Novo Arquivo
                </button>
              </div>
            </div>

            {/* Filtros avançados */}
            {showFilters && (
              <CallSearchFilters
                calls={calls}
                onApplyFilters={handleApplyFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* Layout: Tabela + Detalhes */}
            <div className="call-analysis-layout">
              {/* Lista de chamadas */}
              <div className="call-list-panel">
                <CallsTable
                  calls={filteredCalls}
                  selectedCall={selectedCall}
                  onSelectCall={handleSelectCall}
                  onViewFlow={(call) => setFlowModalCall(call)}
                />
              </div>

              {/* Painel lateral removido - detalhes agora são exibidos apenas no modal */}
            </div>

            {/* Modal de Fluxo */}
            {flowModalCall && (
              <CallFlowModal
                call={flowModalCall}
                onClose={() => setFlowModalCall(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CallAnalysisPage;
