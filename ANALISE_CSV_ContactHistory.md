# 📊 Análise do CSV ContactHistory.csv

## 📁 Estrutura do Arquivo

### Dados Identificados

**Total de registros:** 1 (+ cabeçalho)

### Colunas Disponíveis

| Coluna | Valor de Exemplo | Tipo | Relevância Sankey |
|--------|------------------|------|-------------------|
| **ID do Contato** | 688670357120 | Identificador | ✅ **Alto** - ID único da ligação |
| **ID de Contato Master** | 688670357120 | Identificador | 🟡 Médio - Agrupamento |
| **Tipo de Mídia** | Phone | Categórico | 🟡 Médio - Filtro/Segmentação |
| **Competência** | URA_SEG_E_ASSIST_PORTO | Categórico | ✅ **Alto** - Identificador de URA |
| **Agente** | (vazio) | String | ❌ Baixo - Indica URA sem transferência |
| **Time** | (vazio) | String | ❌ Baixo |
| **DNIS/Para** | +551131448400 | Telefone | 🟡 Médio - Número discado |
| **ANI/De** | +5511996261856 | Telefone | 🟡 Médio - Número do cliente |
| **Tipo de Telefone** | Land Line | Categórico | 🟡 Médio - Perfil do cliente |
| **Hora de Início:** | 27/11/2025 20:26:42 | DateTime | ✅ **Alto** - Timestamp |
| **Duração** | 0:31 | Time | ✅ **Alto** - Métrica KPI |
| **Registrado** | (vazio) | Boolean? | ❌ Baixo |
| **Disposição Primária** | (vazio) | String | ⚠️ **CRÍTICO** - Deveria ter o resultado |
| **Disposição Adicional** | "" | String | 🟡 Médio - Info complementar |

---

## 🚨 Problemas Identificados

### ❌ **PROBLEMA CRÍTICO: Falta de Dados de Navegação**

O CSV atual **NÃO possui** as colunas necessárias para construir o fluxo Sankey:

**Colunas Ausentes:**
- ❌ `fluxo_1`, `fluxo_2`, `fluxo_3`, ... (Nome dos menus navegados)
- ❌ `ponto_1`, `ponto_2`, `ponto_3`, ... (Códigos dos pontos de marcação)
- ❌ Sequência de navegação da URA

**O que temos:**
- ✅ ID da ligação
- ✅ Timestamp
- ✅ Duração
- ✅ Identificador da URA (Competência)

**O que NÃO temos:**
- ❌ Por quais menus o cliente navegou
- ❌ Qual foi a sequência de passos
- ❌ Onde a ligação terminou (Transferência, Desconexão, etc.)

---

## 🔍 Comparação com Formato Esperado

### Formato Esperado (conforme regras)

```
cod_identificacao_ligacao|timestamp|fluxo_1|ponto_1|fluxo_2|ponto_2|fluxo_3|ponto_3|...
688670360266|2024-11-27T20:26:42|Inicio_Ura_Seguros_Assistencias|10023|Modulo_Dial_My_App|10583|Menu_Principal|10584|Transferencia|10999
```

### Formato Atual (ContactHistory.csv)

```csv
ID do Contato,Competência,Hora de Início,Duração,...
688670357120,URA_SEG_E_ASSIST_PORTO,27/11/2025 20:26:42,0:31,...
```

---

## 📋 Informações Extraíveis do CSV Atual

### ✅ Métricas que PODEM ser calculadas:

1. **Total de Chamadas**
   - Contar registros únicos por `ID do Contato`

2. **Duração Média das Ligações**
   - Média da coluna `Duração`

3. **Distribuição por Tipo de Mídia**
   - Agrupamento por `Tipo de Mídia` (Phone, Email, Chat, etc.)

4. **Volume por URA/Competência**
   - Agrupamento por `Competência` (URA_SEG_E_ASSIST_PORTO, etc.)

5. **Distribuição por Tipo de Telefone**
   - Análise por `Tipo de Telefone` (Land Line, Mobile, etc.)

6. **Horários de Pico**
   - Análise temporal da coluna `Hora de Início`

### ❌ O que NÃO PODE ser feito:

1. **Gráfico Sankey de Navegação**
   - Não há dados de fluxo/navegação

2. **Análise de Caminhos**
   - Não sabemos por onde o cliente passou

3. **Drill-down por Menu**
   - Não há menus registrados

4. **Taxa de Abandono/Transferência**
   - Não há informação de resultado final (a menos que esteja em outra tabela)

5. **Pontos de Marcação**
   - Não há códigos de ponto

---

## 🎯 Dados Necessários para o Sankey

Segundo as **Regras de Tratamento de Dados**, precisamos de:

