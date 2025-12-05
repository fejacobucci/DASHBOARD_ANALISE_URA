# 📊 Análise Detalhada do ContactHistory.txt

## ✅ DADOS ENCONTRADOS PARA CONSTRUÇÃO DO SANKEY!

---

## 📁 Estrutura do Arquivo

**Formato:** Chave-Valor estruturado
**Registros:** 1 ligação completa
**Separador de valores múltiplos:** Pipe `|`

---

## 🎯 Campos Identificados e Mapeamento para Sankey

### 1️⃣ **IDENTIFICAÇÃO DA LIGAÇÃO**

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `cod_identificacao_ligacao` | 688670357120 | ID único da sessão | ✅ **CRÍTICO** |
| `ID` | 688670357120 | Mesmo ID | ✅ Alto |
| `ID Mestre` | 688670357120 | Agrupamento | 🟡 Médio |

**Uso:** Identificador único para agrupar todos os passos de uma ligação.

---

### 2️⃣ **TIMESTAMP E DURAÇÃO**

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `data_hora_inicio_ligacao` | 27/11/2025 20:26:42 | Timestamp principal | ✅ **CRÍTICO** |
| `timestamp_1` | 27/11/2025 20:26:44\|27/11/2025 20:26:44\|... | Timestamps de cada passo | ✅ **CRÍTICO** |
| `timestamp_2` | 27/11/2025 20:26:52\|... | Timestamps adicionais | ✅ Alto |
| `qtd_duracao_em_segundos` | 31 | Duração total (KPI) | ✅ **CRÍTICO** |
| `Duração` | 0:31 | Duração formatada | ✅ Alto |

**Uso:**
- Ordenar passos cronologicamente
- Calcular duração média (KPI)
- Análise temporal

---

### 3️⃣ **FLUXO DE NAVEGAÇÃO (NOMES DOS MENUS)** ⭐

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `fluxo_1` | Inicio_Ura_Seguros_Assistencias\|Modulo_Dial_My_App\|Inicio_Ura_Seguros_Assistencias\|Roteador_Unico_Lacunas\|Inicio_Ura_Seguros_Assistencias\|Identificacao_Telefone\|Inicio_Identificacao_Publico\|\| | **NOMES DOS NÓS DO SANKEY** | ✅ **CRÍTICO** |

**Extração dos Nós:**

1. `Inicio_Ura_Seguros_Assistencias` (aparece 3x - **NÓ DE INÍCIO**)
2. `Modulo_Dial_My_App`
3. `Roteador_Unico_Lacunas`
4. `Identificacao_Telefone`
5. `Inicio_Identificacao_Publico`

**Observação:**
- ✅ Começa com `Inicio_` conforme regra
- ⚠️ `Inicio_Ura_Seguros_Assistencias` se repete (indicando loops)
- ❌ Não há nó final explícito (Transferencia, Desconexao, Finalizacao)

---

### 4️⃣ **PONTOS DE MARCAÇÃO (CÓDIGOS)** ⭐

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `ponto_1` | 10023\|10583\|10589\|10601\|10611\|11769\|24501\|24502\|24534\|24504\|24506\|24508\|10615\|12035\|10004\|11014\|11016\|12001\|10619\|10077\|10949\|10009\|11794\|\| | **CÓDIGOS PARA DRILL-DOWN** | ✅ **CRÍTICO** |

**Total de pontos:** 23 códigos

**Uso:**
- Relacionar cada fluxo com seu código de ponto
- Drill-down detalhado quando usuário clicar em nó
- Análise granular de navegação

---

### 5️⃣ **EVENTOS DE NAVEGAÇÃO**

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `event_name_1` | inicio_menu\|validacao_parametro\|origem_identificada\|saudacao_porto\|validacao_parametro\|validacao\|inicio_menu\|validacao_dma_habilitado\|... | Eventos técnicos | 🟡 Médio |
| `event_name_2` | validacao\|\| | Eventos adicionais | 🟡 Médio |

**Total de eventos em event_name_1:** 22 eventos

**Eventos identificados:**
- `inicio_menu` (aparece 4x)
- `validacao_parametro` (aparece 2x)
- `validacao` (aparece 2x)
- `origem_identificada`
- `saudacao_porto`
- `validacao_dma_habilitado`
- `opm_dma_ddd_habilitado`
- `validacao_origem_chamada`
- `chamada_api`
- `sucesso_api`
- `origem_transportes`
- `direcionamento_fluxo` (aparece 2x)
- `acionamento_lacuna`
- `mensagem_emergencial`
- `lista_corretores_habilitada`

**Uso:**
- Filtrar ruídos (conforme regras: descartar "validacao", etc.)
- Entender contexto técnico da navegação

---

### 6️⃣ **VALIDAÇÕES E CONTEXTO**

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `validacao_1` | 333_Porto\|Chamada_Autorizada\|PORTO\|Ola\|Outras_Origens\|... | Contexto da navegação | 🟡 Médio |
| `validacao_2` | Origem_Uras_Relacionamento\|\| | Validações adicionais | 🟡 Médio |
| `input_1` | \|\|\|\|\|\|\|\|\|\|\|7\|\|\|\|\|\|\|\|\|\|\|\| | Inputs do usuário | 🟡 Médio |

