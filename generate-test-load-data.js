import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações
const TOTAL_RECORDS = 600; // Mínimo 500
const DAYS = 3;
const RECORDS_PER_DAY = Math.floor(TOTAL_RECORDS / DAYS);

console.log(`🎯 Gerando ${TOTAL_RECORDS} registros distribuídos em ${DAYS} dias`);
console.log(`📊 Aproximadamente ${RECORDS_PER_DAY} registros por dia\n`);

// Cabeçalhos da planilha (baseado no modelo EXEMPLOS_CHAMADAS_FELIPE.ods)
const headers = [
  'DATA_REF',
  'HORA_REF',
  'DIA_DA_SEMANA',
  'HORA_INTEIRA',
  'COD_IDENTIFICACAO_LIGACAO',
  'NOM_HABILIDADE',
  'ENDERECO_ORIGEM',
  'COD_URA',
  'NOME_URA',
  'EVENTOS',
  'FLUXO',
  'NAVEGACAO',
  'VALIDACAO',
  'ENTRADAS',
  'INDICADOR',
  'DURACAO',
  'IDENTIFICACAO',
  'ULTIMO_PONTO',
  'PRODUTO_DEV',
  'EMPRESA',
  'PRODUTO',
  'PROCESSO',
  'TIPO_SERVICO',
  'TMP_TIMESTAMP',
  'DT_PROCESSAMENTO'
];

