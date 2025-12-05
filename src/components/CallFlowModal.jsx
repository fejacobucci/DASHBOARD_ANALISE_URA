import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import NavigationFlow from './NavigationFlow';
import './CallFlowModal.css';

const CallFlowModal = ({ call, onClose }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  if (!call) return null;

  // Prepara os dados no formato esperado pelo NavigationFlow
  const prepareFlowData = () => {
    // Conta quantas vezes cada passo aparece
    const stepCounts = {};
    call.steps.forEach(step => {
      stepCounts[step.name] = (stepCounts[step.name] || 0) + 1;
    });

    // Cria os nós
    const nodes = Object.entries(stepCounts).map(([name, count]) => ({
      name,
      value: count
    }));

    // Cria os links entre passos consecutivos
    const links = [];
    for (let i = 0; i < call.steps.length - 1; i++) {
      const source = call.steps[i].name;
      const target = call.steps[i + 1].name;

      // Evita links para si mesmo
      if (source === target) continue;

      // Verifica se já existe esse link
      const existingLink = links.find(l => l.source === source && l.target === target);
      if (existingLink) {
        existingLink.value++;
      } else {
        links.push({ source, target, value: 1 });
      }
    }

    return { nodes, links };
  };

  const flowData = prepareFlowData();

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Função para obter passos detalhados filtrados pelo nó selecionado
  const getFilteredDetailedSteps = () => {
    if (!selectedNode || !call.detailedSteps) return [];

    // Filtra as linhas detalhadas que correspondem ao nó selecionado
    return call.detailedSteps.filter(step => {
      // Verifica se o NOME_MENU corresponde ao nó selecionado
      if (step.nomeMenu === selectedNode) return true;

      // Ou se o FLUXO contém o nó selecionado
      if (step.fluxo && step.fluxo.includes(selectedNode)) return true;

      return false;
    });
  };

  // Função para agrupar eventos e navegação
  const getGroupedEventNavigation = () => {
    if (!selectedNode || !call.detailedSteps) return [];

    const filtered = getFilteredDetailedSteps();

    // Agrupa por evento e navegação
    const grouped = {};

    filtered.forEach(step => {
      const evento = step.nomeEvento || 'Sem Evento';
      const navegacao = step.fluxo || 'N/A';
      const codigoPonto = step.codigoPonto || 'N/A';

      const key = `${evento}|||${navegacao}|||${codigoPonto}`;

      if (!grouped[key]) {
        grouped[key] = {
          evento,
          navegacao,
          codigoPonto,
          occurrences: [],
          count: 0
        };
      }

      grouped[key].occurrences.push({
        timestamp: step.timestamp,
        ordem: step.ordem
      });
      grouped[key].count++;
    });

    // Converte para array e ordena por quantidade de ocorrências
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  };

  const handleNodeClick = (nodeName) => {
    setSelectedNode(nodeName);
  };

  const toggleCard = (cardKey) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardKey)) {
        newSet.delete(cardKey);
      } else {
        newSet.add(cardKey);
      }
      return newSet;
    });
  };

  const filteredDetailedSteps = getFilteredDetailedSteps();
  const groupedEventNavigation = getGroupedEventNavigation();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="call-flow-modal-overlay" onClick={onClose}>
      <div className="call-flow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="call-flow-modal-header">
          <div className="call-flow-modal-title-group">
            <h2>Fluxo de Navegação Detalhado</h2>
            <div className="call-flow-modal-id">ID: {call.id}</div>
          </div>
          <button className="call-flow-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="call-flow-modal-info">
          <div className="call-flow-info-item">
            <span className="info-label">Data/Hora:</span>
            <span className="info-value">{call.dataRef || 'N/A'}</span>
          </div>
          {call.diaSemana !== '' && (
            <div className="call-flow-info-item">
              <span className="info-label">Dia:</span>
              <span className="info-value">{diasSemana[parseInt(call.diaSemana)]}</span>
            </div>
          )}
          <div className="call-flow-info-item">
            <span className="info-label">Duração:</span>
            <span className="info-value">{formatDuration(call.duracao)}</span>
          </div>
          <div className="call-flow-info-item">
            <span className="info-label">Produto:</span>
            <span className="info-value">{call.produto}</span>
          </div>
          <div className="call-flow-info-item">
            <span className="info-label">Indicador:</span>
            <span className="info-value">
              {call.indicador || 'Desconexão'}
              {call.indicador && call.indicador.toLowerCase().includes('transfer') && call.tipoServico && (
                <span className="info-badge"> → {call.tipoServico}</span>
              )}
            </span>
          </div>
        </div>

        <div className="call-flow-modal-content">
          <div className="call-flow-section-header">
            <h3>Visualização do Fluxo</h3>
            <p>{call.steps.length} etapas na jornada</p>
          </div>

          {flowData.nodes.length > 0 && flowData.links.length > 0 ? (
            <NavigationFlow
              data={flowData}
              onNodeClick={handleNodeClick}
              selectedNode={selectedNode}
              variant="compact"
            />
          ) : (
            <div className="call-flow-empty">
              <p>Não há dados suficientes para gerar o fluxo de navegação</p>
            </div>
          )}

          {selectedNode && groupedEventNavigation.length > 0 ? (
            <div className="call-flow-node-analysis">
              <div className="node-analysis-header">
                <h4>Análise Detalhada: {selectedNode}</h4>
                <span className="node-analysis-count">{filteredDetailedSteps.length} ocorrências</span>
              </div>

              <div className="event-navigation-list">
                <h5>Eventos e Pontos de Navegação</h5>
                {groupedEventNavigation.map((group, index) => {
                  const cardKey = `${group.evento}-${index}`;
                  const isExpanded = expandedCards.has(cardKey);

                  return (
                    <div key={index} className="event-card">
                      <div className="event-card-header" onClick={() => toggleCard(cardKey)}>
                        <div className="event-card-main">
                          <div className="event-card-icon">!</div>
                          <div className="event-card-title">{group.evento}</div>
                          <div className="event-card-count">{group.count}x</div>
                        </div>
                        <button className="event-card-toggle">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>

                      <div className="event-card-divider"></div>

                      <div className="event-card-info">
                        <div className="event-card-row">
                          <span className="event-card-label">Código:</span>
                          <code className="event-card-code">{group.codigoPonto}</code>
                        </div>
                        <div className="event-card-row">
                          <span className="event-card-label">Navegação:</span>
                          <span className="event-card-nav">{group.navegacao}</span>
                        </div>
                        {!isExpanded && group.count > 1 && (
                          <div className="event-card-expand-hint">
                            ✓ Expandir para ver {group.count} ocorrências temporais
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="event-card-timestamps">
                          <div className="timestamps-title">Ocorrências Temporais:</div>
                          {group.occurrences.map((occ, occIndex) => (
                            <div key={occIndex} className="timestamp-item-new">
                              <span className="timestamp-icon">⏱</span>
                              <span className="timestamp-text">{formatTimestamp(occ.timestamp)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedNode ? (
            <div className="call-flow-no-selection">
              <p>Nenhuma ocorrência encontrada para o nó "{selectedNode}"</p>
            </div>
          ) : (
            <div className="call-flow-no-selection">
              <p>Clique em um nó no fluxo acima para ver a análise detalhada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallFlowModal;