**Uso:**
- Entender decisões de roteamento
- Análise de contexto

---

### 7️⃣ **RESULTADO FINAL** ⚠️

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `indicador_1` | **Abandono** | **NÓ DE FIM** | ✅ **CRÍTICO** |
| `Motivo de Finalização do Contato.` | Contato desligou | Detalhamento | ✅ Alto |
| `ultimo_ponto_1` | 11794 | Último ponto atingido | ✅ Alto |

**Conclusão:**
- ✅ Ligação terminou em **ABANDONO**
- ✅ Será mapeado para nó `FIM_ABANDONO` no Sankey

---

### 8️⃣ **METADADOS ADICIONAIS**

| Campo Original | Valor | Uso no Sankey | Prioridade |
|----------------|-------|---------------|------------|
| `id_ura` | 7 | ID do sistema | 🟡 Médio |
| `nome_ura` | Seguros_Assistencia | Nome amigável da URA | ✅ Alto |
| `produto_1` | PORTO//NAO_DEFINIDO | Produto relacionado | 🟡 Médio |
| `Competência` | URA_SEG_E_ASSIST_PORTO | Identificador de competência | ✅ Alto |
| `ANI` | +5511996261856 (Land Line) | Número do cliente | 🟡 Médio |
| `DNIS` | +551131448400 | Número discado | 🟡 Médio |

---

## 🔧 SINCRONIZAÇÃO DE DADOS PARALELOS

### Relação entre `fluxo_1` e `ponto_1`

**fluxo_1** (8 elementos válidos antes de vazios):
1. `Inicio_Ura_Seguros_Assistencias` → `10023`
2. `Modulo_Dial_My_App` → `10583`
3. `Inicio_Ura_Seguros_Assistencias` → `10589`
4. `Roteador_Unico_Lacunas` → `10601`
5. `Inicio_Ura_Seguros_Assistencias` → `10611`
6. `Identificacao_Telefone` → `11769`
7. `Inicio_Identificacao_Publico` → `24501`
8. (vazio) → `24502`

**ponto_1** (23 elementos):
```
10023 | 10583 | 10589 | 10601 | 10611 | 11769 | 24501 | 24502 | 24534 | 24504 | 24506 | 24508 | 10615 | 12035 | 10004 | 11014 | 11016 | 12001 | 10619 | 10077 | 10949 | 10009 | 11794 |
```

**Problema:** Há **MAIS pontos do que fluxos**!

**Análise:**
- Fluxos válidos: 7 (desconsiderando vazios e repetições)
- Pontos registrados: 23
- **Razão:** A URA registrou mais pontos de marcação técnicos do que mudanças de menu

**Solução sugerida:**
- Usar os primeiros 7 pontos que correspondem aos 7 fluxos
- Ou criar lógica para identificar quais pontos pertencem a cada fluxo baseado em `range_1`

---

## 📊 APLICAÇÃO DAS REGRAS DO SANKEY

### ✅ **Regra 1: Nó de Início (Source)**

**Encontrado:** `Inicio_Ura_Seguros_Assistencias`
- ✅ Começa com `Inicio_`
- ✅ É o primeiro da sequência
- ⚠️ Repete na sequência (loops)

**Ação:**
- Usar apenas a **primeira ocorrência** como nó de início
- Descartar repetições subsequentes (conforme regra de eliminação de loops)

---

### 🔧 **Regra 2: Nós de Descarte/Ruído**

**Eventos a descartar:**
- ❌ `validacao`
- ❌ `validacao_parametro`
- ❌ Possível: `inicio_menu` (se for evento técnico repetitivo)

**Fluxos a analisar:**
- `Inicio_Ura_Seguros_Assistencias` (repetido 3x) → Manter só primeiro
- Demais parecem válidos

---

### ✅ **Regra 3: Nós de Fluxo (Caminhos)**

**Sequência limpa após aplicar regras:**

1. `Inicio_Ura_Seguros_Assistencias` (INÍCIO)
2. `Modulo_Dial_My_App`
3. `Roteador_Unico_Lacunas`
4. `Identificacao_Telefone`
5. `Inicio_Identificacao_Publico`

---

### ✅ **Regra 4: Nó de Fim (Target)**

**Encontrado:** `indicador_1` = **Abandono**

**Mapeamento:**
- Como não é `Transferencia`, `Desconexao` ou `Finalizacao`
- Será: **`FIM_ABANDONO`**

---

### 🔗 **Regra 5: Links do Sankey**

**Sequência de Links (após limpeza):**

```
Inicio_Ura_Seguros_Assistencias → Modulo_Dial_My_App
Modulo_Dial_My_App → Roteador_Unico_Lacunas
Roteador_Unico_Lacunas → Identificacao_Telefone
Identificacao_Telefone → Inicio_Identificacao_Publico
Inicio_Identificacao_Publico → FIM_ABANDONO
```

