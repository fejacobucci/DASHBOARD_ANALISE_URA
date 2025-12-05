import React from 'react';
import { Clock, Calendar, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import './SankeyMetrics.css';

const SankeyMetrics = ({ data }) => {
  if (!data || !data.temporal) return null;

  const { temporal, stats, journeys } = data;

  // Formata nomes dos dias da semana
  const diasSemana = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado'
  };

  // Converte dados temporais para arrays ordenados
  const horasData = Object.entries(temporal.porHora)
    .map(([hora, count]) => ({ hora: parseInt(hora), count }))
    .sort((a, b) => a.hora - b.hora);

  const diasData = Object.entries(temporal.porDia)
    .map(([dia, count]) => ({ dia: parseInt(dia), nome: diasSemana[dia] || dia, count }))
    .sort((a, b) => a.dia - b.dia);

  const produtosData = Object.entries(temporal.porProduto)
    .map(([produto, count]) => ({ produto, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calcula percentuais de indicadores
  const totalIndicadores = Object.values(temporal.porIndicador).reduce((a, b) => a + b, 0);
  const indicadoresPercent = Object.entries(temporal.porIndicador).map(([key, value]) => ({
    nome: key,
    value,
    percent: totalIndicadores > 0 ? ((value / totalIndicadores) * 100).toFixed(1) : 0
  }));

  // Encontra pico de chamadas por hora
  const picoHora = horasData.reduce((max, item) => item.count > max.count ? item : max, { hora: 0, count: 0 });

  // Encontra dia com mais chamadas
  const picoDia = diasData.reduce((max, item) => item.count > max.count ? item : max, { dia: 0, nome: '', count: 0 });

  return (
    <div className="sankey-metrics">
      <div className="metrics-section">
        <h3 className="metrics-title">
          <Activity size={20} />
          Visão Geral
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total de Jornadas</div>
              <div className="metric-value">{stats.totalJornadas?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Clock size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Duração Média</div>
              <div className="metric-value">{Math.round(stats.duracaoMedia || 0)}s</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <TrendingUp size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total de Fluxos</div>
              <div className="metric-value">{stats.totalNodes || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <BarChart3 size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total de Transições</div>
              <div className="metric-value">{stats.totalLinks || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3 className="metrics-title">
          <Activity size={20} />
          Resultados da Jornada
        </h3>
        <div className="indicators-grid">
          {indicadoresPercent.map((ind) => (
            <div key={ind.nome} className={`indicator-card indicator-${ind.nome.toLowerCase()}`}>
              <div className="indicator-header">
                <span className="indicator-name">{ind.nome}</span>
                <span className="indicator-percent">{ind.percent}%</span>
              </div>
              <div className="indicator-value">{ind.value.toLocaleString()}</div>
              <div className="indicator-bar">
                <div
                  className="indicator-bar-fill"
                  style={{ width: `${ind.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="metrics-row">
        <div className="metrics-section metrics-half">
          <h3 className="metrics-title">
            <Clock size={20} />
            Distribuição por Hora
          </h3>
          <div className="temporal-chart">
            {horasData.length > 0 ? (
              <>
                <div className="chart-bars">
                  {horasData.map((item) => {
                    const maxCount = Math.max(...horasData.map(h => h.count));
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={item.hora} className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                          title={`${item.count} chamadas`}
                        >
                          <span className="chart-bar-value">{item.count}</span>
                        </div>
                        <div className="chart-bar-label">{item.hora}h</div>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-info">
                  <span className="chart-highlight">
                    Pico: {picoHora.hora}h com {picoHora.count} chamadas
                  </span>
                </div>
              </>
            ) : (
              <div className="no-data">Sem dados temporais disponíveis</div>
            )}
          </div>
        </div>

        <div className="metrics-section metrics-half">
          <h3 className="metrics-title">
            <Calendar size={20} />
            Distribuição por Dia da Semana
          </h3>
          <div className="temporal-chart">
            {diasData.length > 0 ? (
              <>
                <div className="chart-bars">
                  {diasData.map((item) => {
                    const maxCount = Math.max(...diasData.map(d => d.count));
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={item.dia} className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                          title={`${item.count} chamadas`}
                        >
                          <span className="chart-bar-value">{item.count}</span>
                        </div>
                        <div className="chart-bar-label">{item.nome.substring(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-info">
                  <span className="chart-highlight">
                    Maior volume: {picoDia.nome} com {picoDia.count} chamadas
                  </span>
                </div>
              </>
            ) : (
              <div className="no-data">Sem dados de dias disponíveis</div>
            )}
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3 className="metrics-title">
          <TrendingUp size={20} />
          Top 5 Produtos Mais Acessados
        </h3>
        <div className="produtos-list">
          {produtosData.length > 0 ? (
            produtosData.map((item, index) => {
              const maxCount = produtosData[0].count;
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.produto} className="produto-item">
                  <div className="produto-info">
                    <span className="produto-rank">#{index + 1}</span>
                    <span className="produto-nome">{item.produto}</span>
                  </div>
                  <div className="produto-bar-container">
                    <div
                      className="produto-bar"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <div className="produto-count">{item.count}</div>
                </div>
              );
            })
          ) : (
            <div className="no-data">Sem dados de produtos disponíveis</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SankeyMetrics;
