import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta o relatório completo do Sankey para PDF
 * @param {Object} data - Dados processados do Sankey
 * @param {string} fileName - Nome do arquivo de origem
 */
export const exportSankeyReportToPDF = async (data, fileName = 'relatorio') => {
  try {
    // Cria instância do PDF em formato A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    let currentY = margin;

    // ========== CAPA ==========
    pdf.setFillColor(10, 14, 26);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Título principal
    pdf.setTextColor(45, 212, 191);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Análise', pageWidth / 2, 80, { align: 'center' });
    pdf.text('Diagrama de Sankey', pageWidth / 2, 95, { align: 'center' });

    // Subtítulo
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Análise de Fluxo de Chamadas URA', pageWidth / 2, 115, { align: 'center' });

    // Data do relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.setFontSize(11);
    pdf.text(`Gerado em: ${dataAtual}`, pageWidth / 2, 130, { align: 'center' });

    // Arquivo de origem
    if (fileName) {
      pdf.setFontSize(10);
      pdf.text(`Arquivo: ${fileName}`, pageWidth / 2, 140, { align: 'center' });
    }

    // Linha decorativa
    pdf.setDrawColor(45, 212, 191);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 150, pageWidth - margin, 150);

    // Informações gerais na capa
    pdf.setTextColor(241, 245, 249);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Visão Geral', pageWidth / 2, 170, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const overview = [
      `Total de Jornadas: ${data.stats.totalJornadas || 0}`,
      `Nós (Fluxos): ${data.stats.totalNodes}`,
      `Transições: ${data.stats.totalLinks}`,
      `Duração Média: ${(data.stats.duracaoMedia || 0).toFixed(0)}s`
    ];

    let overviewY = 180;
    overview.forEach(line => {
      pdf.text(line, pageWidth / 2, overviewY, { align: 'center' });
      overviewY += 8;
    });

    // ========== NOVA PÁGINA: MÉTRICAS PRINCIPAIS ==========
    pdf.addPage();
    currentY = margin;

    // Título da seção
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    pdf.setTextColor(45, 212, 191);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Métricas Principais', margin, 20);

    currentY = 45;

    // Indicadores de resultado
    pdf.setTextColor(241, 245, 249);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Indicadores de Resultado', margin, currentY);
    currentY += 10;

    const totalJornadas = data.stats.totalJornadas || 0;
    const indicadores = data.temporal?.porIndicador || {};

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Abandono
    const abandonos = indicadores['Abandono'] || 0;
    const percAbandono = totalJornadas > 0 ? ((abandonos / totalJornadas) * 100).toFixed(1) : 0;
    pdf.setTextColor(239, 68, 68);
    pdf.text(`● Abandono: ${abandonos} chamadas (${percAbandono}%)`, margin + 5, currentY);
    currentY += 8;

    // Desconexão
    const desconexoes = indicadores['Desconexao'] || 0;
    const percDesconexao = totalJornadas > 0 ? ((desconexoes / totalJornadas) * 100).toFixed(1) : 0;
    pdf.setTextColor(251, 191, 36);
    pdf.text(`● Desconexão: ${desconexoes} chamadas (${percDesconexao}%)`, margin + 5, currentY);
    currentY += 8;

    // Transferência
    const transferencias = indicadores['Transferencia'] || 0;
    const percTransferencia = totalJornadas > 0 ? ((transferencias / totalJornadas) * 100).toFixed(1) : 0;
    pdf.setTextColor(16, 185, 129);
    pdf.text(`● Transferência: ${transferencias} chamadas (${percTransferencia}%)`, margin + 5, currentY);
    currentY += 15;

    // Distribuição temporal
    pdf.setTextColor(241, 245, 249);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribuição Temporal', margin, currentY);
    currentY += 10;

    // Por hora
    pdf.setFontSize(12);
    pdf.text('Top 5 Horários com Maior Volume:', margin + 5, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);

    const horasPorVolume = Object.entries(data.temporal?.porHora || {})
      .map(([hora, count]) => ({ hora: parseInt(hora), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    horasPorVolume.forEach((item, index) => {
      const perc = totalJornadas > 0 ? ((item.count / totalJornadas) * 100).toFixed(1) : 0;
      pdf.text(`${index + 1}. ${item.hora}h - ${item.count} chamadas (${perc}%)`, margin + 10, currentY);
      currentY += 6;
    });

    currentY += 8;

    // Por dia da semana
    pdf.setFontSize(12);
    pdf.setTextColor(241, 245, 249);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribuição por Dia da Semana:', margin + 5, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diasPorVolume = Object.entries(data.temporal?.porDia || {})
      .map(([dia, count]) => ({ dia: parseInt(dia), nome: diasSemana[parseInt(dia)], count }))
      .sort((a, b) => b.count - a.count);

    diasPorVolume.forEach((item, index) => {
      const perc = totalJornadas > 0 ? ((item.count / totalJornadas) * 100).toFixed(1) : 0;
      pdf.text(`${item.nome} - ${item.count} chamadas (${perc}%)`, margin + 10, currentY);
      currentY += 6;
    });

    currentY += 8;

    // Top produtos
    pdf.setFontSize(12);
    pdf.setTextColor(241, 245, 249);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top 5 Produtos:', margin + 5, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);

    const produtosPorVolume = Object.entries(data.temporal?.porProduto || {})
      .map(([produto, count]) => ({ produto, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    produtosPorVolume.forEach((item, index) => {
      const perc = totalJornadas > 0 ? ((item.count / totalJornadas) * 100).toFixed(1) : 0;
      pdf.text(`${index + 1}. ${item.produto} - ${item.count} chamadas (${perc}%)`, margin + 10, currentY);
      currentY += 6;
    });

    // ========== NOVA PÁGINA: ANÁLISE DE FLUXOS ==========
    pdf.addPage();
    currentY = margin;

    // Título da seção
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    pdf.setTextColor(45, 212, 191);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Análise de Fluxos', margin, 20);

    currentY = 45;

    // Principais nós
    pdf.setTextColor(241, 245, 249);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Principais Nós (Fluxos)', margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);

    // Calcula volume por nó
    const nodeVolumes = new Map();
    data.links.forEach(link => {
      nodeVolumes.set(link.source, (nodeVolumes.get(link.source) || 0) + link.value);
      nodeVolumes.set(link.target, (nodeVolumes.get(link.target) || 0) + link.value);
    });

    const topNodes = Array.from(nodeVolumes.entries())
      .filter(([name]) => !['Abandono', 'Desconexao', 'Transferencia'].includes(name))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    topNodes.forEach((item, index) => {
      const [name, volume] = item;
      pdf.text(`${index + 1}. ${name} - ${volume.toFixed(0)} passagens`, margin + 5, currentY);
      currentY += 6;

      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }
    });

    currentY += 10;

    // Principais transições
    pdf.setFontSize(14);
    pdf.setTextColor(241, 245, 249);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Principais Transições', margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);

    const topLinks = [...data.links]
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    topLinks.forEach((link, index) => {
      const perc = totalJornadas > 0 ? ((link.value / totalJornadas) * 100).toFixed(1) : 0;
      pdf.text(`${index + 1}. ${link.source} → ${link.target}`, margin + 5, currentY);
      currentY += 5;
      pdf.setTextColor(45, 212, 191);
      pdf.text(`   ${link.value.toFixed(0)} jornadas (${perc}%)`, margin + 5, currentY);
      pdf.setTextColor(148, 163, 184);
      currentY += 7;

      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }
    });

    // ========== NOVA PÁGINA: CAPTURAS DE VISUALIZAÇÕES ==========
    pdf.addPage();
    currentY = margin;

    // Título da seção
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    pdf.setTextColor(45, 212, 191);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. Visualizações', margin, 20);

    currentY = 45;

    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Capturando visualizações do dashboard...', margin, currentY);
    currentY += 10;

    // Captura os componentes principais
    const componentsToCapture = [
      { selector: '.sankey-metrics', title: 'Métricas Gerais' },
      { selector: '.custom-sankey-container', title: 'Diagrama de Sankey' },
      { selector: '.heatmap-temporal-container', title: 'Mapa de Calor Temporal' }
    ];

    for (const component of componentsToCapture) {
      const element = document.querySelector(component.selector);
      if (element) {
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0a0e1a',
            logging: false,
            useCORS: true
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Verifica se precisa de nova página
          if (currentY + imgHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }

          // Adiciona título da visualização
          pdf.setTextColor(241, 245, 249);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(component.title, margin, currentY);
          currentY += 8;

          // Adiciona imagem
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;

        } catch (error) {
          console.warn(`Erro ao capturar ${component.selector}:`, error);
        }
      }
    }

    // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
    const totalPages = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Linha decorativa no rodapé
      pdf.setDrawColor(45, 212, 191);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      // Número da página
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Texto do rodapé
      pdf.text(
        'Relatório gerado por Dashboard de Análise URA',
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }

    // Salva o PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    const pdfFileName = `relatorio-sankey-${timestamp}.pdf`;
    pdf.save(pdfFileName);

    return {
      success: true,
      message: 'Relatório PDF gerado com sucesso!',
      fileName: pdfFileName
    };

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return {
      success: false,
      message: 'Erro ao gerar relatório PDF: ' + error.message
    };
  }
};