// Fluxos de navegação realistas para URA de Seguros e Assistência
const navigationFlows = [
  {
    name: 'Fluxo Sinistro Auto',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|tipo_documento|documento_validado|pf_pj|chamada_api_contratos|sucesso_api|produto_identificado|menu_principal|abertura_sinistro|confirmacao_dados|sinistro_registrado',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Produtos_Dinamico_Cliente|Menu_Principal_Dinamico_Auto|Menu_Sinistro_Auto|Confirmacao_Sinistro',
    navegacao: '10023|10589|50013|10551|15001|15001|10066|10623|10078|10733',
    validacao: '333_Porto|PORTO|Boa_Tarde|Valido|Pessoa_Fisica|Sucesso|Identificado|Auto|Sinistro_Registrado',
    entradas: '|||||||',
    indicador: 'Transferencia',
    duracao: () => Math.floor(Math.random() * 120) + 60, // 60-180 segundos
    produto: '(AUTO):AUTO',
    processo: 'SINISTRO'
  },
  {
    name: 'Fluxo Consulta Apólice Residencial',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|tipo_documento|cpf_cnpj|chamada_api_contratos|sucesso_api|produto_identificado|menu_principal|consulta_apolice|dados_apolice|confirmacao',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Produtos_Dinamico_Cliente|Menu_Principal_Dinamico_Residencial|Menu_Consulta_Apolice|Dados_Apolice',
    navegacao: '10023|10589|50013|10563|15001|15001|10647|10858|10866',
    validacao: '333_Porto|PORTO|Ola|Cpf|Sucesso|Identificado|Residencial|Consulta_Realizada',
    entradas: '|||||',
    indicador: 'Desconexao',
    duracao: () => Math.floor(Math.random() * 80) + 40, // 40-120 segundos
    produto: '(RESIDENCIAL):CASA',
    processo: 'CONSULTA'
  },
  {
    name: 'Fluxo Assistência 24h',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|menu_principal|servico_assistencia|tipo_assistencia|guincho|localizacao_cliente|confirmacao_endereco|assistencia_acionada',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Principal_Dinamico_Auto|Menu_Assistencia_24h|Menu_Tipo_Assistencia|Menu_Guincho|Confirmacao_Localizacao',
    navegacao: '10023|10589|10078|10733|10739|10083|12541',
    validacao: '333_Porto|PORTO|Boa_Noite|Identificado|Assistencia|Guincho|Endereco_Confirmado',
    entradas: '||||||',
    indicador: 'Transferencia',
    duracao: () => Math.floor(Math.random() * 150) + 90, // 90-240 segundos
    produto: '(AUTO):AUTO',
    processo: 'ASSISTENCIA'
  },
  {
    name: 'Fluxo Renovação Seguro Vida',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|tipo_documento|cpf_cnpj|chamada_api|sucesso_api|produto_identificado|menu_renovacao|dados_renovacao|aceite_condicoes|renovacao_confirmada',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Produtos_Dinamico_Cliente|Menu_Renovacao_Vida|Confirmacao_Renovacao',
    navegacao: '10023|10589|50013|10551|15001|10954|10959|10976',
    validacao: '333_Porto|PORTO|Bom_Dia|Cpf|Sucesso|Vida|Renovacao_Aceita',
    entradas: '||||1||',
    indicador: 'Desconexao',
    duracao: () => Math.floor(Math.random() * 100) + 50, // 50-150 segundos
    produto: '(VIDA):VIDA',
    processo: 'RENOVACAO'
  },
  {
    name: 'Fluxo Cotação Seguro Auto',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|menu_principal|nova_cotacao|dados_veiculo|marca_modelo|ano_veiculo|dados_condutor|cep_residencia|calculo_premio|apresentacao_valores',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Menu_Principal|Menu_Cotacao_Auto|Dados_Veiculo|Dados_Condutor|Calculo_Premio|Apresentacao_Valores',
    navegacao: '10023|10078|10733|11014|11016|12001|10619',
    validacao: '333_Porto|PORTO|Boa_Tarde|Cotacao|Dados_Completos|Calculo_Realizado',
    entradas: '||||||',
    indicador: 'Abandono',
    duracao: () => Math.floor(Math.random() * 200) + 120, // 120-320 segundos
    produto: '(AUTO):AUTO',
    processo: 'COTACAO'
  },
  {
    name: 'Fluxo Cancelamento Apólice',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|tipo_documento|cpf_cnpj|chamada_api|sucesso_api|menu_cancelamento|motivo_cancelamento|confirmacao_cancelamento|protocolo_gerado',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Cancelamento|Motivo_Cancelamento|Confirmacao_Cancelamento',
    navegacao: '10023|10589|50013|10551|15001|10627|10629|10633',
    validacao: '333_Porto|PORTO|Bom_Dia|Cpf|Sucesso|Cancelamento|Protocolo_Gerado',
    entradas: '|||2|||',
    indicador: 'Transferencia',
    duracao: () => Math.floor(Math.random() * 90) + 60, // 60-150 segundos
    produto: '(AUTO):AUTO',
    processo: 'CANCELAMENTO'
  },
  {
    name: 'Fluxo Segunda Via Boleto',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|cpf_cnpj|chamada_api|sucesso_api|menu_financeiro|segunda_via_boleto|selecao_fatura|envio_email|confirmacao',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Financeiro|Menu_Segunda_Via|Envio_Email',
    navegacao: '10023|10589|50013|10563|10647|10073|10860',
    validacao: '333_Porto|PORTO|Ola|Cpf|Sucesso|Segunda_Via|Email_Enviado',
    entradas: '|||||',
    indicador: 'Desconexao',
    duracao: () => Math.floor(Math.random() * 70) + 30, // 30-100 segundos
    produto: '(AUTO):AUTO',
    processo: 'FINANCEIRO'
  },
  {
    name: 'Fluxo Informações de Cobertura',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|menu_principal|informacoes_cobertura|tipo_cobertura|detalhes_cobertura|duvidas_esclarecidas',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Principal|Menu_Informacoes|Menu_Cobertura|Detalhes_Cobertura',
    navegacao: '10023|10589|10078|10627|10629|10637',
    validacao: '333_Porto|PORTO|Boa_Tarde|Informacoes|Cobertura|Esclarecido',
    entradas: '||||',
    indicador: 'Desconexao',
    duracao: () => Math.floor(Math.random() * 60) + 40, // 40-100 segundos
    produto: '(RESIDENCIAL):CASA',
    processo: 'INFORMACAO'
  },
  {
    name: 'Fluxo Inclusão Dependente',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|cpf_cnpj|chamada_api|sucesso_api|menu_alteracao|inclusao_dependente|dados_dependente|validacao_dados|dependente_incluido',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_Identificacao_Cliente|Menu_Alteracao_Cadastral|Menu_Inclusao_Dependente|Confirmacao_Inclusao',
    navegacao: '10023|10589|50013|10551|15001|10647|10858',
    validacao: '333_Porto|PORTO|Bom_Dia|Cpf|Sucesso|Dependente|Incluido',
    entradas: '|||||',
    indicador: 'Desconexao',
    duracao: () => Math.floor(Math.random() * 110) + 70, // 70-180 segundos
    produto: '(VIDA):VIDA',
    processo: 'ALTERACAO'
  },
  {
    name: 'Fluxo Abertura SAC',
    eventos: 'inicio_menu|validacao_parametro|origem_identificada|saudacao_porto|identificacao_telefone|menu_sac|tipo_reclamacao|descricao_problema|protocolo_sac|prazo_resposta',
    fluxo: 'Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Menu_SAC|Tipo_Reclamacao|Registro_Protocolo',
    navegacao: '10023|10589|11567|11612|15003',
    validacao: '333_Porto|PORTO|Ola|SAC|Protocolo_Registrado',
    entradas: '||||',
    indicador: 'Transferencia',
    duracao: () => Math.floor(Math.random() * 130) + 80, // 80-210 segundos
    produto: '(AUTO):AUTO',
    processo: 'SAC'
  }
];

