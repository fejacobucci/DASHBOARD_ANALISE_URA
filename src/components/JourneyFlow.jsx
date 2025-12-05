import React, { useRef, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, Clock } from 'lucide-react';
import './JourneyFlow.css';

const JourneyFlow = ({ passos, selectedNode }) => {
  const scrollContainerRef = useRef(null);

  // Auto-scroll para o início quando mudar o nó selecionado
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [selectedNode]);

  if (!selectedNode || !passos || passos.length === 0) {
    return null;
  }

  // Filtra passos pelo nó selecionado (mesmo filtro da tabela)
  const filteredPassos = passos.filter(passo => {
    if (selectedNode === 'Transferencia') {
      return passo.nomeMenu.toLowerCase().includes('transfer');
    }
    if (selectedNode === 'Finalizacao') {
      return passo.nomeMenu.toLowerCase().includes('finaliz');
    }
    if (selectedNode === 'Desconexao') {
      return passo.nomeMenu.toLowerCase().includes('desconex');
    }
    return passo.nomeMenu === selectedNode;
  });

  // Ordena por timestamp
  const sortedPassos = [...filteredPassos].sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Limita a 50 passos para não sobrecarregar a visualização
  const limitedPassos = sortedPassos.slice(0, 50);

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

  // Retorna o ícone baseado no status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'error':
        return <XCircle size={20} className="step-icon-error" />;
      case 'warning':
        return <AlertTriangle size={20} className="step-icon-warning" />;
      case 'success':
      default:
        return <CheckCircle size={20} className="step-icon-success" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="journey-flow-container">
      <div className="journey-flow-header">
        <h3 className="journey-flow-title">Fluxo da Jornada: {selectedNode}</h3>
        <p className="journey-flow-subtitle">
          Sequência cronológica de {limitedPassos.length} passos
          {sortedPassos.length > 50 && ` (mostrando primeiros 50 de ${sortedPassos.length})`}
        </p>
      </div>

      <div className="journey-flow-scroll" ref={scrollContainerRef}>
        <div className="journey-flow-timeline">
          {limitedPassos.map((passo, index) => {
            const status = getStepStatus(passo);
            return (
              <React.Fragment key={`${passo.id_ligacao}-${index}`}>
                <div className={`journey-step journey-step-${status}`}>
                  <div className="step-icon">
                    {getStatusIcon(status)}
                  </div>

                  <div className="step-content">
                    <div className="step-header">
                      <span className="step-number">#{index + 1}</span>
                      <span className="step-time">
                        <Clock size={12} />
                        {formatTime(passo.timestamp)}
                      </span>
                    </div>

                    <div className="step-menu">{passo.nomeMenu}</div>

                    <div className="step-details">
                      <div className="step-detail-row">
                        <span className="step-label">Evento:</span>
                        <span className={`step-event step-event-${status}`}>
                          {passo.nomeEvento || 'Não especificado'}
                        </span>
                      </div>
                      <div className="step-detail-row">
                        <span className="step-label">Código:</span>
                        <code className="step-code">{passo.codigoPonto}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {index < limitedPassos.length - 1 && (
                  <div className="journey-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyFlow;
