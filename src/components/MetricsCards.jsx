import React from 'react';
import { Phone, Clock, User, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import './MetricsCards.css';

const MetricsCards = ({ metricas }) => {
  if (!metricas) {
    return null;
  }

  const cards = [
    {
      title: 'ID Mestre',
      value: metricas.idMestre,
      icon: User,
      color: '#06b6d4',
      suffix: '',
      small: true
    },
    {
      title: 'Duração',
      value: metricas.duracaoMedia,
      icon: Clock,
      color: '#2dd4bf',
      suffix: 's'
    },
    {
      title: 'DNIS (Para)',
      value: metricas.dnis,
      icon: PhoneIncoming,
      color: '#14b8a6',
      suffix: '',
      small: true
    },
    {
      title: 'ANI (De)',
      value: metricas.ani,
      icon: PhoneOutgoing,
      color: '#0891b2',
      suffix: '',
      small: true
    }
  ];

  return (
    <div className="metrics-container">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="metric-card" style={{ borderTopColor: card.color }}>
            <div className="metric-icon" style={{ backgroundColor: `${card.color}20` }}>
              <Icon size={24} style={{ color: card.color }} />
            </div>
            <div className="metric-content">
              <h3 className="metric-title">{card.title}</h3>
              <div className="metric-value">
                <span
                  className={card.small ? "metric-number-small" : "metric-number"}
                  style={{ color: card.color }}
                >
                  {card.value}
                </span>
                <span className="metric-suffix">{card.suffix}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
