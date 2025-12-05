import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import './CustomSankey.css';

const CustomSankey = ({ data, width = 3000, height = 1200, onNodeClick, onLinkClick }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !svgRef.current) return;

    // Valida dados antes de processar
    if (data.nodes.length === 0 || data.links.length === 0) {
      console.warn('Dados vazios para o diagrama Sankey');
      return;
    }

    // Verifica se há links circulares
    const linkSet = new Set();
    const validLinks = data.links.filter(link => {
      // Remove links para si mesmo
      if (link.source === link.target) {
        console.warn('Link circular detectado e removido:', link);
        return false;
      }

      // Remove links duplicados
      const linkKey = `${link.source}→${link.target}`;
      if (linkSet.has(linkKey)) {
        return false;
      }
      linkSet.add(linkKey);
      return true;
    });

    if (validLinks.length === 0) {
      console.error('Nenhum link válido encontrado');
      return;
    }

    // Limpa SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 300, bottom: 40, left: 300 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Cria SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('max-width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepara dados para o Sankey usando links validados
    const sankeyData = {
      nodes: data.nodes.map(d => ({ ...d })),
      links: validLinks.map(d => ({ ...d }))
    };

    // Configuração do Sankey com mais espaço entre nós
    const sankeyGenerator = sankey()
      .nodeId(d => d.name)
      .nodeWidth(35)
      .nodePadding(50)
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Gera layout com tratamento de erros
    let nodes, links;
    try {
      const result = sankeyGenerator(sankeyData);
      nodes = result.nodes;
      links = result.links;
    } catch (error) {
      console.error('Erro ao gerar layout Sankey:', error);
      console.error('Dados problemáticos:', sankeyData);

      // Exibe mensagem de erro no SVG
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-size', '16px')
        .text('Erro ao processar dados: ' + error.message);

      return;
    }

    // Escala de cores customizada para destinos e fluxos
    const getNodeColor = (node) => {
      // Cores específicas para destinos finais
      if (node.type === 'destino') {
        if (node.name === 'Abandono') return '#ef4444'; // Vermelho
        if (node.name === 'Desconexao') return '#3b82f6'; // Azul
        if (node.name === 'Transferencia') return '#10b981'; // Verde
      }

      // Cor destacada para origem
      if (node.type === 'origem') {
        return '#2dd4bf'; // Turquesa/Teal
      }

      // Cores para nós intermediários (paleta mais suave)
      const intermediateColors = [
        '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4',
        '#14b8a6', '#84cc16', '#f97316', '#6366f1'
      ];
      const index = nodes.filter(n => n.type === 'intermediario').indexOf(node);
      return intermediateColors[index % intermediateColors.length];
    };

    // Desenha links com largura mínima para labels
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        // Links que vão para destinos usam a cor do destino
        if (d.target.type === 'destino') {
          return getNodeColor(d.target);
        }
        // Outros links usam cor do source
        return getNodeColor(d.source);
      })
      .attr('stroke-width', d => {
        // Largura mínima de 20px para comportar o texto
        // Caso o valor seja muito pequeno, garante espaço para o label
        const minWidthForLabel = 20;
        return Math.max(minWidthForLabel, d.width);
      })
      .attr('fill', 'none')
      .attr('opacity', 0.3)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        if (onLinkClick) {
          onLinkClick({
            type: 'link',
            data: d
          });
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.7);

        // Mostra tooltip detalhado
        const tooltip = d3.select('.custom-sankey-tooltip');
        const percentage = ((d.value / data.stats.totalValue) * 100).toFixed(1);

        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div class="tooltip-header">
              <strong>${d.source.name}</strong>
              <span class="tooltip-arrow">→</span>
              <strong>${d.target.name}</strong>
            </div>
            <div class="tooltip-body">
              <div class="tooltip-row">
                <span class="tooltip-label">Jornadas:</span>
                <span class="tooltip-value">${d.value}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Percentual:</span>
                <span class="tooltip-value">${percentage}%</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Tipo:</span>
                <span class="tooltip-value">${d.target.type || 'Transição'}</span>
              </div>
            </div>
          `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.3);
        d3.select('.custom-sankey-tooltip').style('display', 'none');
      });

    // Adiciona labels nos links (quantidade de jornadas)
    g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('x', d => {
        // Posiciona no meio do link horizontalmente
        return (d.source.x1 + d.target.x0) / 2;
      })
      .attr('y', d => {
        // Posiciona no meio do link verticalmente
        return (d.y0 + d.y1) / 2;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)')
      .text(d => {
        // Mostra o valor apenas se for significativo (> 0)
        return d.value > 0 ? d.value : '';
      })
      .attr('opacity', 0.9);

    // Desenha nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g');

    node.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => {
        // Destaque especial para destinos finais
        if (d.type === 'destino') return '#ffffff';
        return '#000000';
      })
      .attr('stroke-width', d => d.type === 'destino' ? 2 : 1)
      .attr('opacity', d => d.type === 'destino' ? 0.9 : 0.8)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        if (onNodeClick) {
          onNodeClick({
            type: 'node',
            data: d
          });
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8);

        // Destaca links conectados e caminhos completos
        link.attr('opacity', l => {
          // Links diretamente conectados
          if (l.source === d || l.target === d) return 0.8;

          // Highlight de caminhos: links no caminho upstream e downstream
          let isInPath = false;

          // Verifica upstream (links que levam a este nó)
          if (l.target === d) isInPath = true;

          // Verifica downstream (links que saem deste nó)
          if (l.source === d) isInPath = true;

          return isInPath ? 0.6 : 0.1;
        })
          .attr('stroke-width', l =>
            (l.source === d || l.target === d) ? Math.max(2, l.width * 1.5) : Math.max(1, l.width)
          );

        // Mostra tooltip detalhado
        const tooltip = d3.select('.custom-sankey-tooltip');
        const percentage = ((d.value / data.stats.totalValue) * 100).toFixed(1);

        // Conta conexões
        const incomingLinks = links.filter(l => l.target === d).length;
        const outgoingLinks = links.filter(l => l.source === d).length;

        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div class="tooltip-header">
              <strong>${d.name}</strong>
              ${d.type === 'origem' ? '<span class="tooltip-badge badge-origem">Início</span>' : ''}
              ${d.type === 'destino' ? '<span class="tooltip-badge badge-destino">Fim</span>' : ''}
            </div>
            <div class="tooltip-body">
              <div class="tooltip-row">
                <span class="tooltip-label">Jornadas:</span>
                <span class="tooltip-value">${d.value.toFixed(0)}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Percentual:</span>
                <span class="tooltip-value">${percentage}%</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Entradas:</span>
                <span class="tooltip-value">${incomingLinks}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Saídas:</span>
                <span class="tooltip-value">${outgoingLinks}</span>
              </div>
            </div>
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);

        link.attr('opacity', 0.3)
          .attr('stroke-width', d => Math.max(1, d.width));

        d3.select('.custom-sankey-tooltip').style('display', 'none');
      });

    // Adiciona labels aos nodes
    node.append('text')
      .attr('x', d => d.x0 < innerWidth / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < innerWidth / 2 ? 'start' : 'end')
      .attr('fill', '#e2e8f0')
      .attr('font-size', d => {
        // Destinos são maiores
        if (d.type === 'destino') return '16px';
        // Origem também é maior
        if (d.type === 'origem') return '15px';
        return '13px';
      })
      .attr('font-weight', d => {
        // Destinos e origem em negrito
        if (d.type === 'destino' || d.type === 'origem') return '700';
        return '600';
      })
      .text(d => d.name);

  }, [data, width, height]);

  return (
    <div className="custom-sankey-container">
      <svg ref={svgRef}></svg>
      <div className="custom-sankey-tooltip"></div>
    </div>
  );
};

export default CustomSankey;
