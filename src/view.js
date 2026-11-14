/**
 * ============================================================================
 * MÓDULO DE VISÃO / INTERFACE DO USUÁRIO (src/view.js)
 * ============================================================================
 * O QUE ESTE ARQUIVO FAZ?
 * Este arquivo cuida UNICAMENTE do DOM (Document Object Model), ou seja, de
 * desenhar e atualizar os elementos visuais na tela do navegador.
 *
 * POR QUE NÃO MISTURAR COM O localStorage?
 * Porque separar "quem guarda os dados" (`state.js`) de "quem desenha na tela"
 * (`view.js`) deixa o código muito mais fácil de entender e consertar!
 * ============================================================================
 */

/**
 * 1. RENDERIZAR LISTA DE TAREFAS (renderTasks)
 *
 * CONCEITO-CHAVE: Como funciona o fluxo de renderização do DOM?
 * Sempre que uma tarefa é adicionada, concluída ou removida:
 * 1º Limpamos a lista `<ul>` antiga na tela;
 * 2º Percorremos o Array atualizado de tarefas;
 * 3º Criamos um elemento `<li>` novo para cada tarefa usando `document.createElement`;
 * 4º Inserimos cada `<li>` dentro da `<ul>` e atualizamos a barra de HP!
 *
 * @param {Array} tasks - Lista de objetos de tarefas vindos do state.js
 * @param {Function} onToggle - Função chamada quando o usuário clica para concluir/desmarcar
 * @param {Function} onRemove - Função chamada quando o usuário clica na lixeira/X
 */
export function renderTasks(tasks, onToggle, onRemove) {
  const listaUl = document.getElementById('care-list');
  const estadoVazio = document.getElementById('empty-state');

  // Passo 1: Limpamos o conteúdo atual da <ul> para não duplicar itens na tela.
  listaUl.innerHTML = '';

  // Passo 2: Se não houver nenhuma tarefa, mostramos o aviso acolhedor de lista vazia.
  if (tasks.length === 0) {
    estadoVazio.hidden = false;
    updateProgressBar(tasks);
    return;
  }

  // Se há tarefas, escondemos o aviso de lista vazia.
  estadoVazio.hidden = true;

  // Passo 3: Percorremos cada tarefa para construir seu HTML de forma segura.
  tasks.forEach((tarefa) => {
    // Criamos o item da lista: <li class="care-item">
    const itemLi = document.createElement('li');
    itemLi.className = 'care-item';

    // Se a tarefa já estiver concluída, adicionamos a classe CSS `.is-completed`
    // que deixa o fundo verde suave e risca o texto!
    if (tarefa.completed) {
      itemLi.classList.add('is-completed');
    }

    // Criamos a área esquerda (clicável para marcar/desmarcar a tarefa)
    const areaEsquerda = document.createElement('div');
    areaEsquerda.className = 'care-item-left';

    // Botão de Check estilo Pixel Art
    const botaoCheck = document.createElement('button');
    botaoCheck.type = 'button';
    botaoCheck.className = 'task-check-btn';
    botaoCheck.setAttribute(
      'aria-label',
      tarefa.completed ? `Desmarcar "${tarefa.title}"` : `Concluir "${tarefa.title}"`
    );
    botaoCheck.textContent = tarefa.completed ? '✓' : '';

    // Etiqueta (Badge) da Categoria: [Corpo], [Mente] ou [Ambiente]
    const badgeCategoria = document.createElement('span');
    const categoriaNormalizada = (tarefa.category || 'Corpo').toLowerCase();
    badgeCategoria.className = `category-badge category-${categoriaNormalizada}`;
    badgeCategoria.textContent = `[${tarefa.category || 'Corpo'}]`;

    // Texto da tarefa
    // POR QUE USAR .textContent EM VEZ DE .innerHTML?
    // Usar .textContent garante que, se o usuário digitar símbolos como "<script>",
    // o navegador trate isso apenas como texto comum e nunca como código malicioso!
    const textoSpan = document.createElement('span');
    textoSpan.className = 'care-text';
    textoSpan.textContent = tarefa.title;

    // Clicar em qualquer lugar da área esquerda (botão check, categoria ou texto)
    // chama a função `onToggle` passando o ID desta tarefa específica.
    areaEsquerda.addEventListener('click', () => {
      onToggle(tarefa.id);
    });

    // Montamos a área esquerda colocando o botão, a categoria e o texto dentro dela
    areaEsquerda.appendChild(botaoCheck);
    areaEsquerda.appendChild(badgeCategoria);
    areaEsquerda.appendChild(textoSpan);

    // Criamos o botão de excluir tarefa (lado direito)
    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'task-delete-btn';
    botaoRemover.title = 'Remover tarefa';
    botaoRemover.setAttribute('aria-label', `Remover tarefa "${tarefa.title}"`);
    botaoRemover.textContent = '✕';

    botaoRemover.addEventListener('click', () => {
      onRemove(tarefa.id);
    });

    // Juntamos o lado esquerdo e o botão de remover dentro do <li>
    itemLi.appendChild(areaEsquerda);
    itemLi.appendChild(botaoRemover);

    // Finalmente, colocamos o <li> pronto dentro da lista <ul> na tela!
    listaUl.appendChild(itemLi);
  });

  // Passo 4: Sempre que a lista muda, atualizamos também a barra de HP do dia!
  updateProgressBar(tasks);
}

