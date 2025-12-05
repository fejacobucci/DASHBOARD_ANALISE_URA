import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyCenter } from 'd3-sankey';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { removeCyclicLinks } from '../utils/detectCycles.js';
import './SankeyChart.css';

const SankeyChart = ({ data, onNodeClick }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const nodesPositionsRef = useRef([]);

  useEffect(() => {
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      return;
    }

    // Limpa o SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensões para layout HORIZONTAL (left-to-right)
    const containerWidth = containerRef.current?.clientWidth || 800;

    // Largura dinâmica: GAP GRANDE entre cada nó
    const nodeGap = 250; // GAP horizontal entre níveis de nós
    const minWidth = 1200;
    const calculatedWidth = data.nodes.length * nodeGap;
    const width = Math.max(minWidth, calculatedWidth);

    // Altura REDUZIDA e fixa
    const height = 300; // Altura menor do container
    const maxNodeHeight = 50; // Altura máxima de cada nó
    const nodePadding = 30; // Espaçamento vertical entre nós no mesmo nível

    const margin = { top: 40, right: 150, bottom: 40, left: 150 };

    console.log(`📐 [HORIZONTAL] Dimensões calculadas: ${width}x${height} para ${data.nodes.length} nós`);

    // Cria SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Prepara dados para o Sankey
    const sankeyData = {
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    };

    console.log('Dados ORIGINAIS para Sankey:', sankeyData);

    // Remove ciclos usando algoritmo avançado
    sankeyData.links = removeCyclicLinks(sankeyData.links);

    console.log('Dados LIMPOS para Sankey:', sankeyData);

    // Configuração do Sankey HORIZONTAL (left-to-right)
    const nodeWidth = 180; // Largura fixa dos nós

    const sankeyGenerator = sankey()
      .nodeId(d => d.name)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding) // Espaçamento vertical entre nós
      .nodeAlign(sankeyCenter) // Centraliza nós verticalmente
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    // Gera o layout com tratamento de erro
    let nodes, links;
    try {
      const result = sankeyGenerator(sankeyData);
      nodes = result.nodes;
      links = result.links;
      console.log('Layout Sankey gerado:', { nodes, links });
    } catch (error) {
      console.error('Erro ao gerar layout Sankey:', error);
      console.error('Dados que causaram erro:', sankeyData);
      throw new Error(`Erro no Sankey: ${error.message}`);
    }

    // Paleta de cores Ciano/Azul
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.name))
      .range([
        '#06b6d4', '#0891b2', '#0e7490', '#155e75',
        '#22d3ee', '#2dd4bf', '#14b8a6', '#0d9488',
        '#5eead4', '#2dd4bf', '#14b8a6', '#0891b2'
      ]);

    // Desenha links (fluxos) horizontais com espessura limitada
    svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        const color = colorScale(d.source.name);
        return color;
      })
      .attr('stroke-width', d => {
        // LARGURA MÍNIMA VISÍVEL: 4px para garantir visibilidade
        const minStrokeWidth = 4;
        const maxStrokeWidth = maxNodeHeight / 5;
        return Math.min(Math.max(minStrokeWidth, d.width), maxStrokeWidth);
      })
      .attr('opacity', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', Math.min(Math.max(6, d.width + 2), maxNodeHeight / 4));
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.5)
          .attr('stroke-width', Math.min(Math.max(4, d.width), maxNodeHeight / 4));
      })
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\nFluxos: ${d.value}`);

    // Desenha nós
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Atualiza o nó selecionado
        setSelectedNodeName(d.name);

        // Atualiza o índice do nó selecionado para navegação com setas
        const clickedNodeIndex = nodesPositionsRef.current.findIndex(node => node.name === d.name);
        if (clickedNodeIndex !== -1) {
          setCurrentNodeIndex(clickedNodeIndex);
        }

        // Destaca o nó clicado
        svg.selectAll('.node-rect')
          .attr('stroke', node => node.name === d.name ? '#fbbf24' : 'none')
          .attr('stroke-width', node => node.name === d.name ? 3 : 0)
          .attr('opacity', node => node.name === d.name ? 1 : 0.7);

        // Callback para drill-down
        if (onNodeClick) {
          onNodeClick(d.name);
        }
      });

    // Retângulos dos nós (layout horizontal: largura fixa, altura limitada)
    nodeGroup.append('rect')
      .attr('class', 'node-rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', nodeWidth)
      .attr('height', d => Math.min(d.y1 - d.y0, maxNodeHeight))
      .attr('fill', d => colorScale(d.name))
      .attr('stroke', d => d.name === selectedNodeName ? '#fbbf24' : 'none')
      .attr('stroke-width', d => d.name === selectedNodeName ? 3 : 0)
      .attr('opacity', d => selectedNodeName ? (d.name === selectedNodeName ? 1 : 0.7) : 1)
      .attr('rx', 6)
      .on('mouseover', function(event, d) {
        const isSelected = d.name === selectedNodeName;
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', isSelected ? 3 : 2);
      })
      .on('mouseout', function(event, d) {
        const isSelected = d.name === selectedNodeName;
        d3.select(this)
          .attr('opacity', isSelected ? 1 : (selectedNodeName ? 0.7 : 1))
          .attr('stroke', isSelected ? '#fbbf24' : 'none')
          .attr('stroke-width', isSelected ? 3 : 0);
      })
      .append('title')
      .text(d => `${d.name}\nTotal: ${d.value}`);

    // Função para truncar texto
    function truncateText(text, maxLength = 18) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    }

    // Labels dos nós DENTRO do retângulo (layout horizontal)
    nodeGroup.append('text')
      .attr('x', d => d.x0 + nodeWidth / 2)
      .attr('y', d => {
        const nodeHeight = Math.min(d.y1 - d.y0, maxNodeHeight);
        return d.y0 + nodeHeight / 2;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .attr('font-weight', '600')
      .text(d => truncateText(d.name, 20))
      .style('pointer-events', 'none')
      .append('title')
      .text(d => d.name); // Tooltip com nome completo

    // Salva posições dos nós ordenados por posição X (da esquerda para direita)
    nodesPositionsRef.current = nodes
      .map((d, index) => ({
        name: d.name,
        x: d.x0,
        index
      }))
      .sort((a, b) => a.x - b.x);

  }, [data, onNodeClick, selectedNodeName]);

  // Funções para navegação card a card (nó a nó)
  const handleScrollRight = () => {
    if (nodesPositionsRef.current.length === 0) return;

    const nextIndex = Math.min(currentNodeIndex + 1, nodesPositionsRef.current.length - 1);
    if (nextIndex !== currentNodeIndex) {
      setCurrentNodeIndex(nextIndex);
      const nextNode = nodesPositionsRef.current[nextIndex];

      // Atualiza o nó selecionado
      setSelectedNodeName(nextNode.name);

      // Scroll para o nó
      if (scrollRef.current) {
        const nodeWidth = 180;
        const scrollPosition = nextNode.x - 100; // Centraliza melhor o nó
        scrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }

      // Seleciona o nó automaticamente
      if (onNodeClick) {
        onNodeClick(nextNode.name);
      }
    }
  };

  const handleScrollLeft = () => {
    if (nodesPositionsRef.current.length === 0) return;

    const prevIndex = Math.max(currentNodeIndex - 1, 0);
    if (prevIndex !== currentNodeIndex) {
      setCurrentNodeIndex(prevIndex);
      const prevNode = nodesPositionsRef.current[prevIndex];

      // Atualiza o nó selecionado
      setSelectedNodeName(prevNode.name);

      // Scroll para o nó
      if (scrollRef.current) {
        const scrollPosition = prevNode.x - 100; // Centraliza melhor o nó
        scrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }

      // Seleciona o nó automaticamente
      if (onNodeClick) {
        onNodeClick(prevNode.name);
      }
    }
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="sankey-empty">
        <p>Carregue um arquivo para visualizar o fluxo de navegação</p>
      </div>
    );
  }

  return (
    <div className="sankey-container" ref={containerRef}>
      <div className="sankey-header">
        <h2>Diagrama de Sankey - Fluxo de Navegação URA</h2>
        <p className="sankey-subtitle">Clique em um nó para ver detalhes</p>
      </div>
      <div className="sankey-scroll-wrapper">
        <div className="sankey-scroll" ref={scrollRef}>
          <svg ref={svgRef}></svg>
        </div>
        <button
          className="sankey-scroll-button sankey-scroll-button-left"
          onClick={handleScrollLeft}
          aria-label="Scroll para a esquerda"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="sankey-scroll-button sankey-scroll-button-right"
          onClick={handleScrollRight}
          aria-label="Scroll para a direita"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default SankeyChart;