// Produtos disponíveis
const produtos = [
  'PORTO/(AUTO):AUTO/SINISTRO',
  'PORTO/(AUTO):AUTO/ASSISTENCIA',
  'PORTO/(AUTO):AUTO/COTACAO',
  'PORTO/(AUTO):AUTO/CONSULTA',
  'PORTO/(RESIDENCIAL):CASA/CONSULTA',
  'PORTO/(RESIDENCIAL):CASA/SINISTRO',
  'PORTO/(VIDA):VIDA/RENOVACAO',
  'PORTO/(VIDA):VIDA/CONSULTA',
  'PORTO/(AUTO):AUTO/CANCELAMENTO',
  'PORTO/(AUTO):AUTO/FINANCEIRO'
];

// Indicadores (destinos finais)
const indicadores = ['Abandono', 'Desconexao', 'Transferencia'];

// Função para gerar número de telefone aleatório
const generatePhone = () => {
  const ddd = ['011', '021', '031', '041', '051', '061', '071', '081', '091'];
  const randomDDD = ddd[Math.floor(Math.random() * ddd.length)];
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `+55${randomDDD}${number}`;
};

// Função para gerar ID de chamada único
const generateCallId = (index) => {
  const timestamp = Date.now();
  return `${timestamp}${String(index).padStart(6, '0')}`;
};

// Função para converter data para formato Excel (serial date)
const dateToExcelSerial = (date) => {
  const epoch = new Date(1899, 11, 30);
  const msPerDay = 86400000;
  return (date - epoch) / msPerDay;
};

// Função para converter hora para fração decimal
const timeToDecimal = (hours, minutes, seconds) => {
  return (hours + minutes / 60 + seconds / 3600) / 24;
};

