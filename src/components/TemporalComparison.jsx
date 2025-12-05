import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TemporalComparison.css';

const TemporalComparison = ({ data }) => {
  const [comparisonType, setComparisonType] = useState('hora'); // hora, dia, produto

  if (!data || !data.journeys || data.journeys.length === 0) return null;

  // Pré-calcula todas as agregações com useMemo - otimização crítica!
  const aggregatedData = useMemo(() => {
    const journeys = data.journeys;

    // Agrupa por hora
    const porHora = {};
    const porDia = {};
    const porProduto = {};

    // Uma única iteração para todas as agregações
    journeys.forEach(j => {
      // Por hora
      const hora = parseInt(j.hora);
      if (!isNaN(hora)) {
        porHora[hora] = (porHora[hora] || 0) + 1;
      }

      // Por dia
      const dia = parseInt(j.dia);
      if (!isNaN(dia)) {
        porDia[dia] = (porDia[dia] || 0) + 1;
      }

      // Por produto
      const produto = j.produto || 'Não Identificado';
      porProduto[produto] = (porProduto[produto] || 0) + 1;
    });

    return { porHora, porDia, porProduto };
  }, [data]);

  // Função para preparar dados de exibição
  const getComparisonData = useMemo(() => {
    const { porHora, porDia, porProduto } = aggregatedData;

    if (comparisonType === 'hora') {
      const valores = Object.values(porHora);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      const sorted = Object.entries(porHora)
        .map(([hora, count]) => ({
          label: `${hora}:00h`,
          value: count,
          change: ((count - media) / media * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

      return {
        title: 'Comparação por Hora do Dia',
        items: sorted,
        media
      };
    }

    if (comparisonType === 'dia') {
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const valores = Object.values(porDia);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      const sorted = Object.entries(porDia)
        .map(([dia, count]) => ({
          label: diasSemana[parseInt(dia)],
          value: count,
          change: ((count - media) / media * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

      return {
        title: 'Comparação por Dia da Semana',
        items: sorted,
        media
      };
    }

    if (comparisonType === 'produto') {
      const valores = Object.values(porProduto);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      const sorted = Object.entries(porProduto)
        .map(([produto, count]) => ({
          label: produto,
          value: count,
          change: ((count - media) / media * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

      return {
        title: 'Comparação por Produto',
        items: sorted,
        media
      };
    }

    return null;
  }, [aggregatedData, comparisonType]);

  const comparisonData = getComparisonData;

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp size={16} />;
    if (change < 0) return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  const getTrendClass = (change) => {
    if (change > 10) return 'trend-high';
    if (change < -10) return 'trend-low';
    return 'trend-neutral';
  };

  return (
    <div className="temporal-comparison">
      <div className="comparison-header">
        <div className="comparison-title">
          <Clock size={20} />
          <h3>{comparisonData.title}</h3>
        </div>

        <div className="comparison-filters">
          <button
            className={`filter-btn ${comparisonType === 'hora' ? 'active' : ''}`}
            onClick={() => setComparisonType('hora')}
          >
            Por Hora
          </button>
          <button
            className={`filter-btn ${comparisonType === 'dia' ? 'active' : ''}`}
            onClick={() => setComparisonType('dia')}
          >
            Por Dia
          </button>
          <button
            className={`filter-btn ${comparisonType === 'produto' ? 'active' : ''}`}
            onClick={() => setComparisonType('produto')}
          >
            Por Produto
          </button>
        </div>
      </div>

      <div className="comparison-stats">
        <div className="stat-card">
          <span className="stat-label">Média</span>
          <span className="stat-value">{comparisonData.media.toFixed(0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Maior</span>
          <span className="stat-value">{comparisonData.items[0]?.value || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Menor</span>
          <span className="stat-value">
            {comparisonData.items[comparisonData.items.length - 1]?.value || 0}
          </span>
        </div>
      </div>

      <div className="comparison-list">
        {comparisonData.items.slice(0, 10).map((item, index) => {
          const maxValue = comparisonData.items[0].value;
          const barWidth = (item.value / maxValue) * 100;

          return (
            <div key={index} className="comparison-item">
              <div className="item-header">
                <span className="item-rank">#{index + 1}</span>
                <span className="item-label">{item.label}</span>
                <div className={`item-trend ${getTrendClass(item.change)}`}>
                  {getTrendIcon(item.change)}
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>

              <div className="item-bar-container">
                <div
                  className="item-bar"
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>

              <div className="item-value">{item.value} jornadas</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemporalComparison;
