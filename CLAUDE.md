# CLAUDE.md - Especificações do Projeto

## Título do Projeto
Dashboard de Análise de Caminhos de URA (In-Memory)

## Objetivo
Desenvolver uma aplicação web em React (com foco em processamento in-memory no JavaScript) para análise de logs de URA (Unidade de Resposta Audível). A aplicação deve processar um arquivo de entrada (TXT/CSV com pipelines separados por pipe |) e apresentar um Dashboard com um Gráfico de Sankey, seguindo regras estritas para garantir um fluxo contínuo e a capacidade de drill-down.

## 1. Arquitetura e Tecnologia

### Framework
- React 18 com JavaScript/JSX
- Vite como build tool

### Armazenamento de Dados
- Processamento e armazenamento in-memory
- JavaScript para simular lógica ETL (Extração, Transformação e Carga)
- Sem necessidade de banco de dados

### Visualização
- D3.js para o gráfico Sankey
- d3-sankey para layout do diagrama
- Lucide React para ícones

### Entrada de Dados
- Componente de upload de arquivo local
- Suporte para arquivos .txt e .csv
- Drag & drop interface

## 2. Regras de Processamento de Dados (ETL na Memória)

### Sincronização e Normalização
- Converter colunas paralelas (fluxo_n e ponto_n) em lista única de objetos
- Ordenar por timestamp
- Cada objeto representa um PassoNavegacao com:
  - id_ligacao
  - timestamp
  - nomeMenu (do fluxo_n)
  - codigoPonto (do ponto_n correspondente)

### Limpeza de Ruído (Regra do Usuário)
Descartar passos com nomeMenu ou event_name contendo:
- Else
- Else_Invalido
- Silencio
- Menu_Chutes
- Erro
- Timeout

### Geração de Fluxo Contínuo (Sankey)

#### Eliminação de Loops
- Gerar sequência de links (Origem → Destino)
- Garantir que não haja setas de retorno
- Se passo seguinte = passo anterior, consolidar ou descartar

#### Nó de Início
- Source só deve ser o primeiro nó da sessão
- Deve começar com `Inicio_...`

#### Nós de Destino/Fim
- Transições finais devem ter como destino:
  - Desconexao
  - Finalizacao
  - Transferencia
- Transições fora do fluxo → nó `FIM_ABANDONO`

## 3. Requisitos do Dashboard (Visualização)

### Gráfico de Sankey
- Elemento visual central
- Rolagem horizontal para fluxos longos
- Design: Dark Mode com cores Ciano/Azul Vibrante
- Interatividade:
  - Hover mostra detalhes
  - Click em nó ativa drill-down
  - Destaque visual do nó selecionado

### Drill-Down (Análise Pontual)
- Click em nó atualiza tabela inferior
- Exibe todos os codigoPonto específicos daquele menu
- Permite análise granular
- Busca e filtros na tabela
- Ordenação por colunas

### Métricas Chave
Cards de resumo no topo:
- Total de Sessões
- Duração Média da Ligação
- Taxa de Transferência
- Taxa de Abandono

### Tabela de Logs Detalhada
- Parte inferior do dashboard
- Drill-down dos logs brutos filtrados
- Colunas: ID Ligação, Timestamp, Menu, Código Ponto
- Busca e ordenação

## 4. Estrutura de Componentes

### App.jsx
- Componente principal
- Gerencia estado global
- Coordena fluxo de dados

### FileUploader
- Upload de arquivo
- Drag & drop
- Validação de formato

### MetricsCards
- Exibe KPIs
- Cards coloridos
- Ícones representativos

### SankeyChart
- Renderiza diagrama Sankey
- Usa D3.js
- Gerencia interações (hover, click)
- Scroll horizontal

### DrillDownTable
- Tabela de detalhes
- Busca e filtros
- Ordenação
- Paginação (se necessário)

## 5. Fluxo de Dados

```
Arquivo Upload → ETL Processor → {
  nodes: [],
  links: [],
  metricas: {},
  passos: [],
  sessoes: {}
} → Componentes de Visualização
```

## 6. Tema e Estilo

### Dark Mode
- Background: #0a0e1a
- Cards: Gradientes de #0f172a a #1e293b
- Bordas: #2dd4bf (ciano)

### Paleta de Cores
- Primário: #2dd4bf (Ciano)
- Secundário: #06b6d4 (Azul Ciano)
- Terciário: #14b8a6 (Verde Água)
- Destaque: #fbbf24 (Amarelo)
- Texto: #e0e6ed
- Texto Secundário: #94a3b8

### Tipografia
- Sans-serif system fonts
- Tamanhos responsivos
- Peso variável para hierarquia

## 7. Responsividade

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Grid adaptável
- Scroll horizontal preservado no Sankey

## 8. Performance

- Processamento assíncrono
- Debounce em buscas
- Memoização de cálculos
- Lazy loading de componentes grandes

## 9. Validações

- Formato de arquivo correto
- Mínimo de dados para visualização
- Tratamento de erros gracioso
- Mensagens claras ao usuário

## 10. Arquivo de Exemplo

Estrutura do `exemplo_ura.txt`:
```
LIG001|2024-01-15T10:30:00|Inicio_Atendimento|101|Menu_Principal|102|Transferencia|103
LIG002|2024-01-15T10:35:00|Inicio_Atendimento|101|Menu_Principal|102|Finalizacao|201
```

## 11. Comandos NPM

```bash
npm install    # Instalar dependências
npm run dev    # Servidor de desenvolvimento
npm run build  # Build de produção
npm run preview # Preview do build
```

## 12. Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "d3": "^7.8.5",
  "d3-sankey": "^0.12.3",
  "lucide-react": "^0.294.0"
}
```

## 13. Melhorias Futuras (Opcional)

- Export de dados (CSV, JSON)
- Comparação de períodos
- Filtros avançados por data/hora
- Análise de duração por caminho
- Heatmap de horários
- Relatórios em PDF

---

**Status do Projeto**: ✅ Implementado
**Última Atualização**: 2024-11-28
