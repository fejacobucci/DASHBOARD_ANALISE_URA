import React, { useState, useMemo } from 'react';
import { X, TrendingUp, Link as LinkIcon, Phone } from 'lucide-react';
import './SankeyDetailModal.css';

const SankeyDetailModal = ({ isOpen, onClose, selectedItem, rawData }) => {
  const [activeTab, setActiveTab] = useState('resumo');

  // Função para encontrar chamadas relacionadas a um nó
  const findCallsForNode = useMemo(() => {
    if (!selectedItem || !rawData || selectedItem.type === 'link') return [];
    if (!Array.isArray(rawData) || rawData.length < 2) return [];

    const nodeName = selectedItem.data.name;
    const calls = [];

    // Primeira linha são os headers
    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    // Encontra índices das colunas importantes
    const colIndexes = {
      dataRef: headers.indexOf('DATA_REF'),
      fluxo: headers.indexOf('FLUXO'),
      eventos: headers.indexOf('EVENTOS'),
      navegacao: headers.indexOf('NAVEGACAO'),
      telefone: headers.indexOf('TELEFONE_ORIGEM'),
      produto: headers.indexOf('PRODUTO'),
      processo: headers.indexOf('PROCESSO'),
      duracao: headers.indexOf('TEMPO_TOTAL_NAVEGACAO_SEGUNDOS')
    };

    // Busca nas chamadas brutas
    dataRows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const fluxo = row[colIndexes.fluxo] || '';
      const eventos = row[colIndexes.eventos] || '';
      const navegacao = row[colIndexes.navegacao] || '';

      // Verifica se o nó aparece no fluxo da chamada
      if (fluxo.includes(nodeName) || eventos.includes(nodeName) || navegacao.includes(nodeName)) {
        // Cria objeto no formato esperado
        const call = {};
        headers.forEach((header, idx) => {
          call[header] = row[idx];
        });
        call.index = index + 1;
        calls.push(call);
      }
    });

    return calls;
  }, [selectedItem, rawData]);

  // Função para encontrar chamadas relacionadas a um link
  const findCallsForLink = useMemo(() => {
    if (!selectedItem || !rawData || selectedItem.type === 'node') return [];
    if (!Array.isArray(rawData) || rawData.length < 2) return [];

    const sourceName = selectedItem.data.source.name;
    const targetName = selectedItem.data.target.name;
    const calls = [];

    // Primeira linha são os headers
    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    // Encontra índice da coluna FLUXO
    const fluxoIndex = headers.indexOf('FLUXO');
    if (fluxoIndex === -1) return [];

    dataRows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const fluxo = row[fluxoIndex] || '';
      const fluxoArray = fluxo.split('|').map(s => s.trim());

      // Procura pela transição source -> target
      for (let i = 0; i < fluxoArray.length - 1; i++) {
        if (fluxoArray[i] === sourceName && fluxoArray[i + 1] === targetName) {
          // Cria objeto no formato esperado
          const call = {};
          headers.forEach((header, idx) => {
            call[header] = row[idx];
          });
          call.index = index + 1;
          call.transitionIndex = i;
          calls.push(call);
          break;
        }
      }
    });

    return calls;
  }, [selectedItem, rawData]);

  // Estatísticas calculadas
  const statistics = useMemo(() => {
    const relatedCalls = selectedItem?.type === 'node' ? findCallsForNode : findCallsForLink;

    if (!relatedCalls || relatedCalls.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: 0,
        timeDistribution: {},
        dayDistribution: {},
        productDistribution: {},
        processDistribution: {}
      };
    }

    // Calcula duração média
    const durationsArray = relatedCalls
      .map(c => parseInt(c.TEMPO_TOTAL_NAVEGACAO_SEGUNDOS) || 0)
      .filter(d => d > 0);
    const avgDuration = durationsArray.length > 0
      ? Math.round(durationsArray.reduce((a, b) => a + b, 0) / durationsArray.length)
      : 0;

    // Distribuição por hora
    const timeDistribution = {};
    relatedCalls.forEach(call => {
      const date = String(call.DATA_REF || '');
      const match = date.match(/(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1]);
        timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
      }
    });

    // Distribuição por dia da semana
    const dayDistribution = {};
    relatedCalls.forEach(call => {
      const date = String(call.DATA_REF || '');
      // Parseia DD/MM/YYYY HH:MM:SS
      const match = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        const dateObj = new Date(year, month - 1, day);
        const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()];
        dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;
      }
    });

    // Distribuição por produto
    const productDistribution = {};
    relatedCalls.forEach(call => {
      const product = call.PRODUTO || 'Não especificado';
      productDistribution[product] = (productDistribution[product] || 0) + 1;
    });

    // Distribuição por processo
    const processDistribution = {};
    relatedCalls.forEach(call => {
      const process = call.PROCESSO || 'Não especificado';
      processDistribution[process] = (processDistribution[process] || 0) + 1;
    });

    return {
      totalCalls: relatedCalls.length,
      avgDuration,
      timeDistribution,
      dayDistribution,
      productDistribution,
      processDistribution
    };
  }, [selectedItem, findCallsForNode, findCallsForLink]);

  if (!isOpen || !selectedItem) return null;

  const isNode = selectedItem.type === 'node';
  const itemData = selectedItem.data;
  const relatedCalls = isNode ? findCallsForNode : findCallsForLink;

  // Formata duração em MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcula percentual
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="sankey-modal-overlay" onClick={onClose}>
      <div className="sankey-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sankey-modal-header">
          <div className="sankey-modal-title-group">
            {isNode ? <TrendingUp size={24} /> : <LinkIcon size={24} />}
            <div>
              <h2 className="sankey-modal-title">
                {isNode ? itemData.name : `${itemData.source.name} → ${itemData.target.name}`}
              </h2>
              <p className="sankey-modal-subtitle">
                {isNode
                  ? `Tipo: ${itemData.type || 'intermediário'} • ${itemData.value.toFixed(0)} jornadas`
                  : `Transição • ${itemData.value} jornadas`
                }
              </p>
            </div>
          </div>
          <button className="sankey-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="sankey-modal-tabs">
          <button
            className={`sankey-modal-tab ${activeTab === 'resumo' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumo')}
          >
            📊 Resumo
          </button>
          <button
            className={`sankey-modal-tab ${activeTab === 'conexoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('conexoes')}
          >
            🔗 Conexões
          </button>
          <button
            className={`sankey-modal-tab ${activeTab === 'detalhes' ? 'active' : ''}`}
            onClick={() => setActiveTab('detalhes')}
          >
            📞 Detalhes
          </button>
        </div>

        {/* Content */}
        <div className="sankey-modal-content">
          {/* Tab: Resumo */}
          {activeTab === 'resumo' && (
            <div className="sankey-modal-section">
              <h3>Estatísticas Gerais</h3>

              <div className="sankey-stats-grid">
                <div className="sankey-stat-card">
                  <div className="sankey-stat-label">Total de Chamadas</div>
                  <div className="sankey-stat-value">{statistics.totalCalls}</div>
                </div>

                <div className="sankey-stat-card">
                  <div className="sankey-stat-label">Duração Média</div>
                  <div className="sankey-stat-value">{formatDuration(statistics.avgDuration)}</div>
                </div>

                {isNode && (
                  <>
                    <div className="sankey-stat-card">
                      <div className="sankey-stat-label">Conexões Entrada</div>
                      <div className="sankey-stat-value">{itemData.sourceLinks?.length || 0}</div>
                    </div>

                    <div className="sankey-stat-card">
                      <div className="sankey-stat-label">Conexões Saída</div>
                      <div className="sankey-stat-value">{itemData.targetLinks?.length || 0}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Distribuição por Hora */}
              <div className="sankey-distribution-section">
                <h4>Distribuição por Hora</h4>
                <div className="sankey-distribution-bars">
                  {Object.entries(statistics.timeDistribution)
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([hour, count]) => (
                      <div key={hour} className="sankey-bar-item">
                        <div className="sankey-bar-label">{hour}h</div>
                        <div className="sankey-bar-container">
                          <div
                            className="sankey-bar-fill"
                            style={{
                              width: `${calculatePercentage(count, statistics.totalCalls)}%`
                            }}
                          ></div>
                        </div>
                        <div className="sankey-bar-value">{count}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Distribuição por Produto */}
              <div className="sankey-distribution-section">
                <h4>Distribuição por Produto</h4>
                <div className="sankey-distribution-list">
                  {Object.entries(statistics.productDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([product, count]) => (
                      <div key={product} className="sankey-list-item">
                        <span className="sankey-list-label">{product}</span>
                        <span className="sankey-list-value">
                          {count} ({calculatePercentage(count, statistics.totalCalls)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Distribuição por Processo */}
              <div className="sankey-distribution-section">
                <h4>Distribuição por Processo</h4>
                <div className="sankey-distribution-list">
                  {Object.entries(statistics.processDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([process, count]) => (
                      <div key={process} className="sankey-list-item">
                        <span className="sankey-list-label">{process}</span>
                        <span className="sankey-list-value">
                          {count} ({calculatePercentage(count, statistics.totalCalls)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Conexões */}
          {activeTab === 'conexoes' && isNode && (
            <div className="sankey-modal-section">
              <h3>Conexões do Nó</h3>

              {/* Conexões de Entrada */}
              <div className="sankey-connections-section">
                <h4>Entradas ({itemData.sourceLinks?.length || 0})</h4>
                {itemData.sourceLinks && itemData.sourceLinks.length > 0 ? (
                  <div className="sankey-connections-list">
                    {itemData.sourceLinks.map((link, idx) => (
                      <div key={idx} className="sankey-connection-item">
                        <div className="sankey-connection-name">{link.source.name}</div>
                        <div className="sankey-connection-arrow">→</div>
                        <div className="sankey-connection-value">{link.value} jornadas</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sankey-empty-message">Nenhuma conexão de entrada</p>
                )}
              </div>

              {/* Conexões de Saída */}
              <div className="sankey-connections-section">
                <h4>Saídas ({itemData.targetLinks?.length || 0})</h4>
                {itemData.targetLinks && itemData.targetLinks.length > 0 ? (
                  <div className="sankey-connections-list">
                    {itemData.targetLinks.map((link, idx) => (
                      <div key={idx} className="sankey-connection-item">
                        <div className="sankey-connection-value">{link.value} jornadas</div>
                        <div className="sankey-connection-arrow">→</div>
                        <div className="sankey-connection-name">{link.target.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sankey-empty-message">Nenhuma conexão de saída</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'conexoes' && !isNode && (
            <div className="sankey-modal-section">
              <h3>Informações da Transição</h3>
              <div className="sankey-link-info">
                <div className="sankey-link-flow">
                  <div className="sankey-link-node">{itemData.source.name}</div>
                  <div className="sankey-link-arrow">→</div>
                  <div className="sankey-link-node">{itemData.target.name}</div>
                </div>
                <div className="sankey-link-stats">
                  <p><strong>Jornadas nesta transição:</strong> {itemData.value}</p>
                  <p><strong>Origem (tipo):</strong> {itemData.source.type || 'intermediário'}</p>
                  <p><strong>Destino (tipo):</strong> {itemData.target.type || 'intermediário'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Detalhes */}
          {activeTab === 'detalhes' && (
            <div className="sankey-modal-section">
              <h3>Chamadas Relacionadas ({relatedCalls.length})</h3>

              {relatedCalls.length > 0 ? (
                <div className="sankey-calls-table-wrapper">
                  <table className="sankey-calls-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Data/Hora</th>
                        <th>Telefone</th>
                        <th>Produto</th>
                        <th>Processo</th>
                        <th>Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedCalls.slice(0, 50).map((call, idx) => (
                        <tr key={idx}>
                          <td>{call.index}</td>
                          <td>{call.DATA_REF}</td>
                          <td>{call.TELEFONE_ORIGEM || 'N/A'}</td>
                          <td>{call.PRODUTO || 'N/A'}</td>
                          <td>{call.PROCESSO || 'N/A'}</td>
                          <td>{formatDuration(parseInt(call.TEMPO_TOTAL_NAVEGACAO_SEGUNDOS) || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {relatedCalls.length > 50 && (
                    <p className="sankey-table-note">
                      Mostrando 50 de {relatedCalls.length} chamadas
                    </p>
                  )}
                </div>
              ) : (
                <p className="sankey-empty-message">Nenhuma chamada encontrada</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SankeyDetailModal;
