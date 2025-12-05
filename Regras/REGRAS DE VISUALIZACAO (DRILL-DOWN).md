1. Regra na Camada de Visualização (O que o usuário faz)
A regra de interação para o usuário é simples:
Regra: Ao clicar em um Nó de Navegação no Gráfico Sankey (Ex: Menu_Chutes), o sistema deve acionar uma consulta (query) que filtra e apresenta em uma tabela separada todos os registros de Pontos associados a essa Navegação, dentro do período filtrado.
2. Regra na Camada de Dados (O que o ETL e o Banco de Dados precisam fazer)
Para que a consulta acima funcione, a regra mais crucial precisa ser aplicada durante a fase de ETL (Extração, Transformação, Carga), onde você processa o TXT e o insere no banco.
Você deve criar um Relacionamento Um-Para-Muitos na sua base de dados.
Processamento do TXT (ETL)
O seu arquivo Exemplo.txt apresenta listas paralelas, onde a posição ($i$) em fluxo_n corresponde à posição ($i$) em ponto_n. O desafio é sincronizar esses dados na carga.
A regra de transformação é:
Regra de Relacionamento de Ponto de Marcação: Cada Passo de Navegação (cada elemento individual dos campos fluxo_n) deve ser associado diretamente a um Registro de Ponto (o elemento correspondente nos campos ponto_n).
Exemplo Prático (Baseado no seu TXT):
Ligação cod_identificacao_ligacao = 688670360266
Passo 1 (Índice 0):
Menu (fluxo_1[0]): Inicio_Ura_Seguros_Assistencias
Ponto (ponto_1[0]): 10023
Passo 2 (Índice 1):
Menu (fluxo_1[1]): Modulo_Dial_My_App
Ponto (ponto_1[1]): 10583
No banco de dados, isso se traduzirá em:
Você terá uma tabela de PassoNavegacao com uma coluna para o nomeMenu.
Você terá uma tabela de PontoMarcacao com uma coluna para o codigoPonto e uma chave estrangeira que aponta para o ID do PassoNavegacao correspondente.
Quando o usuário clicar no nó Inicio_Ura_Seguros_Assistencias (que representa a agregação de todos os IDs de PassoNavegacao com esse nome), o sistema consultará: Me dê todos os PontoMarcacao onde o PassoNavegacao.nomeMenu seja igual a 'Inicio_Ura_Seguros_Assistencias'.
