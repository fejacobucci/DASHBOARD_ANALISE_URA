import React, { useState } from 'react';
import { Search, X, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './DrillDownTable.css';

const DrillDownTable = ({ passos, selectedNode, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  if (!selectedNode) {
    return (
      <div className="drill-down-empty">
        <p>Clique no fluxo para visualizar os detalhes</p>
      </div>
    );
  }

  // Aplica busca em TODOS os nós (não filtra por selectedNode quando há busca)
  const filteredData = passos.filter(passo => {
    if (!searchTerm) {
      // Sem busca: filtra apenas pelo nó selecionado
      // EXCEÇÃO: Se selectedNode é "Transferencia", busca por nomes que contenham "transfer"
      if (selectedNode === 'Transferencia') {
        return passo.nomeMenu.toLowerCase().includes('transfer');
      }
      // EXCEÇÃO: Se selectedNode é "Finalizacao", busca por nomes que contenham "finaliz"
      if (selectedNode === 'Finalizacao') {
        return passo.nomeMenu.toLowerCase().includes('finaliz');
      }
      // EXCEÇÃO: Se selectedNode é "Desconexao", busca por nomes que contenham "desconex"
      if (selectedNode === 'Desconexao') {
        return passo.nomeMenu.toLowerCase().includes('desconex');
      }
      return passo.nomeMenu === selectedNode;
    }

    // Com busca: busca em TODOS os nós
    const searchLower = searchTerm.toLowerCase();
    return (
      passo.id_ligacao.toLowerCase().includes(searchLower) ||
      passo.codigoPonto.toLowerCase().includes(searchLower) ||
      passo.nomeMenu.toLowerCase().includes(searchLower) ||
      (passo.nomeEvento && passo.nomeEvento.toLowerCase().includes(searchLower))
    );
  });

  // Aplica ordenação
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Tratamento especial para timestamp
    if (sortConfig.key === 'timestamp') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Detecta o status do passo baseado na validação
  const getStepStatus = (passo) => {
    const validacao = (passo.nomeEvento || '').toLowerCase();

    // Palavras-chave de ERRO (alta gravidade)
    const errorKeywords = ['falha', 'erro', 'negado', 'invalido', 'nao_encontrado', '404', 'error', 'failed'];

    // Palavras-chave de ALERTA (média gravidade)
    const warningKeywords = ['timeout', 'expirado', 'incompleto', 'parcial', 'retentativa'];

    // Verifica erros
    if (errorKeywords.some(keyword => validacao.includes(keyword))) {
      return 'error';
    }

    // Verifica alertas
    if (warningKeywords.some(keyword => validacao.includes(keyword))) {
      return 'warning';
    }

    // Sucesso por padrão
    return 'success';
  };

  // Retorna o ícone baseado no status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'error':
        return <XCircle size={18} className="status-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="status-icon-warning" />;
      case 'success':
      default:
        return <CheckCircle size={18} className="status-icon-success" />;
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Verifica se deve mostrar a coluna de Tipo Serviço Destino
  const isTransferenciaNode = selectedNode === 'Transferencia';

  // Conta registros por status
  const statusCounts = filteredData.reduce((acc, passo) => {
    const status = getStepStatus(passo);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="drill-down-container">
      <div className="drill-down-header">
        <h3 className="drill-down-title">Análise Detalhada: {selectedNode}</h3>

        <div className="drill-down-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por evento, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              aria-label="Limpar busca"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="status-summary">
          <span className="drill-down-count">{filteredData.length} registros</span>
          {statusCounts.success > 0 && (
            <span className="status-count status-count-success">
              <CheckCircle size={14} />
              {statusCounts.success}
            </span>
          )}
          {statusCounts.warning > 0 && (
            <span className="status-count status-count-warning">
              <AlertTriangle size={14} />
              {statusCounts.warning}
            </span>
          )}
          {statusCounts.error > 0 && (
            <span className="status-count status-count-error">
              <XCircle size={14} />
              {statusCounts.error}
            </span>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="drill-down-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Status</th>
              <th onClick={() => handleSort('timestamp')}>
                <div className="th-content">
                  Timestamp
                  <SortIcon columnKey="timestamp" />
                </div>
              </th>
              <th onClick={() => handleSort('nomeEvento')}>
                <div className="th-content">
                  Validação
                  <SortIcon columnKey="nomeEvento" />
                </div>
              </th>
              <th onClick={() => handleSort('codigoPonto')}>
                <div className="th-content">
                  Código Ponto
                  <SortIcon columnKey="codigoPonto" />
                </div>
              </th>
              {isTransferenciaNode && (
                <th onClick={() => handleSort('tipoServico')}>
                  <div className="th-content">
                    Tipo Serviço Destino
                    <SortIcon columnKey="tipoServico" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={isTransferenciaNode ? "5" : "4"} className="no-results">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              sortedData.map((passo, index) => {
                const status = getStepStatus(passo);
                return (
                  <tr
                    key={`${passo.id_ligacao}-${index}`}
                    onClick={() => onNodeSelect && onNodeSelect(passo.nomeMenu)}
                    style={{ cursor: 'pointer' }}
                    className={`table-row-clickable table-row-${status}`}
                  >
                    <td className="status-cell">
                      {getStatusIcon(status)}
                    </td>
                    <td className="timestamp-cell">
                      {formatTimestamp(passo.timestamp)}
                    </td>
                    <td>
                      <span className={`event-badge event-badge-${status}`}>
                        {passo.nomeEvento || 'Não especificado'}
                      </span>
                    </td>
                    <td>
                      <code className="code-badge">{passo.codigoPonto}</code>
                    </td>
                    {isTransferenciaNode && (
                      <td>
                        <span className="service-badge">{passo.tipoServico || 'Não especificado'}</span>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DrillDownTable;
