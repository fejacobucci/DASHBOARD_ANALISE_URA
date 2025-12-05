import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import './HeatmapTemporal.css';

const HeatmapTemporal = ({ data, width = 900, height = 400 }) => {
  const svgRef = useRef(null);

  // Pré-processa dados com useMemo - otimização crítica!
  const heatmapData = useMemo(() => {
    if (!data || !data.journeys) return null;

    const { journeys } = data;
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const horas = Array.from({ length: 24 }, (_, i) => i);

    // Cria mapa de contagem (O(n) em vez de O(168n))
    const countMap = new Map();
    journeys.forEach(j => {
      const hora = parseInt(j.hora);
      const dia = parseInt(j.dia);
      const key = `${hora}-${dia}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Cria matriz de dados
    const matrix = [];
    horas.forEach(hora => {
      diasSemana.forEach((diaLabel, diaIdx) => {
        const key = `${hora}-${diaIdx}`;
        const count = countMap.get(key) || 0;
        matrix.push({ hora, dia: diaIdx, diaLabel, count });
      });
    });

    return {
      data: matrix,
      maxCount: Math.max(...Array.from(countMap.values()), 1)
    };
  }, [data]);

  useEffect(() => {
    if (!heatmapData || !svgRef.current) return;

    const { data: matrix, maxCount } = heatmapData;
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const horas = Array.from({ length: 24 }, (_, i) => i);

    // Limpa SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('max-width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const xScale = d3.scaleBand()
      .domain(diasSemana)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(horas)
      .range([0, innerHeight])
      .padding(0.05);

    // Escala de cores
    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateYlOrRd);

    // Desenha células do heatmap
    const cells = g.selectAll('rect')
      .data(matrix)
      .join('rect')
      .attr('x', d => xScale(d.diaLabel))
      .attr('y', d => yScale(d.hora))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.count === 0 ? '#1e293b' : colorScale(d.count))
      .attr('stroke', '#0a0e1a')
      .attr('stroke-width', 1)
      .attr('rx', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#2dd4bf')
          .attr('stroke-width', 2);

        // Mostra tooltip
        const tooltip = d3.select('.heatmap-tooltip');
        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <strong>${d.diaLabel} - ${d.hora}:00h</strong><br/>
            Chamadas: ${d.count}<br/>
            ${maxCount > 0 ? `Percentual: ${((d.count / maxCount) * 100).toFixed(1)}% do pico` : ''}
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#0a0e1a')
          .attr('stroke-width', 1);

        d3.select('.heatmap-tooltip').style('display', 'none');
      });

    // Eixo X (dias da semana)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#e2e8f0');

    // Eixo Y (horas)
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}h`))
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#e2e8f0');

    // Título
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .attr('fill', '#f1f5f9')
      .text('Mapa de Calor: Volume de Chamadas por Hora e Dia');

    // Legenda de cores
    const legendWidth = 200;
    const legendHeight = 10;

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - legendWidth},${height - margin.bottom + 20})`);

    const legendScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(0));

    // Gradiente para legenda
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient');

    linearGradient.selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .join('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(d * maxCount));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)');

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#e2e8f0');

  }, [heatmapData, width, height]);

  return (
    <div className="heatmap-temporal-container">
      <svg ref={svgRef}></svg>
      <div className="heatmap-tooltip"></div>
    </div>
  );
};

export default HeatmapTemporal;