### 1️⃣ **Nós de Início (Source)**
- Campo: `fluxo_1` começando com `Inicio_`
- Exemplo: `Inicio_Ura_Seguros_Assistencias`
- **Status atual:** ❌ Não disponível

### 2️⃣ **Nós de Fluxo (Caminhos)**
- Campos: `fluxo_2`, `fluxo_3`, `fluxo_4`, ...
- Exemplo: `Menu_Produtos_Dinamico_Cliente`, `Menu_Cancelamento_Servicos`
- **Status atual:** ❌ Não disponível

### 3️⃣ **Nós de Fim (Target)**
- Último fluxo: `Desconexao`, `Finalizacao`, `Transferencia`
- Ou criar: `FIM_ABANDONO` para saídas intermediárias
- **Status atual:** ❌ Não disponível

### 4️⃣ **Pontos de Marcação**
- Campos: `ponto_1`, `ponto_2`, `ponto_3`, ...
- Para drill-down e análise granular
- **Status atual:** ❌ Não disponível

---

## 💡 Possíveis Soluções

### Opção 1: **Obter Dados Completos de Navegação**

O CSV precisa ser exportado com colunas adicionais contendo:
- Sequência completa de navegação (fluxos)
- Códigos de pontos correspondentes
- Resultado final da ligação

**Pergunte ao sistema de origem:**
- Há um relatório de "Contact Flow" ou "Navigation History"?
- O sistema registra os passos da URA em outra tabela?
- É possível exportar logs detalhados da navegação?

### Opção 2: **Usar o Campo "Competência" como Proxy**

**Criar visualização limitada:**
- Usar `Competência` como único nó de navegação
- Criar fluxo: `INICIO → [Competência] → [Resultado]`
- Analisar volume por URA

**Limitações:**
- Não mostra navegação interna
- Não permite drill-down detalhado
- Sankey muito simplificado

### Opção 3: **Complementar com Outra Fonte de Dados**

Se o sistema tiver:
- **Tabela de Events/Logs**: Com eventos de navegação
- **Tabela de Call Details**: Com detalhamento de passos
- **API de Histórico**: Que retorna a jornada completa

Fazer JOIN entre:
- `ContactHistory.csv` (dados gerais)
- + Tabela de navegação (fluxos e pontos)

---

## 📝 Mapeamento Sugerido (se houver dados de navegação)

| Campo CSV | Campo Esperado | Transformação |
|-----------|---------------|---------------|
| ID do Contato | `cod_identificacao_ligacao` | Direto |
| Hora de Início | `timestamp` | Converter formato (DD/MM/YYYY HH:mm:ss → ISO 8601) |
| [NOVO] Passo_1 | `fluxo_1` | Extrair da navegação |
| [NOVO] Codigo_1 | `ponto_1` | Extrair da navegação |
| [NOVO] Passo_2 | `fluxo_2` | Extrair da navegação |
| [NOVO] Codigo_2 | `ponto_2` | Extrair da navegação |
| ... | ... | ... |
| Competência | `ura_type` (novo campo) | Para filtros/agrupamento |
| Duração | `duracao` | Para KPIs |

---

## 🎨 Visualizações Alternativas (com dados atuais)

Enquanto não temos os dados de navegação, podemos criar:

### 1. **Dashboard de Volume**
- Total de chamadas
- Duração média
- Distribuição por horário
- Distribuição por tipo de telefone

### 2. **Sankey Simplificado por URA**
```
TODAS_CHAMADAS → URA_SEG_E_ASSIST_PORTO → [Resultado]
                → URA_VENDAS → [Resultado]
                → URA_SAC → [Resultado]
```

### 3. **Análise Temporal**
- Gráfico de linha: Chamadas por hora/dia
- Heatmap: Volume por dia da semana vs hora

---

## ✅ Próximos Passos Recomendados

1. **Verificar se há dados de navegação em outro arquivo/tabela**
   - Procurar por "Call Flow", "IVR Logs", "Navigation Events"

2. **Solicitar exportação completa**
   - Com colunas de fluxo e pontos de marcação
   - Incluir resultado final da ligação

3. **Se não houver dados de navegação:**
   - Implementar logging no sistema de URA
   - Ou criar dashboard simplificado com dados atuais

4. **Validar estrutura de dados**
   - Confirmar se 1 linha = 1 ligação completa
   - Ou se múltiplas linhas = eventos da mesma ligação

---

## 🔧 Ação Imediata

**Pergunta para você:**

Você tem acesso a:
- [ ] Outro arquivo CSV com dados de navegação?
- [ ] Tabela de eventos/logs da URA?
- [ ] Possibilidade de exportar relatório mais detalhado?
- [ ] Documentação do sistema de URA sobre campos disponíveis?

Sem os dados de fluxo, **não é possível construir o Sankey conforme especificado nas regras**.
