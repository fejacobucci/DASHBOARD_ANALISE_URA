import * as XLSX from 'xlsx';

/**
 * Processa arquivo de planilha (XLS, XLSX, CSV, ODS)
 * Converte os dados em formato adequado para o diagrama Sankey
 */
export const processSpreadsheet = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Pega a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Dados da planilha:', jsonData);

        // Processa os dados para o formato Sankey
        const sankeyData = convertToSankeyFormat(jsonData);

        resolve({
          success: true,
          data: sankeyData,
          rawData: jsonData
        });
      } catch (error) {
        console.error('Erro ao processar planilha:', error);
        reject({
          success: false,
          error: 'Erro ao processar arquivo: ' + error.message
        });
      }
    };

    reader.onerror = () => {
      reject({
        success: false,
        error: 'Erro ao ler arquivo'
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Converte dados da planilha para formato Sankey com fluxos
 * Para arquivos de URA com colunas estruturadas
 */
const convertToSankeyFormat = (rawData) => {
  if (!rawData || rawData.length === 0) {
    throw new Error('Planilha vazia');
  }

  // Identifica se é formato URA (com headers) ou formato simples
  const headers = rawData[0];
  const isURAFormat = headers.includes('FLUXO') || headers.includes('INDICADOR');

  if (isURAFormat) {
    return convertURADataToSankey(rawData);
  } else {
    return convertSimpleFormatToSankey(rawData);
  }
};

/**
 * ALGORITMO REGRESSIVO: Remove loops analisando o caminho de trás para frente
 *
 * Este algoritmo funciona da seguinte forma:
 * 1. Começa do final do caminho (abordagem regressiva)
 * 2. Para cada nó, verifica se ele já apareceu antes no caminho
 * 3. Se aparecer, significa que há um loop - remove todo o segmento do loop
 * 4. Mantém apenas o caminho de progresso linear (sem retornos)
 *
 * Exemplo:
 * Input:  [A, B, C, B, D, E, C, F]
 * Output: [A, B, C, F] (remove loops B→C→B e C→...→C)
 *
 * @param {Array<string>} fluxos - Array de nós do caminho
 * @returns {Array<string>} - Array sem loops, apenas progressão linear
 */
const removeLoopsRegressively = (fluxos) => {
  if (fluxos.length === 0) return [];

  // Mapa para rastrear a última posição de cada nó
  const ultimaPosicao = new Map();

  // Array para marcar quais posições devem ser mantidas
  const manter = new Array(fluxos.length).fill(true);

  // FASE 1: Análise regressiva - percorre de trás para frente
  // Detecta loops e marca segmentos para remoção
  for (let i = fluxos.length - 1; i >= 0; i--) {
    const nodoAtual = fluxos[i];

    if (ultimaPosicao.has(nodoAtual)) {
      // Detectou loop: este nó apareceu depois no caminho
      const posicaoFutura = ultimaPosicao.get(nodoAtual);

      // Marca todo o segmento do loop para remoção (exceto a última ocorrência)
      // Mantém apenas a progressão para frente
      for (let j = i; j < posicaoFutura; j++) {
        manter[j] = false;
      }

      console.log(`🔄 Loop detectado: ${nodoAtual} (posição ${i} → ${posicaoFutura})`);
    }

    // Atualiza a última posição vista (análise regressiva)
    ultimaPosicao.set(nodoAtual, i);
  }

  // FASE 2: Constrói o caminho final sem loops
  const caminhoSemLoops = [];
  for (let i = 0; i < fluxos.length; i++) {
    if (manter[i]) {
      caminhoSemLoops.push(fluxos[i]);
    }
  }

  // FASE 3: Remove duplicatas que possam ter sobrado
  const resultado = [];
  const visitados = new Set();
  for (const nodo of caminhoSemLoops) {
    if (!visitados.has(nodo)) {
      resultado.push(nodo);
      visitados.add(nodo);
    }
  }

  if (resultado.length !== fluxos.length) {
    console.log(`✅ Caminho otimizado: ${fluxos.length} → ${resultado.length} nós (${fluxos.length - resultado.length} loops removidos)`);
    console.log(`   Original: [${fluxos.join(' → ')}]`);
    console.log(`   Limpo:    [${resultado.join(' → ')}]`);
  }

  return resultado;
};

/**
 * Converte formato URA (EXEMPLOS_CHAMADAS_FELIPE.ods) para Sankey
 */
const convertURADataToSankey = (rawData) => {
  const headers = rawData[0];
  const dataRows = rawData.slice(1);

  // Mapeia índices das colunas importantes
  const colIndexes = {
    dataRef: headers.indexOf('DATA_REF'),
    horaRef: headers.indexOf('HORA_REF'),
    diaSemana: headers.indexOf('DIA_DA_SEMANA'),
    horaInteira: headers.indexOf('HORA_INTEIRA'),
    codLigacao: headers.indexOf('COD_IDENTIFICACAO_LIGACAO'),
    fluxo: headers.indexOf('FLUXO'),
    indicador: headers.indexOf('INDICADOR'),
    duracao: headers.indexOf('DURACAO'),
    produto: headers.indexOf('PRODUTO'),
    tipoServico: headers.indexOf('TIPO_SERVICO'),
    ultimoPonto: headers.indexOf('ULTIMO_PONTO'),
    timestamp: headers.indexOf('TMP_TIMESTAMP')
  };

  // Valida se encontrou as colunas essenciais
  if (colIndexes.fluxo === -1 || colIndexes.indicador === -1) {
    throw new Error('Colunas FLUXO ou INDICADOR não encontradas na planilha');
  }

  // Estruturas para armazenar dados
  const nodesMap = new Map();
  const linksMap = new Map();
  const journeys = [];
  const temporalData = {
    porHora: {},
    porDia: {},
    porProduto: {},
    porIndicador: { 'Abandono': 0, 'Desconexao': 0, 'Transferencia': 0 }
  };

  // Processa cada chamada
  dataRows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    const fluxoStr = row[colIndexes.fluxo];
    const indicador = row[colIndexes.indicador] || 'Desconexao';

    if (!fluxoStr || fluxoStr === '') {
      console.warn(`Linha ${index + 2}: FLUXO vazio`);
      return;
    }

    // Extrai fluxos da string separada por "|"
    const fluxos = fluxoStr.split('|').map(f => f.trim()).filter(f => f !== '');

    if (fluxos.length === 0) return;

    // Normaliza indicador para destinos válidos
    let destino = 'Desconexao';
    if (indicador.toLowerCase().includes('abandon')) {
      destino = 'Abandono';
      temporalData.porIndicador['Abandono']++;
    } else if (indicador.toLowerCase().includes('transfer')) {
      destino = 'Transferencia';
      temporalData.porIndicador['Transferencia']++;
    } else {
      temporalData.porIndicador['Desconexao']++;
    }

    // Remove duplicatas consecutivas mantendo a ordem
    const fluxosUnicos = [];
    let lastFluxo = null;
    fluxos.forEach(f => {
      if (f !== lastFluxo) {
        fluxosUnicos.push(f);
        lastFluxo = f;
      }
    });

    // ALGORITMO REGRESSIVO: Remove ciclos analisando o caminho de trás para frente
    // Este algoritmo detecta loops e mantém apenas o avanço progressivo
    const fluxosSemCiclo = removeLoopsRegressively(fluxosUnicos);

    if (fluxosSemCiclo.length === 0) return; // Ignora se não há fluxos válidos

    // Adiciona origem se não existir
    const origem = fluxosSemCiclo[0];
    if (!nodesMap.has(origem)) {
      nodesMap.set(origem, { name: origem, type: 'origem' });
    }

    // Adiciona destino final se não existir
    if (!nodesMap.has(destino)) {
      nodesMap.set(destino, { name: destino, type: 'destino' });
    }

    // Cria links entre fluxos consecutivos
    for (let i = 0; i < fluxosSemCiclo.length - 1; i++) {
      const source = fluxosSemCiclo[i];
      const target = fluxosSemCiclo[i + 1];

      // Evita criar link para si mesmo
      if (source === target) continue;

      // Adiciona nodes intermediários
      if (!nodesMap.has(source)) {
        nodesMap.set(source, { name: source, type: 'intermediario' });
      }
      if (!nodesMap.has(target)) {
        nodesMap.set(target, { name: target, type: 'intermediario' });
      }

      // Cria ou incrementa link
      const linkKey = `${source}→${target}`;
      if (linksMap.has(linkKey)) {
        linksMap.get(linkKey).value++;
      } else {
        linksMap.set(linkKey, { source, target, value: 1 });
      }
    }

    // Link do último fluxo para o destino final
    const ultimoFluxo = fluxosSemCiclo[fluxosSemCiclo.length - 1];

    // Evita criar link se o último fluxo é o mesmo que o destino
    if (ultimoFluxo !== destino) {
      const linkFinalKey = `${ultimoFluxo}→${destino}`;
      if (linksMap.has(linkFinalKey)) {
        linksMap.get(linkFinalKey).value++;
      } else {
        linksMap.set(linkFinalKey, { source: ultimoFluxo, target: destino, value: 1 });
      }
    }

    // Coleta dados temporais
    const hora = row[colIndexes.horaInteira];
    const dia = row[colIndexes.diaSemana];
    const produto = row[colIndexes.produto] || 'Não Identificado';
    const duracao = parseInt(row[colIndexes.duracao]) || 0;

    if (hora !== undefined && hora !== '') {
      temporalData.porHora[hora] = (temporalData.porHora[hora] || 0) + 1;
    }
    if (dia !== undefined && dia !== '') {
      temporalData.porDia[dia] = (temporalData.porDia[dia] || 0) + 1;
    }
    if (produto) {
      temporalData.porProduto[produto] = (temporalData.porProduto[produto] || 0) + 1;
    }

    // Armazena jornada completa
    journeys.push({
      id: row[colIndexes.codLigacao],
      fluxos: fluxosSemCiclo,
      destino,
      duracao,
      hora,
      dia,
      produto
    });
  });

  let nodes = Array.from(nodesMap.values());
  let links = Array.from(linksMap.values());

  console.log('Nodes processados (URA):', nodes.length);
  console.log('Links processados (URA):', links.length);

  // OTIMIZAÇÃO: Limita a top 100 nós mais relevantes para grandes datasets
  const MAX_NODES = 100;
  if (nodes.length > MAX_NODES) {
    console.log(`⚠️ Dataset grande detectado (${nodes.length} nós). Limitando a top ${MAX_NODES} mais relevantes...`);

    // Calcula relevância de cada nó (soma do tráfego de entrada + saída)
    const nodeRelevance = new Map();
    nodes.forEach(node => {
      nodeRelevance.set(node.name, 0);
    });

    links.forEach(link => {
      nodeRelevance.set(link.source, (nodeRelevance.get(link.source) || 0) + link.value);
      nodeRelevance.set(link.target, (nodeRelevance.get(link.target) || 0) + link.value);
    });

    // Sempre mantém nós de origem e destino
    const importantTypes = new Set(['origem', 'destino']);
    const mustKeepNodes = nodes.filter(n => importantTypes.has(n.type)).map(n => n.name);

    // Ordena por relevância e pega top N
    const topNodes = nodes
      .filter(n => !mustKeepNodes.includes(n.name))
      .sort((a, b) => nodeRelevance.get(b.name) - nodeRelevance.get(a.name))
      .slice(0, MAX_NODES - mustKeepNodes.length)
      .map(n => n.name);

    const keepNodes = new Set([...mustKeepNodes, ...topNodes]);

    // Filtra nós e links
    nodes = nodes.filter(n => keepNodes.has(n.name));
    links = links.filter(l => keepNodes.has(l.source) && keepNodes.has(l.target));

    console.log(`✓ Reduzido para ${nodes.length} nós e ${links.length} links (mantendo os mais relevantes)`);
  }

  console.log('Jornadas processadas:', journeys.length);

  return {
    nodes,
    links,
    journeys,
    temporal: temporalData,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      totalValue: links.reduce((sum, link) => sum + link.value, 0),
      totalJornadas: journeys.length,
      duracaoMedia: journeys.reduce((sum, j) => sum + j.duracao, 0) / journeys.length
    }
  };
};

