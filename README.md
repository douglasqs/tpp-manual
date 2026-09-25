# Manual TPP Hikvision

Site estático em português para orientar parceiros de tecnologia no uso do portal TPP. O conteúdo foi adaptado dos cinco PDFs fornecidos pelo usuário e atualizado com capturas do portal em 2026. Algumas telas dos materiais originais podem ter mudado.

## Publicar gratuitamente no GitHub Pages

1. No GitHub, crie um repositório **público** chamado `tpp-manual`.
2. Envie `index.html`, `styles.css`, `script.js` e as pastas `assets/` e `downloads/` para a raiz da branch `main` (não envie apenas o ZIP).
3. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
4. Após a publicação, abra `https://douglasqs.github.io/tpp-manual/`.

O site não depende de Node, servidor ou chave de API. Para pré-visualizar localmente, abra `index.html` no navegador.

O layout se adapta a computadores, tablets e celulares. O menu destaca o capítulo em leitura e, em telas menores, abre pelo botão **Índice**. É possível fechá-lo com **Esc**, pelo botão de fechar, pelo fundo ou ao escolher um capítulo. As animações respeitam a preferência de movimento reduzido do dispositivo. Sem JavaScript, os links do índice e todo o conteúdo continuam disponíveis.

## Contador de visitas

O rodapé exibe um contador discreto fornecido pelo [Hits](https://github.com/silentsoft/hits). O serviço mantém a contagem compartilhada de acessos desde a ativação do contador; ela não representa visitantes únicos nem recupera visitas anteriores.

O contador só é carregado em `https://douglasqs.github.io/tpp-manual/` (incluindo a variante `index.html`), com JavaScript habilitado. Prévias locais não entram na contagem. Se o serviço estiver indisponível ou bloqueado, o contador fica oculto e o manual continua funcionando. Não há chave de API no site. Caso o endereço de publicação mude, atualize a verificação de endereço em `script.js` e o endereço do contador em `index.html`.

## Revisão antes da divulgação

Confira a redação, a autorização de uso das capturas e os caminhos dos menus no TPP atual antes de divulgar o manual aos clientes.
