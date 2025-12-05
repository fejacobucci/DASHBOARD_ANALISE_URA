# 📄 Formato ContactHistory.txt

## Visão Geral

O formato ContactHistory.txt é um arquivo estruturado em chave-valor que contém informações detalhadas sobre uma única ligação de URA. O ETL foi adaptado para processar automaticamente este formato.

---

## 🔍 Detecção Automática

O sistema detecta automaticamente o formato do arquivo baseado no conteúdo:

- **ContactHistory.txt**: Detecta pela presença de campos como `cod_identificacao_ligacao`, `fluxo_1`, `ponto_1`
- **Pipe-separated**: Formato antigo com separador `|`

**Não é necessário selecionar o formato manualmente!**

---

## 📊 Estrutura do Arquivo

### Formato Geral

```
Campo1	Valor1	Campo2	Valor2
Campo3	Valor3
...
```

- Separador entre campo e valor: **TAB** (`\t`)
- Valores múltiplos dentro de um campo: **PIPE** (`|`)

---

## 🎯 Campos Utilizados pelo ETL

### 1️⃣ **Identificação** (OBRIGATÓRIO)

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| `cod_identificacao_ligacao` | 688670357120 | ID único da ligação |
| `ID` | 688670357120 | Alternativa ao cod_identificacao_ligacao |

**Uso:** Identifica unicamente cada sessão

---

### 2️⃣ **Timestamp** (OBRIGATÓRIO)

| Campo | Exemplo | Formato | Descrição |
|-------|---------|---------|-----------|
| `data_hora_inicio_ligacao` | 27/11/2025 20:26:42 | DD/MM/YYYY HH:mm:ss | Início da ligação |
| `timestamp_1` | 27/11/2025 20:26:44\|27/11/2025 20:26:44\|... | DD/MM/YYYY HH:mm:ss | Timestamp de cada passo |

**Conversão automática:** O ETL converte para formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)

---

### 3️⃣ **Navegação** (OBRIGATÓRIO) ⭐

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| `fluxo_1` | Inicio_Ura_Seguros_Assistencias\|Modulo_Dial_My_App\|... | **Nomes dos menus navegados** |
| `ponto_1` | 10023\|10583\|10589\|... | **Códigos dos pontos de marcação** |

**Regras aplicadas:**
- ✅ Primeiro fluxo deve começar com `Inicio_`
- ✅ Loops consecutivos são eliminados automaticamente
- ✅ Fluxos com ruído são descartados (Else, Silencio, etc.)

---

### 4️⃣ **Resultado Final** (OBRIGATÓRIO)

| Campo | Exemplo | Valores Possíveis | Nó Gerado |
|-------|---------|-------------------|-----------|
| `indicador_1` | Abandono | Abandono, Transferencia, Desconexao, Finalizacao | FIM_ABANDONO, Transferencia, Desconexao, Finalizacao |

**Mapeamento:**
- `Abandono` → `FIM_ABANDONO`
- `Transferencia` → `Transferencia`
- `Desconexao` → `Desconexao`
- `Finalizacao` → `Finalizacao`

---

### 5️⃣ **Duração** (OBRIGATÓRIO)

| Campo | Exemplo | Unidade | Descrição |
|-------|---------|---------|-----------|
| `qtd_duracao_em_segundos` | 31 | Segundos | Duração total da ligação |
| `Duração` | 0:31 | mm:ss | Formato alternativo |

**Uso:** Cálculo da métrica "Duração Média"

---

### 6️⃣ **Metadados** (OPCIONAL)

| Campo | Exemplo | Uso |
|-------|---------|-----|
| `nome_ura` | Seguros_Assistencia | Nome da URA |
| `Competência` | URA_SEG_E_ASSIST_PORTO | Tipo de URA |
| `id_ura` | 7 | ID numérico da URA |
| `produto_1` | PORTO//NAO_DEFINIDO | Produto relacionado |
| `ANI` | +5511996261856 | Número do cliente |
| `DNIS` | +551131448400 | Número discado |

---

## 🔧 Processamento ETL

### Fluxo de Processamento

```
1. Detecção de Formato
   ↓
2. Parse Chave-Valor (separação por TAB)
   ↓
3. Extração de fluxo_1 e ponto_1 (separação por PIPE)
   ↓
4. Sincronização de Fluxos com Pontos
   ↓
5. Eliminação de Loops Consecutivos
   ↓
6. Geração de Nó de Fim (baseado em indicador_1)
   ↓
7. Criação de Links do Sankey
   ↓
8. Cálculo de Métricas
   ↓
9. Retorno de Dados Estruturados
```

---

## 📋 Regras Aplicadas

### ✅ **Regra 1: Sincronização Fluxos × Pontos**

O ETL sincroniza as listas paralelas:

```javascript
fluxo_1:  Inicio_Ura | Modulo_Dial_My_App | Roteador_Unico_Lacunas
ponto_1:  10023       | 10583              | 10589

// Resultado:
Passo 1: Inicio_Ura → ponto 10023
Passo 2: Modulo_Dial_My_App → ponto 10583
Passo 3: Roteador_Unico_Lacunas → ponto 10589
```

**Observação:** Se houver mais pontos que fluxos, os pontos extras são associados ao último fluxo válido.

---

### ✅ **Regra 2: Eliminação de Loops**

Loops consecutivos são automaticamente removidos:

```javascript
// Entrada:
Inicio_Ura → Modulo → Inicio_Ura → Roteador

// Saída (após eliminação):
Inicio_Ura → Modulo → Roteador
```

---

### ✅ **Regra 3: Limpeza de Ruído**

Fluxos e eventos contendo ruído são descartados:

**Palavras-chave de ruído:**
- `Else`
- `Else_Invalido`
- `Silencio`
- `Menu_Chutes`
- `Erro`
- `Timeout`

---

### ✅ **Regra 4: Nó de Início**

Apenas a **primeira ocorrência** de um nó começando com `Inicio_` é considerada o nó de início.

Repetições subsequentes são tratadas como loops e eliminadas.

---

### ✅ **Regra 5: Nó de Fim**

O último nó é determinado pelo campo `indicador_1`:

| Indicador | Nó de Fim |
|-----------|-----------|
| Abandono | FIM_ABANDONO |
| Transferencia | Transferencia |
| Desconexao | Desconexao |
| Finalizacao | Finalizacao |
| (vazio/outro) | FIM_DESCONHECIDO |

---

## 📊 Dados Gerados para Visualização

### Nodes (Nós do Sankey)

```json
[
  { "name": "Inicio_Ura_Seguros_Assistencias" },
  { "name": "Modulo_Dial_My_App" },
  { "name": "Roteador_Unico_Lacunas" },
  { "name": "Identificacao_Telefone" },
  { "name": "Inicio_Identificacao_Publico" },
  { "name": "FIM_ABANDONO" }
]
```

### Links (Fluxos)

```json
[
  {
    "source": "Inicio_Ura_Seguros_Assistencias",
    "target": "Modulo_Dial_My_App",
    "value": 1,
    "codigosPonto": ["10023", "10583"]
  },
  // ... mais links
]
```

### Métricas (KPIs)

```json
{
  "totalSessoes": 1,
  "duracaoMedia": 31,
  "taxaTransferencia": 0,
  "taxaAbandono": 100,
  "totalPassos": 5,
  "nomeUra": "Seguros_Assistencia",
  "competencia": "URA_SEG_E_ASSIST_PORTO"
}
```

### Passos (Drill-Down)

```json
[
  {
    "id_ligacao": "688670357120",
    "timestamp": "2025-11-27T20:26:44",
    "nomeMenu": "Inicio_Ura_Seguros_Assistencias",
    "codigoPonto": "10023"
  },
  // ... mais passos
]
```

---

## 🧪 Como Testar

### 1. Inicie o servidor (se não estiver rodando)

```bash
npm run dev
```

### 2. Acesse o dashboard

Abra http://localhost:3000

### 3. Carregue o arquivo

Arraste e solte: `mock/ContactHistory.txt`

### 4. Visualize o resultado

- **Métricas no topo**: Total de Sessões, Duração Média, etc.
- **Sankey no centro**: Fluxo de navegação visual
- **Drill-down**: Clique em qualquer nó para ver detalhes

---

## ⚠️ Troubleshooting

### Problema: "Arquivo não contém os campos necessários"

**Causa:** O arquivo não tem `fluxo_1` ou `ponto_1`

**Solução:** Verifique se o arquivo é um ContactHistory.txt válido

### Problema: "Nenhum passo de navegação válido encontrado"

**Causa:** Todos os fluxos foram descartados como ruído

**Solução:** Verifique se os nomes dos menus não contêm palavras-chave de ruído

### Problema: Sankey não aparece

**Causa:** Menos de 2 nós válidos

**Solução:** Verifique se há pelo menos 2 passos de navegação no arquivo

---

## 🔄 Compatibilidade

O ETL continua suportando o **formato antigo** (pipe-separated):

```
id_ligacao|timestamp|fluxo_1|ponto_1|fluxo_2|ponto_2|...
```

A detecção é automática, então você pode usar ambos os formatos sem configuração adicional.

---

## 📝 Exemplo Completo

Veja o arquivo de exemplo: `mock/ContactHistory.txt`

Este arquivo contém uma ligação completa com todos os campos necessários para processamento e visualização.

---

## 🚀 Próximas Evoluções

Futuras melhorias planejadas:
- [ ] Suporte a múltiplas ligações em um único arquivo
- [ ] Agregação de métricas por URA/Competência
- [ ] Filtros por período/tipo
- [ ] Exportação de dados processados

---

**Processamento automático • Detecção inteligente • Visualização imediata**