/**
 * 2. ATUALIZAR BARRA DE PROGRESSO ("HP DE AUTOCUIDADO DO DIA")
 * Calcula quantas tarefas foram concluídas e anima a barra de progresso.
 */
export function updateProgressBar(tasks) {
  const barraPreenchimento = document.getElementById('hp-bar-fill');
  const barraContainer = document.getElementById('hp-progressbar');
  const textoStatusNumeros = document.getElementById('hp-stats');
  const mensagemMotivacional = document.getElementById('hp-status-message');

  const totalTarefas = tasks.length;

  // Usamos .filter() para contar apenas as tarefas onde `completed` é `true`.
  const totalConcluidas = tasks.filter((tarefa) => tarefa.completed).length;

  // Calculamos a porcentagem (evitando divisão por zero se a lista estiver vazia).
  const porcentagem = totalTarefas === 0
    ? 0
    : Math.round((totalConcluidas / totalTarefas) * 100);

  // Atualizamos a largura visual da barra no CSS (ex: "67%")
  barraPreenchimento.style.width = `${porcentagem}%`;
  barraContainer.setAttribute('aria-valuenow', String(porcentagem));

  // Atualizamos o contador ao lado do título (ex: "2/3 (67% HP)")
  textoStatusNumeros.textContent = `${totalConcluidas}/${totalTarefas} (${porcentagem}% HP)`;

  // Escolhemos uma mensagem acolhedora de acordo com o progresso do dia
  if (totalTarefas === 0) {
    mensagemMotivacional.textContent = 'Adicione pequenas missões gentis para recarregar seu HP hoje.';
  } else if (porcentagem === 0) {
    mensagemMotivacional.textContent = '🌱 Seu dia está começando. Que tal escolher um cuidado leve agora?';
  } else if (porcentagem < 50) {
    mensagemMotivacional.textContent = '🍵 Bom começo! Cada pequeno gesto já faz diferença no seu bem-estar.';
  } else if (porcentagem < 100) {
    mensagemMotivacional.textContent = '✨ Quase lá! Sua energia de autocuidado está ficando bem alta!';
  } else {
    mensagemMotivacional.textContent = '👑 HP MÁXIMO! Você concluiu todos os seus rituais de autocuidado de hoje!';
  }
}

/**
 * 3. EXIBIR FRASE DIÁRIA NA TELA (renderQuote)
 * Atualiza o bloco de citação com a frase retornada pela `api.js`.
 */
export function renderQuote({ quote, source }) {
  const elementoFrase = document.getElementById('daily-quote');
  const elementoFonte = document.getElementById('quote-source');

  elementoFrase.textContent = quote;
  elementoFonte.textContent = source || '';
}
