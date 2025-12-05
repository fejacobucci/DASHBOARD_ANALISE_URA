📝 Regras de Tratamento de Dados para Gráfico Sankey Contínuo
O objetivo é transformar a sequência bruta de logs em uma jornada simplificada que leve do Início ao Resultado Final.
1. Regras para Definição dos Nós (Nodes)
Tipo de NóDefinição da RegraAplicação ao TXT (Campo fluxo_n)Nó de Início (Source)Manter apenas o primeiro nó da sessão que começa com Inicio_. Todos os nós subsequentes de Inicio_... são tratados como transição normal ou descarte (se forem loops).
Exemplo: Inicio_Ura_Seguros_Assistencias3.
Nó de Descarte/Ruído (Limpeza)Descartar nós que representam loops, validações internas ou eventos sem significado para a navegação do usuário.
Exemplos a descartar (se aparecerem como fluxo): Menu_Chutes (se for um menu genérico de erro)4. Eventos de descarte no campo event_name: Else, Else_Invalido, Silencio (como você sugeriu)5.
Nó de Fluxo (Caminhos)Manter todos os outros nomes de menus do campo fluxo_n que não sejam Início ou Descarte.
Exemplo: Menu_Produtos_Dinamico_Cliente, Menu_Cancelamento_Servicos6.
Nó de Fim (Target)Manter os nós que representam o resultado final da ligação.
Exemplos: Desconexao, Finalizacao, Transferencia (como você sugeriu)7.
2. Regras para Geração dos Links Contínuos
A geração do link deve garantir que não haja setas de retorno ou loops no Sankey.RegraDescriçãoEliminação de LoopsSe o nó de destino (Target) for igual ao nó de origem (Source) ou for um nó que já apareceu imediatamente antes na sequência (A $\rightarrow$ B $\rightarrow$ A), essa transição deve ser descartada ou consolidada para evitar um loop visual.Navegação ContínuaA sequência de links deve ser gerada apenas usando os Nós de Fluxo válidos, pulando todos os nós de descarte ou erro.Condição de ParadaA sequência de links para uma ligação específica deve parar quando o Nó de Destino for um dos nós de fim (Desconexao, Finalizacao, Transferencia).Nós de SaídaPara identificar Drop-offs intermediários (saídas que não são um dos 3 nós de fim), a transição deve ser gerada do último menu válido para um nó especial chamado FIM_ABANDONO.
3. Consolidação de Dados: Como Tratar o TXT
Para aplicar essas regras, você precisará de uma etapa de processamento (ETL) que:
Combine os campos de fluxo: Concatene fluxo_1, fluxo_2, fluxo_3, fluxo_4 (e os subsequentes, se houver) em uma única lista ordenada de menus para cada cod_identificacao_ligacao8.
Limpe a Sequência: Itere sobre essa lista e remova os nós de descarte (Menu_Chutes, Else, Silencio, etc.)9.
Gere os Pares: Com a sequência limpa, gere os pares de Links (Nó $N$ $\rightarrow$ Nó $N+1$)10.
Calcule a Frequência: Conte quantas vezes cada par de Link (Ex: Menu_A $\rightarrow$ Menu_B) ocorreu em todas as ligações. Essa frequência será o valor do Link (Value) no Sankey.
