import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import './NavigationFlow.css';

const NavigationFlow = ({ data, onNodeClick, selectedNode, variant = 'large' }) => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="navigation-flow-container">
        <div className="navigation-flow-empty">
          <p>Nenhum dado disponível para visualização</p>
        </div>
      </div>
    );
  }

  // Adiciona contador sequencial aos nodes
  const nodesWithCount = data.nodes.map((node, index) => {
    return {
      ...node,
      count: index + 1 // Contador auto-incrementado começando em 1
    };
  });

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Atualiza o índice atual quando o nó selecionado muda
  useEffect(() => {
    if (selectedNode) {
      const index = nodesWithCount.findIndex(node => node.name === selectedNode);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedNode, nodesWithCount]);

  // Função para fazer scroll até o nó específico
  const scrollToNode = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const nodes = container.querySelectorAll('.navigation-node');

      if (nodes[index]) {
        const node = nodes[index];
        const containerRect = container.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();

        // Calcula a posição de scroll para centralizar o nó
        const scrollLeft = node.offsetLeft - (container.offsetWidth / 2) + (node.offsetWidth / 2);

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToNode(newIndex);
      if (onNodeClick) {
        onNodeClick(nodesWithCount[newIndex].name);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < nodesWithCount.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToNode(newIndex);
      if (onNodeClick) {
        onNodeClick(nodesWithCount[newIndex].name);
      }
    }
  };

  return (
    <div className={`navigation-flow-container navigation-flow-${variant}`}>
      <div className="navigation-flow-header">
        <div className="navigation-flow-title-row">
          <div>
            <h2 className="navigation-flow-title">Fluxo de Navegação</h2>
            <p className="navigation-flow-subtitle">
              Visualização dos principais nós da jornada
            </p>
          </div>
          <div className="navigation-controls">
            <button
              className="nav-button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              title="Nó anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="nav-position">
              {currentIndex + 1} / {nodesWithCount.length}
            </span>
            <button
              className="nav-button"
              onClick={handleNext}
              disabled={currentIndex === nodesWithCount.length - 1}
              title="Próximo nó"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="navigation-flow-scroll" ref={scrollContainerRef}>
        <div className="navigation-flow-timeline">
          {nodesWithCount.map((node, index) => (
            <React.Fragment key={node.name}>
              <div
                className={`navigation-node ${selectedNode === node.name ? 'node-selected' : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  onNodeClick && onNodeClick(node.name);
                }}
              >
                <div className="node-header">
                  <span className="node-count">{node.count}</span>
                  <span className="node-time">
                    <Clock size={variant === 'compact' ? 12 : 26} />
                    {formatTimestamp()}
                  </span>
                </div>
                <div className="node-title">{node.name}</div>
              </div>

              {index < nodesWithCount.length - 1 && (
                <div className="navigation-arrow">
                  <ArrowRight size={variant === 'compact' ? 20 : 48} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationFlow;
