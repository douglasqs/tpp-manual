# Manual TPP Hikvision

Site estático em português para orientar parceiros de tecnologia no uso do portal TPP. O conteúdo foi adaptado dos cinco PDFs fornecidos pelo usuário e atualizado com capturas do portal em 2026. Algumas telas dos materiais originais podem ter mudado.

## Publicar gratuitamente no GitHub Pages

1. No GitHub, crie um repositório **público** chamado `tpp-manual`.
2. Envie `index.html`, `styles.css`, `script.js`, `companies-data.js` e as pastas `assets/`, `downloads/`, `scripts/` e `.github/workflows/` para a raiz da branch `main` (não envie apenas o ZIP).
3. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**. O fluxo `.github/workflows/update-companies.yml` publica o site após atualizar os dados.
4. Após a publicação, abra `https://douglasqs.github.io/tpp-manual/`.

O site não depende de Node, servidor ou chave de API. Para pré-visualizar localmente, abra `index.html` no navegador.

O layout se adapta a computadores, tablets e celulares. O menu destaca o capítulo em leitura e, em telas menores, abre pelo botão **Índice**. É possível fechá-lo com **Esc**, pelo botão de fechar, pelo fundo ou ao escolher um capítulo. As animações respeitam a preferência de movimento reduzido do dispositivo. Sem JavaScript, os links do índice e todo o conteúdo continuam disponíveis.

## Empresas parceiras

A página **Empresas parceiras**, no índice, mostra apenas as linhas com integração **SIM**, permite buscar por nome fantasia ou razão social e expandir cada empresa para consultar os produtos homologados informados. O GitHub Actions executa `.github/workflows/update-companies.yml` a cada envio para `main` e diariamente, com agendamento para 08:15 UTC (05:15 no horário de Brasília; o GitHub pode atrasar a execução). O fluxo baixa o CSV e a exportação XLSX (para preservar hiperlinks de produtos), testa a leitura, atualiza `companies-data.js` quando encontra mudanças e publica os arquivos diretamente no GitHub Pages. Também é possível executar o fluxo manualmente em **Actions → Atualizar empresas parceiras → Run workflow**. Na cópia consultada, 46 empresas estavam marcadas como SIM, e 23 tinham produtos preenchidos.

A publicação requer **Settings → Pages → Source → GitHub Actions**. O envio automático de um commit com `GITHUB_TOKEN` não dispara a publicação por branch, por isso o próprio fluxo envia o artefato e executa a publicação. A leitura aceita as colunas `RAZÃO SOCIAL` e `RAZÃO SOCIAL corrigido`, com tolerância a espaços e maiúsculas/minúsculas. Se uma coluna obrigatória desaparecer ou não houver empresas com integração **SIM**, a execução falha sem sobrescrever a lista existente.

Para validar a leitura localmente, execute `python -B -m unittest discover -s scripts -p 'test_*.py' -v`. Para baixar a planilha e regenerar a lista, execute `python -B scripts/update_companies.py`.

## Contador de visitas

O rodapé exibe um contador discreto fornecido pelo [Hits](https://github.com/silentsoft/hits). O serviço mantém a contagem compartilhada de acessos desde a ativação do contador; ela não representa visitantes únicos nem recupera visitas anteriores.

O contador só é carregado em `https://douglasqs.github.io/tpp-manual/` (incluindo a variante `index.html`), com JavaScript habilitado. Prévias locais não entram na contagem. Se o serviço estiver indisponível ou bloqueado, o contador fica oculto e o manual continua funcionando. Não há chave de API no site. Caso o endereço de publicação mude, atualize a verificação de endereço em `script.js` e o endereço do contador em `index.html`.

## Revisão antes da divulgação

Confira a redação, a autorização de uso das capturas e os caminhos dos menus no TPP atual antes de divulgar o manual aos clientes.
