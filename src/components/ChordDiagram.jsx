import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ChordDiagram.css';

const ChordDiagram = ({ data, width = 600, height = 600 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.journeys || !svgRef.current) return;

    // Limpa SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Extrai fluxos únicos para criar matriz
    const fluxosSet = new Set();
    data.journeys.forEach(journey => {
      journey.fluxos.forEach(fluxo => fluxosSet.add(fluxo));
    });

    const fluxos = Array.from(fluxosSet).slice(0, 15); // Limita a 15 para não ficar muito poluído
    const n = fluxos.length;

    // Cria matriz de adjacência
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    const fluxoIndex = new Map(fluxos.map((f, i) => [f, i]));

    // Preenche matriz com base nas transições
    data.journeys.forEach(journey => {
      for (let i = 0; i < journey.fluxos.length - 1; i++) {
        const sourceFluxo = journey.fluxos[i];
        const targetFluxo = journey.fluxos[i + 1];

        const sourceIdx = fluxoIndex.get(sourceFluxo);
        const targetIdx = fluxoIndex.get(targetFluxo);

        if (sourceIdx !== undefined && targetIdx !== undefined) {
          matrix[sourceIdx][targetIdx]++;
        }
      }
    });

    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius - 30;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('max-width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Escala de cores
    const color = d3.scaleOrdinal()
      .domain(d3.range(n))
      .range(d3.schemeCategory10);

    // Cria chord layout
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const chords = chord(matrix);

    // Desenha grupos (arcos externos)
    const group = g.append('g')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    group.append('path')
      .attr('fill', d => color(d.index))
      .attr('stroke', d => d3.rgb(color(d.index)).darker())
      .attr('d', arc)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);

        // Destaca ribbons conectados
        ribbons.attr('opacity', r =>
          (r.source.index === d.index || r.target.index === d.index) ? 0.7 : 0.1
        );

        // Mostra tooltip
        const tooltip = d3.select('.chord-tooltip');
        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <strong>${fluxos[d.index]}</strong><br/>
            Total de transições: ${d.value}
          `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        ribbons.attr('opacity', 0.6);
        d3.select('.chord-tooltip').style('display', 'none');
      });

    // Adiciona labels aos grupos
    group.append('text')
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '.35em')
      .attr('transform', d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 10})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : 'start')
      .attr('font-size', '10px')
      .attr('fill', '#e2e8f0')
      .text(d => {
        const label = fluxos[d.index];
        return label.length > 20 ? label.substring(0, 17) + '...' : label;
      });

    // Desenha ribbons (conexões)
    const ribbons = g.append('g')
      .attr('fill-opacity', 0.6)
      .selectAll('path')
      .data(chords)
      .join('path')
      .attr('d', ribbon)
      .attr('fill', d => color(d.target.index))
      .attr('stroke', d => d3.rgb(color(d.target.index)).darker())
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.9);

        // Mostra tooltip
        const tooltip = d3.select('.chord-tooltip');
        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <strong>${fluxos[d.source.index]} → ${fluxos[d.target.index]}</strong><br/>
            Fluxo: ${d.source.value} transições
          `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill-opacity', 0.6);
        d3.select('.chord-tooltip').style('display', 'none');
      });

  }, [data, width, height]);

  return (
    <div className="chord-diagram-container">
      <svg ref={svgRef}></svg>
      <div className="chord-tooltip"></div>
    </div>
  );
};

export default ChordDiagram;
