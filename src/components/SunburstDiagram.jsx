import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SunburstDiagram.css';

const SunburstDiagram = ({ data, width = 600, height = 600 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.journeys || !svgRef.current) return;

    // Limpa SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Constrói hierarquia: Empresa > Produto > TipoServico > Destino
    const hierarchy = {
      name: 'Root',
      children: []
    };

    // Agrupa por produto
    const produtoMap = new Map();

    data.journeys.forEach(journey => {
      const produto = journey.produto || 'Não Identificado';
      const destino = journey.destino;

      if (!produtoMap.has(produto)) {
        produtoMap.set(produto, new Map());
      }

      const destinoMap = produtoMap.get(produto);
      destinoMap.set(destino, (destinoMap.get(destino) || 0) + 1);
    });

    // Converte para estrutura hierárquica
    produtoMap.forEach((destinoMap, produto) => {
      const produtoNode = {
        name: produto,
        children: []
      };

      destinoMap.forEach((count, destino) => {
        produtoNode.children.push({
          name: destino,
          value: count
        });
      });

      hierarchy.children.push(produtoNode);
    });

    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('max-width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Cria partition layout
    const root = d3.hierarchy(hierarchy)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root);

    // Escala de cores
    const color = d3.scaleOrdinal()
      .domain(root.descendants().map(d => d.data.name))
      .range(d3.quantize(d3.interpolateRainbow, root.children.length + 1));

    // Arc generator
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

    // Desenha arcos
    const paths = g.selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .join('path')
      .attr('fill', d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', d =>
        arcVisible(d.current ? d.current : d) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr('d', d => arc(d.current ? d.current : d))
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);

        // Mostra tooltip
        const tooltip = d3.select('.sunburst-tooltip');
        const percentage = ((d.value / root.value) * 100).toFixed(1);

        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <strong>${d.data.name}</strong><br/>
            Quantidade: ${d.value}<br/>
            Percentual: ${percentage}%<br/>
            Nível: ${d.depth}
          `);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill-opacity', d.children ? 0.6 : 0.4);
        d3.select('.sunburst-tooltip').style('display', 'none');
      })
      .on('click', clicked);

    // Label no centro
    const label = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .style('visibility', 'hidden');

    label.append('tspan')
      .attr('class', 'sunburst-label-name')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '20px')
      .attr('font-weight', '700');

    label.append('tspan')
      .attr('class', 'sunburst-label-value')
      .attr('x', 0)
      .attr('y', 30)
      .attr('font-size', '16px')
      .attr('fill', '#2dd4bf');

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function clicked(event, p) {
      label.style('visibility', p.parent ? null : 'hidden');

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = g.transition().duration(750);

      paths.transition(t)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function(d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target);
        })
        .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attrTween('d', d => () => arc(d.current));

      label.selectAll('tspan.sunburst-label-name')
        .text(p.data.name);

      label.selectAll('tspan.sunburst-label-value')
        .text(`${p.value} (${((p.value / root.value) * 100).toFixed(1)}%)`);
    }

  }, [data, width, height]);

  return (
    <div className="sunburst-diagram-container">
      <svg ref={svgRef}></svg>
      <div className="sunburst-tooltip"></div>
      <div className="sunburst-info">
        <p>💡 Clique nos segmentos para explorar a hierarquia</p>
      </div>
    </div>
  );
};

export default SunburstDiagram;