// Função para gerar timestamp formatado
const generateTimestamps = (baseDate, events) => {
  const timestamps = [];
  let currentTime = new Date(baseDate);

  // Número de eventos (aproximado pela quantidade de pipes no campo EVENTOS)
  const eventCount = events.split('|').length;

  for (let i = 0; i < eventCount; i++) {
    // Adiciona entre 1-5 segundos entre cada evento
    currentTime = new Date(currentTime.getTime() + (Math.random() * 4000 + 1000));
    const formatted = `${String(currentTime.getDate()).padStart(2, '0')}/${String(currentTime.getMonth() + 1).padStart(2, '0')}/${currentTime.getFullYear()} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
    timestamps.push(formatted);
  }

  return timestamps.join('|');
};

// Data base (01/12/2025)
const baseDate = new Date(2025, 11, 1); // Mês 11 = Dezembro

// Gera registros
const data = [headers];
let recordIndex = 0;

for (let day = 0; day < DAYS; day++) {
  const currentDate = new Date(baseDate);
  currentDate.setDate(baseDate.getDate() + day);

  const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
  const dateSerial = dateToExcelSerial(currentDate);

  console.log(`📅 Dia ${day + 1}: ${currentDate.toLocaleDateString('pt-BR')} (${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek]})`);

  // Distribui registros ao longo do dia (horário comercial: 8h-20h)
  for (let i = 0; i < RECORDS_PER_DAY; i++) {
    // Gera horário aleatório entre 8h e 20h
    const hour = Math.floor(Math.random() * 12) + 8; // 8-19h
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);

    const timeDecimal = timeToDecimal(hour, minute, second);

    // Seleciona fluxo aleatório com peso (alguns fluxos mais comuns)
    const flowWeights = [0.25, 0.20, 0.15, 0.10, 0.10, 0.08, 0.05, 0.04, 0.02, 0.01];
    const random = Math.random();
    let flowIndex = 0;
    let cumulative = 0;

    for (let j = 0; j < flowWeights.length; j++) {
      cumulative += flowWeights[j];
      if (random <= cumulative) {
        flowIndex = j;
        break;
      }
    }

    const flow = navigationFlows[flowIndex];
    const duracao = flow.duracao();

    // Cria data/hora completa para timestamps
    const callDateTime = new Date(currentDate);
    callDateTime.setHours(hour, minute, second, 0);

    const timestamps = generateTimestamps(callDateTime, flow.eventos);

    // Seleciona produto baseado no fluxo
    let selectedProduct = produtos[Math.floor(Math.random() * produtos.length)];
    if (flow.produto) {
      const matchingProducts = produtos.filter(p => p.includes(flow.produto));
      if (matchingProducts.length > 0) {
        selectedProduct = matchingProducts[Math.floor(Math.random() * matchingProducts.length)];
      }
    }

    const [empresa, produto, processo] = selectedProduct.split('/');

    // Seleciona indicador (com peso: 50% Desconexao, 30% Transferencia, 20% Abandono)
    let indicador;
    const indicadorRandom = Math.random();
    if (indicadorRandom < 0.5) {
      indicador = 'Desconexao';
    } else if (indicadorRandom < 0.8) {
      indicador = 'Transferencia';
    } else {
      indicador = 'Abandono';
    }

    // Se o fluxo tem indicador específico, usa ele
    if (flow.indicador) {
      indicador = flow.indicador;
    }

    const record = [
      dateSerial, // DATA_REF
      timeDecimal, // HORA_REF
      dayOfWeek, // DIA_DA_SEMANA
      hour, // HORA_INTEIRA
      generateCallId(recordIndex), // COD_IDENTIFICACAO_LIGACAO
      'URA_SEG_E_ASSIST_PORTO', // NOM_HABILIDADE
      generatePhone(), // ENDERECO_ORIGEM
      '7', // COD_URA
      'Seguros_Assistencia', // NOME_URA
      flow.eventos, // EVENTOS
      flow.fluxo, // FLUXO
      flow.navegacao, // NAVEGACAO
      flow.validacao, // VALIDACAO
      flow.entradas, // ENTRADAS
      indicador, // INDICADOR
      duracao, // DURACAO
      `014XXXXXXXX`, // IDENTIFICACAO
      flow.navegacao.split('|').slice(-1)[0], // ULTIMO_PONTO
      selectedProduct, // PRODUTO_DEV
      empresa, // EMPRESA
      produto, // PRODUTO
      processo, // PROCESSO
      '', // TIPO_SERVICO
      timestamps, // TMP_TIMESTAMP
      dateToExcelSerial(new Date()) // DT_PROCESSAMENTO (data atual)
    ];

    data.push(record);
    recordIndex++;
  }

  console.log(`   ✅ ${RECORDS_PER_DAY} registros gerados`);
}

// Adiciona registros extras se necessário para atingir o total
const remaining = TOTAL_RECORDS - recordIndex;
if (remaining > 0) {
  console.log(`\n📊 Adicionando ${remaining} registros extras para atingir ${TOTAL_RECORDS} total...`);

  for (let i = 0; i < remaining; i++) {
    // Usa dia aleatório
    const randomDay = Math.floor(Math.random() * DAYS);
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + randomDay);

    const dayOfWeek = currentDate.getDay();
    const dateSerial = dateToExcelSerial(currentDate);

    const hour = Math.floor(Math.random() * 12) + 8;
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const timeDecimal = timeToDecimal(hour, minute, second);

    const flow = navigationFlows[Math.floor(Math.random() * navigationFlows.length)];
    const duracao = flow.duracao();

    const callDateTime = new Date(currentDate);
    callDateTime.setHours(hour, minute, second, 0);
    const timestamps = generateTimestamps(callDateTime, flow.eventos);

    const selectedProduct = produtos[Math.floor(Math.random() * produtos.length)];
    const [empresa, produto, processo] = selectedProduct.split('/');

    const indicadorRandom = Math.random();
    const indicador = indicadorRandom < 0.5 ? 'Desconexao' : (indicadorRandom < 0.8 ? 'Transferencia' : 'Abandono');

    const record = [
      dateSerial,
      timeDecimal,
      dayOfWeek,
      hour,
      generateCallId(recordIndex),
      'URA_SEG_E_ASSIST_PORTO',
      generatePhone(),
      '7',
      'Seguros_Assistencia',
      flow.eventos,
      flow.fluxo,
      flow.navegacao,
      flow.validacao,
      flow.entradas,
      indicador,
      duracao,
      `014XXXXXXXX`,
      flow.navegacao.split('|').slice(-1)[0],
      selectedProduct,
      empresa,
      produto,
      processo,
      '',
      timestamps,
      dateToExcelSerial(new Date())
    ];

    data.push(record);
    recordIndex++;
  }
}

console.log(`\n✅ Total de registros gerados: ${recordIndex}`);
console.log(`📊 Distribuição por indicador:`);

// Conta indicadores
const indicadorCount = { Abandono: 0, Desconexao: 0, Transferencia: 0 };
data.slice(1).forEach(row => {
  const ind = row[14]; // Coluna INDICADOR
  if (indicadorCount[ind] !== undefined) {
    indicadorCount[ind]++;
  }
});

console.log(`   • Abandono: ${indicadorCount.Abandono} (${(indicadorCount.Abandono / recordIndex * 100).toFixed(1)}%)`);
console.log(`   • Desconexão: ${indicadorCount.Desconexao} (${(indicadorCount.Desconexao / recordIndex * 100).toFixed(1)}%)`);
console.log(`   • Transferência: ${indicadorCount.Transferencia} (${(indicadorCount.Transferencia / recordIndex * 100).toFixed(1)}%)`);

// Cria workbook e salva
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);

XLSX.utils.book_append_sheet(workbook, worksheet, 'CHAMADAS_TESTE');

const outputFile = join(__dirname, 'mock', 'TESTE_CARGA_600_REGISTROS.ods');
XLSX.writeFile(workbook, outputFile, { bookType: 'ods' });

console.log(`\n💾 Arquivo salvo: ${outputFile}`);
console.log(`✅ Teste de carga gerado com sucesso!\n`);