/**
 * Converte formato simples [origem, destino, valor] para Sankey
 */
const convertSimpleFormatToSankey = (rawData) => {
  const hasHeader = isNaN(rawData[0][2]);
  const dataRows = hasHeader ? rawData.slice(1) : rawData;

  const nodesMap = new Map();
  const links = [];

  dataRows.forEach((row, index) => {
    if (row.length < 2) {
      console.warn(`Linha ${index + 1} ignorada: menos de 2 colunas`);
      return;
    }

    const source = String(row[0]).trim();
    const target = String(row[1]).trim();
    const value = row[2] ? parseFloat(row[2]) : 1;

    if (!source || !target) {
      console.warn(`Linha ${index + 1} ignorada: origem ou destino vazio`);
      return;
    }

    if (!nodesMap.has(source)) {
      nodesMap.set(source, { name: source });
    }
    if (!nodesMap.has(target)) {
      nodesMap.set(target, { name: target });
    }

    links.push({
      source,
      target,
      value: isNaN(value) ? 1 : value
    });
  });

  const nodes = Array.from(nodesMap.values());

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      totalValue: links.reduce((sum, link) => sum + link.value, 0)
    }
  };
};

/**
 * Valida se o arquivo tem formato adequado
 */
export const validateSpreadsheetFormat = (data) => {
  if (!data || !data.nodes || !data.links) {
    return {
      valid: false,
      error: 'Dados inválidos: faltam nodes ou links'
    };
  }

  if (data.nodes.length === 0) {
    return {
      valid: false,
      error: 'Nenhum nó encontrado na planilha'
    };
  }

  if (data.links.length === 0) {
    return {
      valid: false,
      error: 'Nenhuma conexão encontrada na planilha'
    };
  }

  // Verifica se todos os links têm source e target válidos
  const nodeNames = new Set(data.nodes.map(n => n.name));
  const invalidLinks = data.links.filter(
    link => !nodeNames.has(link.source) || !nodeNames.has(link.target)
  );

  if (invalidLinks.length > 0) {
    return {
      valid: false,
      error: `${invalidLinks.length} conexão(ões) com nós inexistentes`
    };
  }

  return {
    valid: true
  };
};

/**
 * Exporta dados processados para download
 */
export const exportSankeyData = (data, filename = 'sankey-data.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
