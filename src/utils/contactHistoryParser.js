/**
 * Contact History Parser
 * Processa arquivos ContactHistory.txt com formato chave-valor
 */

// Palavras-chave que representam ruídos/erros a serem descartados
const NOISE_KEYWORDS = [
  'Else',
  'Else_Invalido',
  'Silencio',
  'Menu_Chutes',
  'Erro',
  'Timeout'
];

// Eventos técnicos que devem ser ignorados
const NOISE_EVENTS = [
  'validacao',
  'validacao_parametro',
  'inicio_menu'
];

// Nós finais válidos
const FINAL_NODES = ['Desconexao', 'Finalizacao', 'Transferencia'];

// Mapeamento de indicadores para nós de fim
const INDICATOR_TO_NODE = {
  'Abandono': 'FIM_ABANDONO',
  'Transferencia': 'Transferencia',
  'Desconexao': 'Desconexao',
  'Finalizacao': 'Finalizacao'
};

/**
 * Classe que representa um passo de navegação
 */
class PassoNavegacao {
  constructor(id_ligacao, timestamp, nomeMenu, codigoPonto, tipoServico = null, nomeEvento = null) {
    this.id_ligacao = id_ligacao;
    this.timestamp = new Date(timestamp);
    this.nomeMenu = nomeMenu;
    this.nomeEvento = nomeEvento; // Nome do evento (event_name_n)
    this.codigoPonto = codigoPonto;
    this.tipoServico = tipoServico; // Tipo de serviço destino (para transferências)
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
 * Converte timestamp do formato DD/MM/YYYY HH:mm:ss para ISO 8601
 */
function convertTimestamp(timestampStr) {
  if (!timestampStr) return new Date();

  // Formato: 27/11/2025 20:26:42
  const [datePart, timePart] = timestampStr.split(' ');
  const [day, month, year] = datePart.split('/');

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
}

/**
 * Parse do arquivo ContactHistory.txt formato chave-valor
 */
function parseContactHistoryTxt(fileContent) {
  const lines = fileContent.split('\n');
  const data = {};

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Formato: chave\tvalor ou chave\tvalor\tchave2\tvalor2
    const parts = trimmed.split('\t');

    for (let i = 0; i < parts.length - 1; i += 2) {
      const key = parts[i]?.trim();
      const value = parts[i + 1]?.trim();

      if (key && value !== undefined) {
        data[key] = value;
      }
    }
  });

  return data;
}

/**
 * Separa valores concatenados por pipe
 */
function splitPipeValues(value) {
  if (!value) return [];
  return value.split('|').map(v => v.trim()).filter(v => v !== '');
}

/**
 * Extrai o Tipo_Servico do campo tag_roteamento_1
 * Formato: "Tipo_Servico:JORNADA_RE_GERAL|Workflow:JORNADA_RE|..."
 */
function extrairTipoServico(tagRoteamento) {
  if (!tagRoteamento) return null;

  const match = tagRoteamento.match(/Tipo_Servico:([^|]+)/);
  return match ? match[1].trim() : null;
}

/**
 * Sincroniza fluxos com pontos e timestamps
 * Retorna DOIS arrays: passos válidos para o Sankey e TODOS os passos para drill-down
 */
function sincronizarFluxosComPontos(data) {
  // Concatena TODOS os fluxos (fluxo_1, fluxo_2, fluxo_3, etc.)
  let todosFluxos = [];
  let todosPontos = [];
  let todosTimestamps = [];
  let todosEventos = []; // Adiciona eventos

  for (let i = 1; i <= 10; i++) { // Processa até fluxo_10
    const fluxoKey = `fluxo_${i}`;
    const pontoKey = `ponto_${i}`;
    const timestampKey = `timestamp_${i}`;
    const eventoKey = `validacao_${i}`; // Campo validacao_n

    if (data[fluxoKey]) {
      todosFluxos = todosFluxos.concat(splitPipeValues(data[fluxoKey]));
      todosPontos = todosPontos.concat(splitPipeValues(data[pontoKey] || ''));
      todosTimestamps = todosTimestamps.concat(splitPipeValues(data[timestampKey] || ''));
      todosEventos = todosEventos.concat(splitPipeValues(data[eventoKey] || ''));
    }
  }

  const fluxos = todosFluxos;
  const pontos = todosPontos;
  const timestamps = todosTimestamps;
  const eventos = todosEventos;

  console.log('Sincronizando dados:');
  console.log('- Fluxos:', fluxos);
  console.log('- Pontos:', pontos);
  console.log('- Timestamps:', timestamps);
  console.log('- Eventos:', eventos);

  const passos = [];
  const todosPassos = []; // TODOS os passos, incluindo ignorados
  const id_ligacao = data.cod_identificacao_ligacao || data.ID || 'UNKNOWN';

  // Extrai o Tipo_Servico do tag_roteamento_1
  const tipoServico = extrairTipoServico(data.tag_roteamento_1);
  console.log('- Tipo de Serviço extraído:', tipoServico);

  // Itera pelos fluxos (que são menos que os pontos)
  for (let i = 0; i < fluxos.length; i++) {
    const nomeMenu = fluxos[i];
    const codigoPonto = pontos[i] || '';
    const timestamp = timestamps[i] || data.data_hora_inicio_ligacao || '';
    const nomeEvento = eventos[i] || ''; // Evento correspondente

    const passo = {
      id_ligacao,
      timestamp: convertTimestamp(timestamp),
      nomeMenu,
      nomeEvento, // Adiciona evento
      codigoPonto,
      tipoServico, // Adiciona tipo de serviço (para transferências)
      isNoise: isNoise(nomeMenu) || !nomeMenu // Marca se é ruído
    };

    // SEMPRE adiciona em todosPassos
    todosPassos.push(passo);

    // Adiciona em passos válidos apenas se não for ruído
    if (nomeMenu && !isNoise(nomeMenu)) {
      passos.push(passo);
      console.log(`  Passo ${passos.length}: ${nomeMenu} (ponto: ${codigoPonto})`);
    } else {
      console.log(`  Ignorado (ruído ou vazio): ${nomeMenu}`);
    }
  }

  console.log(`Total de passos válidos: ${passos.length}`);
  console.log(`Total de TODOS os passos: ${todosPassos.length}`);
  return { passos, todosPassos };
}

