/**
 * ETL Processor - Processa dados de URA in-memory
 * Aplica regras de normalização, limpeza e geração de fluxo contínuo
 * Suporta múltiplos formatos de entrada
 */

import { processarContactHistory, detectFileFormat } from './contactHistoryParser.js';

// Palavras-chave que representam ruídos/erros a serem descartados
const NOISE_KEYWORDS = [
  'Else',
  'Else_Invalido',
  'Silencio',
  'Menu_Chutes',
  'Erro',
  'Timeout'
];

// Nós finais válidos
const FINAL_NODES = ['Desconexao', 'Finalizacao', 'Transferencia'];

/**
 * Classe que representa um passo de navegação normalizado
 */
class PassoNavegacao {
  constructor(id_ligacao, timestamp, nomeMenu, codigoPonto) {
    this.id_ligacao = id_ligacao;
    this.timestamp = new Date(timestamp);
    this.nomeMenu = nomeMenu;
    this.codigoPonto = codigoPonto;
  }
}

/**
 * Verifica se um nome de menu é ruído/erro
 */
function isNoise(nomeMenu) {
  if (!nomeMenu) return true;
  return NOISE_KEYWORDS.some(keyword =>
    nomeMenu.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Converte linha do arquivo em objeto estruturado
 */
function parseLogLine(line) {
  const parts = line.split('|').map(p => p.trim());

  if (parts.length < 3) return null;

  return {
    id_ligacao: parts[0],
    timestamp: parts[1],
    fluxos: [],
    pontos: []
  };
}

/**
 * Extrai dados de fluxo e pontos das colunas
 */
function extractFluxosEPontos(parts) {
  const fluxos = [];
  const pontos = [];

  // Começa do índice 2 (após id_ligacao e timestamp)
  for (let i = 2; i < parts.length; i++) {
    const value = parts[i].trim();

    // Identifica se é fluxo (começa com letra) ou ponto (número)
    if (value && isNaN(value)) {
      fluxos.push(value);
    } else if (value) {
      pontos.push(value);
    }
  }

  return { fluxos, pontos };
}

/**
 * Sincroniza e normaliza colunas paralelas em lista ordenada
 */
function sincronizarPassos(logData) {
  const passos = [];

  logData.forEach(log => {
    const { id_ligacao, timestamp, fluxos, pontos } = log;

    // Garante que temos pares fluxo-ponto
    const maxLen = Math.min(fluxos.length, pontos.length);

    for (let i = 0; i < maxLen; i++) {
      const nomeMenu = fluxos[i];
      const codigoPonto = pontos[i];

      // Aplica regra de limpeza de ruído
      if (!isNoise(nomeMenu)) {
        passos.push(new PassoNavegacao(
          id_ligacao,
          timestamp,
          nomeMenu,
          codigoPonto
        ));
      }
    }
  });

  // Ordena por timestamp
  passos.sort((a, b) => a.timestamp - b.timestamp);

  return passos;
}

/**
 * Agrupa passos por sessão (id_ligacao)
 */
function agruparPorSessao(passos) {
  const sessoes = {};

  passos.forEach(passo => {
    if (!sessoes[passo.id_ligacao]) {
      sessoes[passo.id_ligacao] = [];
    }
    sessoes[passo.id_ligacao].push(passo);
  });

  return sessoes;
}

/**
 * Gera links para o Sankey eliminando loops
 */
function gerarLinksSankey(sessoes) {
  const links = [];
  const linkMap = new Map(); // Para agregação

  Object.values(sessoes).forEach(passosSessao => {
    for (let i = 0; i < passosSessao.length; i++) {
      const atual = passosSessao[i];
      let proximo = passosSessao[i + 1];

      // Define origem (source)
      let source = atual.nomeMenu;

      // Define destino (target)
      let target;

      if (proximo) {
        // Elimina loops: se próximo é igual ao atual, pula
        if (proximo.nomeMenu === atual.nomeMenu) {
          continue;
        }
        target = proximo.nomeMenu;
      } else {
        // Último passo da sessão
        // Verifica se termina em nó final válido
        if (FINAL_NODES.some(fn => atual.nomeMenu.includes(fn))) {
          target = atual.nomeMenu;
          source = passosSessao[i - 1]?.nomeMenu || 'INICIO';
        } else {
          target = 'FIM_ABANDONO';
        }
      }

      // Cria chave única para agregar contagem
      const linkKey = `${source}→${target}`;

      if (!linkMap.has(linkKey)) {
        linkMap.set(linkKey, {
          source,
          target,
          value: 0,
          codigosPonto: new Set()
        });
      }

      const link = linkMap.get(linkKey);
      link.value++;
      link.codigosPonto.add(atual.codigoPonto);
    }
  });

  // Converte Map para Array e transforma Set em Array
  return Array.from(linkMap.values()).map(link => ({
    ...link,
    codigosPonto: Array.from(link.codigosPonto)
  }));
}

/**
 * Extrai nós únicos dos links
 */
function extrairNos(links) {
  const nosSet = new Set();

  links.forEach(link => {
    nosSet.add(link.source);
    nosSet.add(link.target);
  });

  return Array.from(nosSet).map(nome => ({ name: nome }));
}

/**
 * Calcula métricas principais
 */
function calcularMetricas(sessoes, passos) {
  const totalSessoes = Object.keys(sessoes).length;

  // Duração média (simulada - em segundos)
  const duracoes = Object.values(sessoes).map(passosSessao => {
    if (passosSessao.length < 2) return 0;
    const inicio = passosSessao[0].timestamp;
    const fim = passosSessao[passosSessao.length - 1].timestamp;
    return (fim - inicio) / 1000; // segundos
  });

  const duracaoMedia = duracoes.reduce((a, b) => a + b, 0) / duracoes.length || 0;

  // Taxa de transferência
  let transferencias = 0;
  let abandonos = 0;

  Object.values(sessoes).forEach(passosSessao => {
    const ultimoPasso = passosSessao[passosSessao.length - 1];
    if (ultimoPasso.nomeMenu.includes('Transferencia')) {
      transferencias++;
    } else if (!FINAL_NODES.some(fn => ultimoPasso.nomeMenu.includes(fn))) {
      abandonos++;
    }
  });

  return {
    totalSessoes,
    duracaoMedia: Math.round(duracaoMedia),
    taxaTransferencia: totalSessoes > 0 ? ((transferencias / totalSessoes) * 100).toFixed(1) : 0,
    taxaAbandono: totalSessoes > 0 ? ((abandonos / totalSessoes) * 100).toFixed(1) : 0
  };
}

/**
 * Função principal de ETL
 * Processa arquivo de texto e retorna dados estruturados
 * Detecta automaticamente o formato e usa o parser apropriado
 */
export function processarArquivoURA(fileContent) {
  try {
    // Detecta o formato do arquivo
    const formato = detectFileFormat(fileContent);

    // Se for formato ContactHistory, usa o parser específico
    if (formato === 'contact_history') {
      return processarContactHistory(fileContent);
    }

    // Caso contrário, usa o processamento original (pipe-separated)
    // 1. Parse do arquivo
    const lines = fileContent.split('\n').filter(line => line.trim());

    const logData = [];

    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        const { fluxos, pontos } = extractFluxosEPontos(parts);

        logData.push({
          id_ligacao: parts[0],
          timestamp: parts[1],
          fluxos,
          pontos
        });
      }
    });

    // 2. Sincronização e Normalização
    const passos = sincronizarPassos(logData);

    // 3. Agrupamento por sessão
    const sessoes = agruparPorSessao(passos);

    // 4. Geração de links do Sankey
    const links = gerarLinksSankey(sessoes);

    // 5. Extração de nós
    const nodes = extrairNos(links);

    // 6. Cálculo de métricas
    const metricas = calcularMetricas(sessoes, passos);

    return {
      success: true,
      data: {
        nodes,
        links,
        metricas,
        passos, // Para drill-down
        sessoes // Para análise detalhada
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Filtra passos por nó específico (para drill-down)
 */
export function filtrarPassosPorNo(passos, nomeNo) {
  return passos.filter(passo => passo.nomeMenu === nomeNo);
}
