# Dashboard de Análise de Caminhos de URA

Dashboard web interativo para análise de logs de URA (Unidade de Resposta Audível) com visualização de fluxo Sankey, métricas em tempo real e capacidade de drill-down.

## 🎯 Características

- **Processamento In-Memory**: Toda a lógica ETL é executada no JavaScript do navegador
- **Visualização Sankey**: Diagrama de fluxo interativo com D3.js
- **Drill-Down Inteligente**: Clique em qualquer nó para ver detalhes específicos
- **Métricas em Tempo Real**: KPIs automáticos calculados a partir dos dados
- **Dark Mode**: Interface moderna com tema escuro e cores Ciano/Azul vibrantes
- **Responsivo**: Layout adaptável para diferentes tamanhos de tela

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Vite** - Build tool moderna e rápida
- **D3.js** - Biblioteca de visualização de dados
- **d3-sankey** - Plugin para diagramas Sankey
- **Lucide React** - Ícones modernos

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

## 🔧 Instalação

1. Clone ou baixe o projeto

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:3000`

## 📊 Formato de Dados

O arquivo de entrada deve seguir o formato:

```
id_ligacao|timestamp|fluxo_1|ponto_1|fluxo_2|ponto_2|...
```

### Exemplo:
```
LIG001|2024-01-15T10:30:00|Inicio_Atendimento|101|Menu_Principal|102|Menu_Produtos|103|Transferencia|104
```

### Campos:
- **id_ligacao**: Identificador único da chamada
- **timestamp**: Data/hora no formato ISO 8601
- **fluxo_n**: Nome do menu/ponto de navegação
- **ponto_n**: Código do ponto correspondente

## 🎨 Funcionalidades

### 1. Upload de Arquivo
- Arraste e solte ou clique para selecionar
- Suporta arquivos .txt e .csv
- Validação automática de formato

### 2. Métricas (KPIs)
- **Total de Sessões**: Número total de chamadas processadas
- **Duração Média**: Tempo médio de duração das chamadas (em segundos)
- **Taxa de Transferência**: Percentual de chamadas transferidas
- **Taxa de Abandono**: Percentual de chamadas abandonadas

### 3. Diagrama Sankey
- Visualização de fluxo completo de navegação
- Rolagem horizontal para fluxos longos
- Cores diferenciadas por nó
- Hover para ver detalhes de cada fluxo
- Click em nós para drill-down

### 4. Tabela de Drill-Down
- Exibe detalhes do nó selecionado
- Busca por ID, código ou menu
- Ordenação por qualquer coluna
- Visualização de códigos de ponto específicos

## 🔍 Regras de Processamento (ETL)

### Limpeza de Ruído
Passos com os seguintes nomes são automaticamente descartados:
- `Else`
- `Else_Invalido`
- `Silencio`
- `Menu_Chutes`
- `Erro`
- `Timeout`

### Eliminação de Loops
- Transições consecutivas para o mesmo nó são consolidadas
- Garante fluxo contínuo sem loops visuais

### Nós Especiais
- **Início**: Nós que começam com `Inicio_`
- **Fim**: `Desconexao`, `Finalizacao`, `Transferencia`
- **Abandono**: `FIM_ABANDONO` (criado automaticamente para chamadas sem fim definido)

## 📁 Estrutura do Projeto

```
dashboard-analise-ura/
├── src/
│   ├── components/
│   │   ├── FileUploader.jsx        # Componente de upload
│   │   ├── FileUploader.css
│   │   ├── MetricsCards.jsx        # Cards de KPIs
│   │   ├── MetricsCards.css
│   │   ├── SankeyChart.jsx         # Diagrama Sankey
│   │   ├── SankeyChart.css
│   │   ├── DrillDownTable.jsx      # Tabela de detalhes
│   │   └── DrillDownTable.css
│   ├── utils/
│   │   └── etlProcessor.js         # Lógica ETL in-memory
│   ├── App.jsx                     # Componente principal
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Estilos globais
├── index.html
├── vite.config.js
├── package.json
├── exemplo_ura.txt                 # Arquivo de exemplo
└── README.md
```

## 🎯 Como Usar

1. **Inicie a aplicação** com `npm run dev`

2. **Carregue um arquivo**:
   - Use o arquivo `exemplo_ura.txt` fornecido, ou
   - Prepare seu próprio arquivo no formato especificado

3. **Visualize as métricas**:
   - Os KPIs são calculados automaticamente
   - Cards coloridos mostram as principais estatísticas

4. **Explore o Sankey**:
   - Role horizontalmente para ver todo o fluxo
   - Passe o mouse sobre nós e links para detalhes
   - A largura dos links representa o volume de fluxo

5. **Faça Drill-Down**:
   - Clique em qualquer nó do diagrama
   - A tabela inferior mostrará todos os registros daquele nó
   - Use a busca para filtrar registros específicos
   - Clique nos cabeçalhos para ordenar

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
```

## 🎨 Personalização de Cores

As cores principais do tema podem ser ajustadas em:
- **index.css**: Cores globais e scrollbar
- **SankeyChart.jsx**: Paleta de cores do Sankey (linha 51-56)
- **Componentes individuais**: Ajuste as cores nos arquivos CSS

Paleta Atual:
- Primário: `#2dd4bf` (Ciano)
- Secundário: `#06b6d4` (Azul Ciano)
- Destaque: `#fbbf24` (Amarelo)
- Background: `#0a0e1a` (Azul Escuro)

## 📈 Otimizações

- Processamento assíncrono para não bloquear a UI
- Memoização de cálculos pesados
- Virtualização de lista para grandes volumes de dados
- Lazy loading de componentes

## 🐛 Troubleshooting

### Erro ao carregar arquivo
- Verifique se o formato está correto (pipe `|` como separador)
- Certifique-se de que há pelo menos 3 colunas por linha

### Sankey não aparece
- Verifique se há dados suficientes (mínimo 2 nós)
- Confirme que não há apenas ruídos no arquivo

### Performance lenta
- Reduza o tamanho do arquivo de entrada
- Feche outras abas do navegador
- Use navegadores modernos (Chrome, Firefox, Edge)

## 📝 Licença

Projeto desenvolvido para fins educacionais e de análise de dados de URA.

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas!

## 📧 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

---

**Desenvolvido com React, D3.js e ❤️**