/**
 * Elimina loops e repetições (ex: A -> A ou A -> B -> A)
 * REGRA: Um nó só pode aparecer UMA VEZ no fluxo
 */
function eliminarLoops(passos) {
  if (passos.length === 0) return [];

  const semLoops = [];
  const nosVisitados = new Set();

  console.log('🔄 Eliminando loops e repetições...');

  for (let i = 0; i < passos.length; i++) {
    const atual = passos[i];
    const nomeMenu = atual.nomeMenu;

    // Se este nó JÁ foi visitado, IGNORA (evita ciclos)
    if (nosVisitados.has(nomeMenu)) {
      console.log(`  ⚠️ Nó repetido ignorado: ${nomeMenu} (já apareceu antes)`);
      continue;
    }

    // Adiciona à lista limpa e marca como visitado
    semLoops.push(atual);
    nosVisitados.add(nomeMenu);
    console.log(`  ✅ Nó adicionado: ${nomeMenu}`);
  }

  console.log(`📊 Resultado: ${passos.length} passos → ${semLoops.length} passos (sem repetições)`);

  return semLoops;
}

/**
 * Gera nó de fim baseado no indicador e último fluxo
 */
function gerarNoFim(data, ultimoPasso) {
  console.log('🎯 [gerarNoFim] Determinando nó de fim...');
  console.log('  - Último passo recebido:', ultimoPasso);
  console.log('  - Indicador:', data.indicador_1);

  // Primeiro verifica o último passo do fluxo
  if (ultimoPasso) {
    const ultimoNome = ultimoPasso.nomeMenu.toLowerCase();
    console.log('  - Nome do último passo (lowercase):', ultimoNome);

    // Transferência
    if (ultimoNome.includes('transfer')) {
      console.log('  ✅ Detectado TRANSFERÊNCIA no último passo');
      return 'Transferencia';
    }

    // Finalização
    if (ultimoNome.includes('finaliz') || ultimoNome.includes('fim') ||
        ultimoNome.includes('encerra')) {
      console.log('  ✅ Detectado FINALIZAÇÃO no último passo');
      return 'Finalizacao';
    }

    // Desconexão
    if (ultimoNome.includes('desconex') || ultimoNome.includes('desliga')) {
      console.log('  ✅ Detectado DESCONEXÃO no último passo');
      return 'Desconexao';
    }
  }

  // Se não identificou pelo fluxo, verifica o indicador
  const indicador = data.indicador_1 || '';
  console.log('  - Verificando indicador:', indicador);
  for (const [key, node] of Object.entries(INDICATOR_TO_NODE)) {
    if (indicador.toLowerCase().includes(key.toLowerCase())) {
      console.log(`  ✅ Detectado ${key} no indicador → ${node}`);
      return node;
    }
  }

  // Se não encontrar, verifica motivo de finalização
  const motivo = data['Motivo de Finalização do Contato.'] || '';
  console.log('  - Verificando motivo:', motivo);
  if (motivo.toLowerCase().includes('desligou')) {
    console.log('  ⚠️ Detectado "desligou" no motivo → Desconexao (fallback)');
    return 'Desconexao';
  }

  // Padrão: Desconexao (ao invés de FIM_DESCONHECIDO)
  console.log('  ⚠️ Nenhum critério atendido → Desconexao (padrão)');
  return 'Desconexao';
}

/**
 * Gera links para o Sankey a partir dos passos
 */
