import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lê o arquivo ODS original
const inputFile = join(__dirname, 'mock', 'EXEMPLOS_CHAMADAS_FELIPE.ods');
const outputFile = join(__dirname, 'mock', 'EXEMPLOS_CHAMADAS_FELIPE_3DIAS.ods');

console.log('📂 Lendo arquivo original:', inputFile);

const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Converte para JSON
const originalData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`📊 Dados originais: ${originalData.length} linhas`);
console.log('🔍 Primeiras linhas:', originalData.slice(0, 3));

// Função para adicionar dias a uma data
const addDays = (dateStr, days) => {
  if (!dateStr) return dateStr;

  // Tenta diferentes formatos de data
  let date;

  // Formato: DD/MM/YYYY HH:MM:SS
  if (dateStr.includes('/') && dateStr.includes(':')) {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    date = new Date(year, month - 1, day);

    if (!isNaN(date.getTime())) {
      date.setDate(date.getDate() + days);
      const newDay = String(date.getDate()).padStart(2, '0');
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      const newYear = date.getFullYear();
      return `${newDay}/${newMonth}/${newYear} ${timePart}`;
    }
  }

  // Formato: YYYY-MM-DD HH:MM:SS
  if (dateStr.includes('-') && dateStr.includes(':')) {
    date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  return dateStr;
};

// Função para adicionar variação aleatória ao horário (±30 minutos)
const addRandomTimeVariation = (dateStr) => {
  if (!dateStr || !dateStr.includes(':')) return dateStr;

  const [datePart, timePart] = dateStr.split(' ');
  if (!timePart) return dateStr;

  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Adiciona variação de -30 a +30 minutos
  const variation = Math.floor(Math.random() * 61) - 30;
  let newMinutes = minutes + variation;
  let newHours = hours;

  if (newMinutes < 0) {
    newMinutes += 60;
    newHours -= 1;
  } else if (newMinutes >= 60) {
    newMinutes -= 60;
    newHours += 1;
  }

  if (newHours < 0) newHours = 0;
  if (newHours > 23) newHours = 23;

  const newTimePart = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${datePart} ${newTimePart}`;
};

// Função para gerar variação em IDs
const generateNewId = (originalId, suffix) => {
  if (!originalId) return originalId;

  // Se for número, adiciona o sufixo
  if (!isNaN(originalId)) {
    return `${originalId}${suffix}`;
  }

  // Se for string que termina com número, incrementa
  const match = String(originalId).match(/^(.+?)(\d+)$/);
  if (match) {
    const base = match[1];
    const num = parseInt(match[2]);
    return `${base}${num + suffix}`;
  }

  return `${originalId}_${suffix}`;
};

// Separa cabeçalho dos dados
const headers = originalData[0];
const dataRows = originalData.slice(1);

console.log(`📋 Cabeçalhos: ${headers.join(', ')}`);
console.log(`📝 Linhas de dados: ${dataRows.length}`);

// Identifica colunas de data (procura por padrões comuns)
const dateColumnIndices = [];
headers.forEach((header, index) => {
  const headerLower = String(header).toLowerCase();
  if (headerLower.includes('data') ||
      headerLower.includes('timestamp') ||
      headerLower.includes('hora') ||
      headerLower.includes('date') ||
      headerLower.includes('time')) {
    dateColumnIndices.push(index);
    console.log(`📅 Coluna de data identificada: ${header} (índice ${index})`);
  }
});

// Identifica colunas de ID
const idColumnIndices = [];
headers.forEach((header, index) => {
  const headerLower = String(header).toLowerCase();
  if (headerLower.includes('id') ||
      headerLower.includes('codigo') ||
      headerLower.includes('chave')) {
    idColumnIndices.push(index);
    console.log(`🔑 Coluna de ID identificada: ${header} (índice ${index})`);
  }
});

// Gera dados para 3 dias
const expandedData = [headers]; // Começa com cabeçalho

// Dia 1: dados originais com pequenas variações
console.log('\n📅 Gerando Dia 1...');
dataRows.forEach(row => {
  const newRow = [...row];

  // Adiciona pequena variação no horário
  dateColumnIndices.forEach(colIndex => {
    if (newRow[colIndex]) {
      newRow[colIndex] = addRandomTimeVariation(String(newRow[colIndex]));
    }
  });

  expandedData.push(newRow);
});

// Dia 2: dados originais + 1 dia
console.log('📅 Gerando Dia 2...');
dataRows.forEach(row => {
  const newRow = [...row];

  // Atualiza datas
  dateColumnIndices.forEach(colIndex => {
    if (newRow[colIndex]) {
      newRow[colIndex] = addDays(String(newRow[colIndex]), 1);
      newRow[colIndex] = addRandomTimeVariation(newRow[colIndex]);
    }
  });

  // Atualiza IDs
  idColumnIndices.forEach(colIndex => {
    if (newRow[colIndex]) {
      newRow[colIndex] = generateNewId(newRow[colIndex], 1000);
    }
  });

  expandedData.push(newRow);
});

// Dia 3: dados originais + 2 dias
console.log('📅 Gerando Dia 3...');
dataRows.forEach(row => {
  const newRow = [...row];

  // Atualiza datas
  dateColumnIndices.forEach(colIndex => {
    if (newRow[colIndex]) {
      newRow[colIndex] = addDays(String(newRow[colIndex]), 2);
      newRow[colIndex] = addRandomTimeVariation(newRow[colIndex]);
    }
  });

  // Atualiza IDs
  idColumnIndices.forEach(colIndex => {
    if (newRow[colIndex]) {
      newRow[colIndex] = generateNewId(newRow[colIndex], 2000);
    }
  });

  expandedData.push(newRow);
});

console.log(`\n✅ Total de linhas geradas: ${expandedData.length} (incluindo cabeçalho)`);
console.log(`📊 Dados originais: ${dataRows.length} linhas`);
console.log(`📊 Dados expandidos: ${expandedData.length - 1} linhas`);
console.log(`📈 Fator de expansão: ${((expandedData.length - 1) / dataRows.length).toFixed(1)}x`);

// Cria novo workbook
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.aoa_to_sheet(expandedData);

// Adiciona a planilha
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

// Salva arquivo
console.log('\n💾 Salvando arquivo:', outputFile);
XLSX.writeFile(newWorkbook, outputFile, { bookType: 'ods' });

console.log('✅ Arquivo gerado com sucesso!');
console.log(`📁 Localização: ${outputFile}`);
console.log('\n🔍 Primeiras linhas do arquivo expandido:');
console.log(expandedData.slice(0, 5).map((row, i) => `  ${i}: ${row.slice(0, 3).join(' | ')}`).join('\n'));
