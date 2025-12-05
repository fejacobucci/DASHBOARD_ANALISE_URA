import React, { useState, useMemo } from 'react';
import { Timer, Calendar, Package, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';
import './CallsTable.css';

const ITEMS_PER_PAGE = 500;

const CallsTable = ({ calls, selectedCall, onSelectCall, onViewFlow }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIndicadorColor = (indicador) => {
    if (!indicador) return 'gray';
    const lower = indicador.toLowerCase();
    if (lower.includes('abandon')) return 'red';
    if (lower.includes('transfer')) return 'green';
    return 'yellow';
  };

  // Paginação
  const totalPages = Math.ceil(calls.length / ITEMS_PER_PAGE);
  const paginatedCalls = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return calls.slice(startIndex, endIndex);
  }, [calls, currentPage]);

  // Reset para página 1 quando calls mudar
  useMemo(() => {
    setCurrentPage(1);
  }, [calls]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (calls.length === 0) {
    return (
      <div className="calls-table-empty">
        <p>Nenhuma ligação encontrada</p>
        <span>Tente ajustar os filtros de busca</span>
      </div>
    );
  }

  // Renderiza as chamadas paginadas
  const renderCalls = () => {
    return paginatedCalls.map((call, index) => {
      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

      return (
        <div
          key={call.id}
          className={`call-row ${selectedCall?.id === call.id ? 'call-row-selected' : ''}`}
          onClick={() => onSelectCall(call)}
        >
          <div className="call-row-header">
            <div className="call-row-id">
              <span className="call-row-number">#{globalIndex + 1}</span>
              <span className="call-row-code">{call.id}</span>
            </div>
            <div className={`call-row-badge badge-${getIndicadorColor(call.indicador)}`}>
              {call.indicador || 'Desconexão'}
            </div>
          </div>

          <div className="call-row-info">
            <div className="call-row-info-item">
              <Calendar size={14} />
              <span>{call.dataRef} {call.horaRef}</span>
            </div>
            <div className="call-row-info-item">
              <Timer size={14} />
              <span>{formatDuration(call.duracao)}</span>
            </div>
            <div className="call-row-info-item">
              <Package size={14} />
              <span>{call.produto}</span>
            </div>
          </div>

          {call.steps.length > 0 && (
            <div className="call-row-steps">
              <div className="call-row-steps-header">
                <span className="call-row-steps-count">{call.steps.length} etapas</span>
                <button
                  className="call-row-view-flow"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFlow(call);
                  }}
                  title="Ver fluxo detalhado"
                >
                  <GitBranch size={14} />
                  Ver Fluxo
                </button>
              </div>
              <div className="call-row-flow">
                {call.steps.slice(0, 3).map((step, idx) => (
                  <span key={idx} className="call-row-step">{step.name}</span>
                ))}
                {call.steps.length > 3 && (
                  <span className="call-row-step-more">+{call.steps.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {(call.ani || call.dnis || call.documento) && (
            <div className="call-row-contact">
              {call.ani && <span>ANI: {call.ani}</span>}
              {call.dnis && <span>DNIS: {call.dnis}</span>}
              {call.documento && <span>Doc: {call.documento}</span>}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="calls-table-container">
      <div className="calls-table-header">
        <h3>Ligações Encontradas</h3>
        <div className="calls-table-header-info">
          <span className="calls-table-count">{calls.length} registros</span>
          {totalPages > 1 && (
            <div className="calls-table-pagination">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="calls-table">
        {renderCalls()}
      </div>

      {totalPages > 1 && (
        <div className="calls-table-footer">
          <div className="calls-table-pagination">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="pagination-info">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, calls.length)} de {calls.length}
            </span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsTable;