function gerarLinksSankey(passos, noFim) {
  const links = [];
  const linkMap = new Map();

  console.log('Gerando links para', passos.length, 'passos');

  // Links entre passos
  for (let i = 0; i < passos.length - 1; i++) {
    const source = passos[i].nomeMenu;
    const target = passos[i + 1].nomeMenu;

    // VALIDAÇÃO CRÍTICA: Ignora se source === target (loop)
    if (source === target) {
      console.warn(`Link circular ignorado: ${source} → ${target}`);
      continue;
    }

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
    link.codigosPonto.add(passos[i].codigoPonto);
    if (passos[i + 1].codigoPonto) {
      link.codigosPonto.add(passos[i + 1].codigoPonto);
    }
  }

  // Link do último passo para o nó de fim
  if (passos.length > 0 && noFim) {
    const ultimoPasso = passos[passos.length - 1];
    const linkKey = `${ultimoPasso.nomeMenu}→${noFim}`;

    if (!linkMap.has(linkKey)) {
      linkMap.set(linkKey, {
        source: ultimoPasso.nomeMenu,
        target: noFim,
        value: 0,
        codigosPonto: new Set()
      });
    }

    const link = linkMap.get(linkKey);
    link.value++;
    if (ultimoPasso.codigoPonto) {
      link.codigosPonto.add(ultimoPasso.codigoPonto);
    }
  }

  // Converte Map para Array
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
 * Calcula métricas incluindo dados adicionais
 */
function calcularMetricas(data, passos) {
  const duracao = parseInt(data.qtd_duracao_em_segundos || '0', 10);
  const indicador = data.indicador_1 || '';

  // Extrai ANI (pode vir em diferentes formatos)
  let ani = data.ANI || '';
  if (ani && ani.includes('(')) {
    // Remove o tipo de telefone se presente: +5511996261856 (Land Line)
    ani = ani.split('(')[0].trim();
  }

  const metricas = {
    totalSessoes: 1,
    duracaoMedia: duracao,
    totalPassos: passos.length,
    nomeUra: data.nome_ura || 'Não especificado',
    competencia: data.Competência || data.competencia || 'Não especificado',
    // Novos campos
    idMestre: data['ID Mestre'] || data.ID || 'Não especificado',
    dnis: data.DNIS || 'Não especificado',
    ani: ani || 'Não especificado',
    tipoTelefone: data['Tipo de Telefone'] || 'Não especificado',
    tipoMidia: data['Tipo de Mídia'] || data.Média || 'Não especificado'
  };

  return metricas;
}

/**
 * Função principal - Processa arquivo ContactHistory.txt
 */
export function processarContactHistory(fileContent) {
  try {
    // 1. Parse do arquivo chave-valor
    const data = parseContactHistoryTxt(fileContent);

    // Verifica se tem os campos essenciais
    if (!data.fluxo_1 && !data.ponto_1) {
      throw new Error('Arquivo não contém os campos necessários (fluxo_1, ponto_1)');
    }

    // 2. Sincroniza fluxos com pontos (retorna passos válidos E todos os passos)
    const { passos: passosBrutos, todosPassos } = sincronizarFluxosComPontos(data);

    if (passosBrutos.length === 0) {
      throw new Error('Nenhum passo de navegação válido encontrado');
    }

    // 3. Elimina loops (apenas dos passos válidos, para o Sankey)
    const passos = eliminarLoops(passosBrutos);

    // 4. Gera nó de fim (passa o último passo ANTES de eliminar loops + dados brutos)
    const ultimoPassoOriginal = passosBrutos.length > 0 ? passosBrutos[passosBrutos.length - 1] : null;
    const noFim = gerarNoFim(data, ultimoPassoOriginal);

    // 5. Gera links do Sankey
    const links = gerarLinksSankey(passos, noFim);

    // 6. Extrai nós
    const nodes = extrairNos(links);

    // 7. Calcula métricas
    const metricas = calcularMetricas(data, passos);

    // 8. Converte TODOS os passos para objetos PassoNavegacao (incluindo ignorados)
    const passosNavegacao = todosPassos.map(p =>
      new PassoNavegacao(p.id_ligacao, p.timestamp, p.nomeMenu || '[vazio]', p.codigoPonto, p.tipoServico, p.nomeEvento)
    );

    return {
      success: true,
      data: {
        nodes,
        links,
        metricas,
        passos: passosNavegacao,
        rawData: data // Mantém dados brutos para referência
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
 * Detecta o tipo de arquivo baseado no conteúdo
 */
export function detectFileFormat(fileContent) {
  const firstLines = fileContent.split('\n').slice(0, 5).join('\n');

  // Formato ContactHistory.txt tem campos como "cod_identificacao_ligacao"
  if (firstLines.includes('cod_identificacao_ligacao') ||
      firstLines.includes('fluxo_1') ||
      firstLines.includes('ponto_1') ||
      firstLines.includes('Detalhes do Contato')) {
    return 'contact_history';
  }

  // Formato antigo com pipes
  if (firstLines.includes('|') && firstLines.split('|').length > 3) {
    return 'pipe_separated';
  }

  return 'unknown';
}
