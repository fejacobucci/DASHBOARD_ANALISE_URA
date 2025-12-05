// Arquivo de teste para debug do parser
import { processarContactHistory, detectFileFormat } from './contactHistoryParser.js';

// Dados de exemplo do ContactHistory.txt
const sampleData = `Detalhes do Contato
ID	688670357120	ID Mestre	688670357120
Média	Telefone	DNIS	+551131448400
Competência	URA_SEG_E_ASSIST_PORTO	ANI	+5511996261856 (Land Line)
cod_identificacao_ligacao	688670357120
data_hora_inicio_ligacao	27/11/2025 20:26:42
fluxo_1	Inicio_Ura_Seguros_Assistencias|Modulo_Dial_My_App|Inicio_Ura_Seguros_Assistencias|Roteador_Unico_Lacunas|Inicio_Ura_Seguros_Assistencias|Identificacao_Telefone|Inicio_Identificacao_Publico||
ponto_1	10023|10583|10589|10601|10611|11769|24501|24502|24534|
timestamp_1	27/11/2025 20:26:44|27/11/2025 20:26:44|27/11/2025 20:26:44|
qtd_duracao_em_segundos	31
indicador_1	Abandono
nome_ura	Seguros_Assistencia`;

console.log('=== TESTE DO PARSER ===');
console.log('1. Detectando formato...');
const formato = detectFileFormat(sampleData);
console.log('Formato detectado:', formato);

console.log('\n2. Processando dados...');
const resultado = processarContactHistory(sampleData);
console.log('Resultado:', JSON.stringify(resultado, null, 2));

export { sampleData };
