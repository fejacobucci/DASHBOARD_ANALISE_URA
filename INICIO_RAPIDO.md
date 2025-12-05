# 🚀 Guia de Início Rápido

## Dashboard de Análise de Caminhos de URA

### Passos para Iniciar o Projeto

#### 1️⃣ Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso instalará todas as dependências necessárias:
- React
- Vite
- D3.js
- d3-sankey
- Lucide React

#### 2️⃣ Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`

#### 3️⃣ Testar a Aplicação

1. A aplicação abrirá automaticamente no navegador
2. Você verá a tela de upload de arquivo
3. Clique ou arraste o arquivo `exemplo_ura.txt` (fornecido na raiz do projeto)
4. O dashboard será carregado com:
   - 4 cards de métricas no topo
   - Gráfico Sankey no centro
   - Mensagem para clicar em um nó

#### 4️⃣ Explorar o Dashboard

**Métricas:**
- Observe os KPIs calculados automaticamente
- Total de Sessões, Duração Média, Taxa de Transferência e Abandono

**Gráfico Sankey:**
- Role horizontalmente para ver todo o fluxo
- Passe o mouse sobre os nós para ver detalhes
- Passe o mouse sobre os links para ver o volume

**Drill-Down:**
- Clique em qualquer nó do Sankey
- A tabela inferior será preenchida com os detalhes
- Use a busca para filtrar registros
- Clique nos cabeçalhos da tabela para ordenar

---

## 📋 Formato do Arquivo de Entrada

### Estrutura Esperada

```
id_ligacao|timestamp|fluxo_1|ponto_1|fluxo_2|ponto_2|...
```

### Exemplo de Linha

```
LIG001|2024-01-15T10:30:00|Inicio_Atendimento|101|Menu_Principal|102|Transferencia|103
```

### Regras Importantes

✅ **Separador**: Use pipe `|` entre campos
✅ **Timestamp**: Formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)
✅ **Pares**: Cada fluxo deve ter um ponto correspondente
✅ **Início**: Primeira etapa deve começar com "Inicio_"

❌ **Evite**: Else, Silencio, Erro (serão filtrados automaticamente)

---

## 🎨 Personalização

### Mudar Cores

Edite o arquivo que deseja personalizar:

**Cores do Sankey:**
- Abra: `src/components/SankeyChart.jsx`
- Linha 51-56: Array de cores

**Cores dos Cards:**
- Abra: `src/components/MetricsCards.jsx`
- Linha 8-31: Configuração de cards com cores

**Cores Globais:**
- Abra: `src/index.css`
- Variáveis de cor no `:root`

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor local

# Produção
npm run build        # Gera build otimizado
npm run preview      # Testa build de produção

# Limpeza
rm -rf node_modules  # Remove dependências
npm install          # Reinstala dependências
```

---

## 🐛 Problemas Comuns

### "Erro ao processar arquivo"
- Verifique o formato do arquivo
- Certifique-se de usar `|` como separador
- Confirme que há pelo menos 3 colunas

### Sankey não aparece
- Verifique se há dados suficientes
- Mínimo de 2 nós necessários
- Confira se não há apenas ruídos

### Build falha
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente
- Verifique versão do Node (requer 16+)

---

## 📂 Estrutura de Pastas Simplificada

```
DASHBOARD_ANALISE_URA/
├── src/
│   ├── components/       # Componentes React
│   ├── utils/           # Lógica de processamento
│   ├── App.jsx          # App principal
│   └── main.jsx         # Entry point
├── exemplo_ura.txt      # Arquivo de teste
├── README.md            # Documentação completa
├── INICIO_RAPIDO.md     # Este arquivo
└── package.json         # Dependências
```

---

## ✅ Checklist de Verificação

- [ ] Node.js instalado (v16+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Arquivo de exemplo testado
- [ ] Dashboard carregou corretamente
- [ ] Drill-down funcionando
- [ ] Busca na tabela operacional

---

## 🎯 Próximos Passos

1. **Teste com seus dados reais**
   - Prepare arquivo no formato correto
   - Carregue e analise os resultados

2. **Personalize o visual**
   - Ajuste cores conforme sua marca
   - Modifique textos e labels

3. **Explore funcionalidades**
   - Experimente diferentes nós
   - Use a busca na tabela
   - Ordene por diferentes colunas

4. **Gere o build de produção**
   - `npm run build`
   - Deploy na sua plataforma preferida

---

**Dúvidas?** Consulte o [README.md](README.md) para documentação completa.

**Bom uso! 🚀**
