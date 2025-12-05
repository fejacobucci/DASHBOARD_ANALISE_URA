# 🧪 Guia de Teste - ContactHistory.txt

## ✅ ETL Adaptado com Sucesso!

O sistema agora processa automaticamente arquivos ContactHistory.txt.

---

## 🚀 Como Testar

### Passo 1: Verificar se o servidor está rodando

O servidor já deve estar em execução em: **http://localhost:3000**

Se não estiver, execute:
```bash
npm run dev
```

---

### Passo 2: Abrir o Dashboard

1. Abra seu navegador
2. Acesse: `http://localhost:3000`
3. Você verá a tela de upload

---

### Passo 3: Carregar o Arquivo

**Opção 1 - Drag & Drop:**
1. Localize o arquivo: `mock/ContactHistory.txt`
2. Arraste e solte na área de upload

**Opção 2 - Click:**
1. Clique na área de upload
2. Selecione: `mock/ContactHistory.txt`

---

### Passo 4: Verificar Processamento

Após carregar, você deverá ver:

#### 📊 **Métricas (Cards no Topo)**

| Métrica | Valor Esperado |
|---------|----------------|
| Total de Sessões | 1 |
| Duração Média | 31s |
| Taxa de Transferência | 0% |
| Taxa de Abandono | 100% |

---

#### 🎨 **Diagrama Sankey (Centro)**

**Nós esperados (da esquerda para direita):**

1. `Inicio_Ura_Seguros_Assistencias` (início - azul/ciano)
2. `Modulo_Dial_My_App`
3. `Roteador_Unico_Lacunas`
4. `Identificacao_Telefone`
5. `Inicio_Identificacao_Publico`
6. `FIM_ABANDONO` (fim - destacado)

**Links (setas):**
- 5 transições conectando os nós em sequência
- Espessura proporcional ao volume (neste caso, todas com value=1)

---

#### 📋 **Drill-Down (Tabela Inferior)**

**Inicialmente vazia** com mensagem:
> "Clique em um nó no diagrama Sankey para visualizar os detalhes"

**Ao clicar em um nó** (ex: `Modulo_Dial_My_App`):

| Coluna | Exemplo de Valor |
|--------|------------------|
| ID Ligação | 688670357120 |
| Timestamp | 27/11/2025 20:26:44 |
| Menu | Modulo_Dial_My_App |
| Código Ponto | 10583 |

---

## 🔍 Validações a Fazer

### ✅ Checklist de Teste

- [ ] **Upload funciona**: Arquivo é carregado sem erro
- [ ] **Métricas corretas**:
  - Total de Sessões = 1
  - Duração Média = 31
  - Taxa de Abandono = 100%
- [ ] **Sankey renderizado**: 6 nós visíveis
- [ ] **Nós corretos**: Sequência de navegação completa
- [ ] **Hover funciona**: Ao passar mouse sobre nós e links, mostra tooltips
- [ ] **Click funciona**: Ao clicar em nó, tabela é preenchida
- [ ] **Drill-down correto**: Mostra dados do nó selecionado
- [ ] **Busca funciona**: Campo de busca filtra registros na tabela
- [ ] **Ordenação funciona**: Clicar em cabeçalhos ordena colunas

---

## 🎯 Dados Processados Esperados

### Nodes (após processamento):

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

### Links (após processamento):

```json
[
  {
    "source": "Inicio_Ura_Seguros_Assistencias",
    "target": "Modulo_Dial_My_App",
    "value": 1
  },
  {
    "source": "Modulo_Dial_My_App",
    "target": "Roteador_Unico_Lacunas",
    "value": 1
  },
  {
    "source": "Roteador_Unico_Lacunas",
    "target": "Identificacao_Telefone",
    "value": 1
  },
  {
    "source": "Identificacao_Telefone",
    "target": "Inicio_Identificacao_Publico",
    "value": 1
  },
  {
    "source": "Inicio_Identificacao_Publico",
    "target": "FIM_ABANDONO",
    "value": 1
  }
]
```

---

## 🐛 Possíveis Problemas e Soluções

### Erro: "Cannot find module './contactHistoryParser.js'"

**Causa:** Build não atualizou

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Execute: `npm run dev` novamente

---

### Erro: "Arquivo não contém os campos necessários"

**Causa:** Arquivo não tem formato correto

**Solução:**
1. Verifique se é o arquivo `mock/ContactHistory.txt`
2. Confirme que tem os campos `fluxo_1` e `ponto_1`

---

### Sankey não aparece

**Causa:** Menos de 2 nós válidos

**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Confirme que o processamento retornou nodes e links

---

### Tabela não atualiza ao clicar em nó

**Causa:** Estado não está sendo atualizado

**Solução:**
1. Recarregue a página (F5)
2. Carregue o arquivo novamente
3. Tente clicar em outro nó

---

## 🔧 Debug Mode

Para ver o que está sendo processado, abra o **Console do Navegador** (F12) e adicione no arquivo `src/App.jsx`:

```javascript
const handleFileLoad = (fileContent) => {
  setLoading(true);
  setError(null);
  setSelectedNode(null);

  setTimeout(() => {
    const result = processarArquivoURA(fileContent);

    // DEBUG: Mostra resultado no console
    console.log('Resultado do processamento:', result);

    if (result.success) {
      console.log('Nodes:', result.data.nodes);
      console.log('Links:', result.data.links);
      console.log('Métricas:', result.data.metricas);
      setData(result.data);
      setLoading(false);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }, 500);
};
```

---

## 📸 Screenshots Esperados

### 1. Tela de Upload (Inicial)
- Área de drag & drop destacada
- Texto: "Carregar Arquivo de Logs URA"
- Ícone de upload animado

### 2. Tela de Loading
- Spinner girando
- Texto: "Processando dados..."

### 3. Dashboard Completo
- 4 cards coloridos no topo
- Sankey com 6 nós no centro
- Tabela vazia na parte inferior

### 4. Drill-Down Ativo
- Nó destacado no Sankey (borda amarela)
- Tabela preenchida com dados
- Contador de registros visível

---

## ✅ Teste Bem-Sucedido!

Se todos os itens do checklist estão ✅, o ETL foi adaptado com sucesso!

### Próximos Passos:

1. **Testar com arquivo formato antigo** (pipe-separated)
   - Usar `exemplo_ura.txt`
   - Verificar se ainda funciona

2. **Criar mais arquivos de teste**
   - Com diferentes URA
   - Com diferentes resultados (Transferência, Finalização)

3. **Documentar casos de uso**
   - Diferentes tipos de fluxo
   - Diferentes padrões de navegação

---

**🎉 Parabéns! O sistema está pronto para processar ContactHistory.txt!**
