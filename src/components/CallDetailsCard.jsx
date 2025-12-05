import React from 'react';
import {
  Phone, Calendar, Clock, Timer, Package,
  AlertCircle, User, Hash, FileText
} from 'lucide-react';
import './CallDetailsCard.css';

const CallDetailsCard = ({ call }) => {
  if (!call) {
    return null;
  }

  const getIndicadorColor = (indicador) => {
    if (!indicador) return 'gray';
    const lower = indicador.toLowerCase();
    if (lower.includes('abandon')) return 'red';
    if (lower.includes('transfer')) return 'green';
    return 'yellow';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="call-details-card">
      {/* Cabeçalho com ID */}
      <div className="call-detail-id">
        <Hash size={18} />
        <span>{call.id}</span>
      </div>

      {/* Grid de informações principais */}
      <div className="call-details-grid">
        {/* Data e Hora */}
        <div className="call-detail-item">
          <div className="call-detail-icon">
            <Calendar size={18} />
          </div>
          <div className="call-detail-content">
            <div className="call-detail-label">Data</div>
            <div className="call-detail-value">{call.dataRef || 'N/A'}</div>
          </div>
        </div>

        <div className="call-detail-item">
          <div className="call-detail-icon">
            <Clock size={18} />
          </div>
          <div className="call-detail-content">
            <div className="call-detail-label">Hora</div>
            <div className="call-detail-value">{call.horaRef || 'N/A'}</div>
          </div>
        </div>

        {/* Dia da Semana */}
        {call.diaSemana !== '' && (
          <div className="call-detail-item">
            <div className="call-detail-icon">
              <Calendar size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">Dia</div>
              <div className="call-detail-value">
                {diasSemana[parseInt(call.diaSemana)] || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Duração */}
        <div className="call-detail-item">
          <div className="call-detail-icon">
            <Timer size={18} />
          </div>
          <div className="call-detail-content">
            <div className="call-detail-label">Duração</div>
            <div className="call-detail-value">{formatDuration(call.duracao)}</div>
          </div>
        </div>

        {/* Produto */}
        <div className="call-detail-item">
          <div className="call-detail-icon">
            <Package size={18} />
          </div>
          <div className="call-detail-content">
            <div className="call-detail-label">Produto</div>
            <div className="call-detail-value">{call.produto}</div>
          </div>
        </div>

        {/* Indicador */}
        <div className="call-detail-item">
          <div className="call-detail-icon">
            <AlertCircle size={18} />
          </div>
          <div className="call-detail-content">
            <div className="call-detail-label">Indicador</div>
            <div className={`call-detail-badge badge-${getIndicadorColor(call.indicador)}`}>
              {call.indicador || 'Desconexão'}
            </div>
          </div>
        </div>

        {/* ANI */}
        {call.ani && (
          <div className="call-detail-item">
            <div className="call-detail-icon">
              <Phone size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">ANI</div>
              <div className="call-detail-value">{call.ani}</div>
            </div>
          </div>
        )}

        {/* DNIS */}
        {call.dnis && (
          <div className="call-detail-item">
            <div className="call-detail-icon">
              <Phone size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">DNIS</div>
              <div className="call-detail-value">{call.dnis}</div>
            </div>
          </div>
        )}

        {/* Documento */}
        {call.documento && (
          <div className="call-detail-item">
            <div className="call-detail-icon">
              <FileText size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">Documento</div>
              <div className="call-detail-value">{call.documento}</div>
            </div>
          </div>
        )}

        {/* Tipo Serviço */}
        {call.tipoServico && (
          <div className="call-detail-item">
            <div className="call-detail-icon">
              <User size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">Tipo Serviço</div>
              <div className="call-detail-value">{call.tipoServico}</div>
            </div>
          </div>
        )}

        {/* Último Ponto */}
        {call.ultimoPonto && (
          <div className="call-detail-item call-detail-full">
            <div className="call-detail-icon">
              <AlertCircle size={18} />
            </div>
            <div className="call-detail-content">
              <div className="call-detail-label">Último Ponto</div>
              <div className="call-detail-value">{call.ultimoPonto}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallDetailsCard;
