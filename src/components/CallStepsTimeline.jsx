import React from 'react';
import { ChevronRight, Circle } from 'lucide-react';
import './CallStepsTimeline.css';

const CallStepsTimeline = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="call-steps-empty">
        <p>Nenhuma etapa registrada para esta ligação</p>
      </div>
    );
  }

  return (
    <div className="call-steps-timeline">
      <div className="call-steps-header">
        <h4>Jornada do Cliente</h4>
        <span className="call-steps-count">{steps.length} etapas</span>
      </div>

      <div className="call-steps-list">
        {steps.map((step, index) => (
          <div key={index} className="call-step-item">
            <div className="call-step-marker">
              <div className="call-step-number">{step.ordem}</div>
              {index < steps.length - 1 && <div className="call-step-line"></div>}
            </div>

            <div className="call-step-content">
              <div className="call-step-name">{step.name}</div>
              {step.timestamp && (
                <div className="call-step-time">{step.timestamp}</div>
              )}
            </div>

            {index < steps.length - 1 && (
              <ChevronRight size={16} className="call-step-arrow" />
            )}
          </div>
        ))}
      </div>

      <div className="call-steps-footer">
        <div className="call-steps-summary">
          <Circle size={12} className="summary-icon" />
          <span>Origem: <strong>{steps[0]?.name}</strong></span>
        </div>
        <div className="call-steps-summary">
          <Circle size={12} className="summary-icon" />
          <span>Destino: <strong>{steps[steps.length - 1]?.name}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default CallStepsTimeline;