**Contagem de Links:** 5 transições

---

## 📈 MÉTRICAS CALCULÁVEIS (KPIs)

### ✅ Métricas que PODEM ser calculadas:

| KPI | Fonte | Cálculo |
|-----|-------|---------|
| **Total de Sessões** | Contar `cod_identificacao_ligacao` únicos | 1 (neste arquivo) |
| **Duração Média** | `qtd_duracao_em_segundos` | 31 segundos |
| **Taxa de Abandono** | `indicador_1` = Abandono | 100% (1/1) |
| **Taxa de Transferência** | `indicador_1` = Transferencia | 0% |
| **Taxa de Finalização** | `indicador_1` = Finalizacao | 0% |
| **Pontos de Navegação por Sessão** | Contar elementos em `ponto_1` | 23 pontos |
| **Menus Navegados por Sessão** | Contar elementos em `fluxo_1` | 7 menus |
| **Tempo Médio por Passo** | `qtd_duracao_em_segundos` / passos | 31s / 7 ≈ 4.4s |

---

## 🎨 ESTRUTURA DE DADOS FINAL PARA O SANKEY

### Nodes (Nós):

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

### Links (Fluxos):

```json
[
  {
    "source": "Inicio_Ura_Seguros_Assistencias",
    "target": "Modulo_Dial_My_App",
    "value": 1,
    "codigosPonto": ["10023", "10583"]
  },
  {
    "source": "Modulo_Dial_My_App",
    "target": "Roteador_Unico_Lacunas",
    "value": 1,
    "codigosPonto": ["10589", "10601"]
  },
  {
    "source": "Roteador_Unico_Lacunas",
    "target": "Identificacao_Telefone",
    "value": 1,
    "codigosPonto": ["10611", "11769"]
  },
  {
    "source": "Identificacao_Telefone",
    "target": "Inicio_Identificacao_Publico",
    "value": 1,
    "codigosPonto": ["24501", "24502"]
  },
  {
    "source": "Inicio_Identificacao_Publico",
    "target": "FIM_ABANDONO",
    "value": 1,
    "codigosPonto": ["11794"]
  }
]
```

### PassosNavegacao (para Drill-Down):

```json
[
  {
    "id_ligacao": "688670357120",
    "timestamp": "2025-11-27T20:26:44",
    "nomeMenu": "Inicio_Ura_Seguros_Assistencias",
    "codigoPonto": "10023"
  },
  {
    "id_ligacao": "688670357120",
    "timestamp": "2025-11-27T20:26:44",
    "nomeMenu": "Modulo_Dial_My_App",
    "codigoPonto": "10583"
  },
  // ... mais passos
]
```

---

## ⚠️ DESAFIOS E CONSIDERAÇÕES

### 1. **Descompasso entre Fluxos e Pontos**
- **Problema:** 7 fluxos vs 23 pontos
- **Solução:** Usar lógica baseada em `range_1` ou `timestamp_1` para associar

### 2. **Loops/Repetições**
- **Problema:** `Inicio_Ura_Seguros_Assistencias` aparece 3x
- **Solução:** Aplicar regra de eliminação de loops (descartar repetições consecutivas)

### 3. **Formato do Timestamp**
- **Problema:** `27/11/2025 20:26:44` não é ISO 8601
- **Solução:** Converter para `2025-11-27T20:26:44`

### 4. **Múltiplos Arquivos**
- Este arquivo tem apenas **1 ligação**
- Para Sankey útil, precisamos de **múltiplas ligações** para ver volumes

---

## ✅ PRÓXIMOS PASSOS

### 1. **Adaptar o ETL Processor**
- Modificar `etlProcessor.js` para processar este formato
- Parsear campos chave-valor
- Separar valores por pipe `|`
- Sincronizar `fluxo_1` com `ponto_1` usando timestamps

### 2. **Tratar Múltiplos Registros**
- Este TXT tem 1 ligação
- Precisamos de arquivo com várias ligações ou múltiplos arquivos

### 3. **Aplicar Regras de Limpeza**
- Eliminar loops de `Inicio_Ura_Seguros_Assistencias`
- Filtrar eventos de ruído
- Mapear `indicador_1` para nós de fim apropriados

### 4. **Testar Dashboard**
- Carregar dados processados
- Validar visualização Sankey
- Testar drill-down

---

## 🎯 CONCLUSÃO

### ✅ **O arquivo ContactHistory.txt CONTÉM TODOS OS DADOS NECESSÁRIOS!**

**Dados disponíveis:**
- ✅ ID da ligação
- ✅ Timestamps
- ✅ Sequência de fluxos (menus)
- ✅ Códigos de pontos
- ✅ Resultado final (Abandono)
- ✅ Duração
- ✅ Metadados da URA

**Próximo passo:**
Adaptar o processador ETL para ler este formato e gerar o Sankey conforme as regras!
