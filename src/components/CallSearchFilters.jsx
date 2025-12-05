import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import './CallSearchFilters.css';

const CallSearchFilters = ({ calls, onApplyFilters, onClose }) => {
  const [filters, setFilters] = useState({
    produto: 'todos',
    indicador: 'todos',
    diaSemana: 'todos',
    horaInicio: '',
    horaFim: ''
  });

  // Extrai valores únicos para os filtros
  const [produtos, setProdutos] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  useEffect(() => {
    // Produtos únicos
    const uniqueProdutos = [...new Set(calls.map(c => c.produto))].filter(Boolean).sort();
    setProdutos(uniqueProdutos);

    // Indicadores únicos
    const uniqueIndicadores = [...new Set(calls.map(c => {
      if (!c.indicador) return null;
      const lower = c.indicador.toLowerCase();
      if (lower.includes('abandon')) return 'Abandono';
      if (lower.includes('transfer')) return 'Transferência';
      return 'Desconexão';
    }))].filter(Boolean);
    setIndicadores(uniqueIndicadores);
  }, [calls]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      produto: 'todos',
      indicador: 'todos',
      diaSemana: 'todos',
      horaInicio: '',
      horaFim: ''
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const diasSemana = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda' },
    { value: '2', label: 'Terça' },
    { value: '3', label: 'Quarta' },
    { value: '4', label: 'Quinta' },
    { value: '5', label: 'Sexta' },
    { value: '6', label: 'Sábado' }
  ];

  return (
    <div className="call-filters-overlay" onClick={onClose}>
      <div className="call-filters-panel" onClick={(e) => e.stopPropagation()}>
        <div className="call-filters-header">
          <h3>Filtros Avançados</h3>
          <button className="call-filters-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="call-filters-content">
          {/* Produto */}
          <div className="call-filter-group">
            <label className="call-filter-label">Produto</label>
            <select
              className="call-filter-select"
              value={filters.produto}
              onChange={(e) => handleFilterChange('produto', e.target.value)}
            >
              <option value="todos">Todos os produtos</option>
              {produtos.map(produto => (
                <option key={produto} value={produto}>{produto}</option>
              ))}
            </select>
          </div>

          {/* Indicador */}
          <div className="call-filter-group">
            <label className="call-filter-label">Indicador</label>
            <select
              className="call-filter-select"
              value={filters.indicador}
              onChange={(e) => handleFilterChange('indicador', e.target.value)}
            >
              <option value="todos">Todos os indicadores</option>
              {indicadores.map(indicador => (
                <option key={indicador} value={indicador.toLowerCase()}>{indicador}</option>
              ))}
            </select>
          </div>

          {/* Dia da Semana */}
          <div className="call-filter-group">
            <label className="call-filter-label">Dia da Semana</label>
            <select
              className="call-filter-select"
              value={filters.diaSemana}
              onChange={(e) => handleFilterChange('diaSemana', e.target.value)}
            >
              <option value="todos">Todos os dias</option>
              {diasSemana.map(dia => (
                <option key={dia.value} value={dia.value}>{dia.label}</option>
              ))}
            </select>
          </div>

          {/* Faixa de Horário */}
          <div className="call-filter-group">
            <label className="call-filter-label">Faixa de Horário</label>
            <div className="call-filter-range">
              <input
                type="number"
                min="0"
                max="23"
                placeholder="Início (0-23)"
                className="call-filter-input"
                value={filters.horaInicio}
                onChange={(e) => handleFilterChange('horaInicio', e.target.value)}
              />
              <span className="call-filter-separator">até</span>
              <input
                type="number"
                min="0"
                max="23"
                placeholder="Fim (0-23)"
                className="call-filter-input"
                value={filters.horaFim}
                onChange={(e) => handleFilterChange('horaFim', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="call-filters-footer">
          <button className="call-filter-reset" onClick={handleReset}>
            Limpar Filtros
          </button>
          <button className="call-filter-apply" onClick={handleApply}>
            <Check size={18} />
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallSearchFilters;
