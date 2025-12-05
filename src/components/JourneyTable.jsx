import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './JourneyTable.css';

const JourneyTable = ({ passos, selectedNode }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'asc' });

  if (!passos || passos.length === 0) {
    return (
      <div className="journey-table-container">
        <div className="journey-table-empty">
          <p>Nenhum dado disponível. Faça upload de um arquivo para visualizar os detalhes da jornada.</p>
        </div>
      </div>
    );
  }

  // Ordena dados (todos os passos, sem filtro)
  const sortedData = [...passos].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

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

  // Detecta o status do passo
  const getStepStatus = (passo) => {
    const validacao = (passo.nomeEvento || '').toLowerCase();
    const errorKeywords = ['falha', 'erro', 'negado', 'invalido', 'nao_encontrado', '404', 'error', 'failed'];
    const warningKeywords = ['timeout', 'expirado', 'incompleto', 'parcial', 'retentativa'];

    if (errorKeywords.some(keyword => validacao.includes(keyword))) {
      return 'error';
    }
    if (warningKeywords.some(keyword => validacao.includes(keyword))) {
      return 'warning';
    }
    return 'success';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'error':
        return <XCircle size={16} className="status-icon-error" />;
      case 'warning':
        return <AlertTriangle size={16} className="status-icon-warning" />;
      case 'success':
      default:
        return <CheckCircle size={16} className="status-icon-success" />;
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Conta status
  const statusCounts = sortedData.reduce((acc, passo) => {
    const status = getStepStatus(passo);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="journey-table-container">
      <div className="journey-table-header">
        <div className="journey-table-title-row">
          <h3 className="journey-table-title">Detalhes da Jornada - Todos os Registros</h3>
          <div className="journey-table-summary">
            <span className="total-count">{sortedData.length} registros</span>
            {statusCounts.success > 0 && (
              <span className="status-badge status-badge-success">
                <CheckCircle size={12} />
                {statusCounts.success}
              </span>
            )}
            {statusCounts.warning > 0 && (
              <span className="status-badge status-badge-warning">
                <AlertTriangle size={12} />
                {statusCounts.warning}
              </span>
            )}
            {statusCounts.error > 0 && (
              <span className="status-badge status-badge-error">
                <XCircle size={12} />
                {statusCounts.error}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="journey-table-wrapper">
        <table className="journey-table">
          <thead>
            <tr>
              <th className="col-status">Status</th>
              <th className="col-seq">#</th>
              <th className="col-timestamp" onClick={() => handleSort('timestamp')}>
                <div className="th-content">
                  Timestamp
                  <SortIcon columnKey="timestamp" />
                </div>
              </th>
              <th className="col-menu" onClick={() => handleSort('nomeMenu')}>
                <div className="th-content">
                  Menu
                  <SortIcon columnKey="nomeMenu" />
                </div>
              </th>
              <th className="col-event" onClick={() => handleSort('nomeEvento')}>
                <div className="th-content">
                  Evento
                  <SortIcon columnKey="nomeEvento" />
                </div>
              </th>
              <th className="col-code" onClick={() => handleSort('codigoPonto')}>
                <div className="th-content">
                  Código Ponto
                  <SortIcon columnKey="codigoPonto" />
                </div>
              </th>
              <th className="col-id" onClick={() => handleSort('id_ligacao')}>
                <div className="th-content">
                  ID Ligação
                  <SortIcon columnKey="id_ligacao" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              sortedData.map((passo, index) => {
                const status = getStepStatus(passo);
                return (
                  <tr key={`${passo.id_ligacao}-${index}`} className={`row-${status}`}>
                    <td className="cell-status">
                      {getStatusIcon(status)}
                    </td>
                    <td className="cell-seq">{index + 1}</td>
                    <td className="cell-timestamp">{formatTimestamp(passo.timestamp)}</td>
                    <td className="cell-menu">{passo.nomeMenu}</td>
                    <td className="cell-event">
                      <span className={`event-pill event-pill-${status}`}>
                        {passo.nomeEvento || 'Não especificado'}
                      </span>
                    </td>
                    <td className="cell-code">
                      <code>{passo.codigoPonto}</code>
                    </td>
                    <td className="cell-id">{passo.id_ligacao}</td>
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

export default JourneyTable;
