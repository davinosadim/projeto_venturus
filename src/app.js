/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DA APLICAÇÃO (src/app.js)
 * ============================================================================
 * O QUE ESTE ARQUIVO FAZ?
 * Ele é o "maestro" (Controlador) do CareLog!
 * Ele não guarda dados sozinho (isso é trabalho do `state.js`), nem cria tags
 * HTML manualmente (isso é trabalho do `view.js`), nem chama o `fetch` direto
 * (isso é trabalho do `api.js`).
 *
 * O papel do `app.js` é:
 * 1. Escutar as ações do usuário (envio do formulário, cliques em botões);
 * 2. Pedir para o `state.js` atualizar os dados no `localStorage`;
 * 3. Passar os dados atualizados para o `view.js` redesenhar a tela!
 * ============================================================================
 */

import { getTasks, addTask, toggleTask, removeTask, resetDefaultTasks } from './state.js';
import { renderTasks, renderQuote } from './view.js';
import { fetchDailyQuote } from './api.js';

/**
 * FUNÇÃO CENTRAL DE ATUALIZAÇÃO DA TELA (refreshAppView)
 * Sempre que os dados mudam, chamamos esta função passando a lista atualizada.
 * Ela entrega para a `renderTasks` tanto a lista de tarefas quanto as duas
 * funções de "retorno" (callbacks) que devem rodar quando o usuário clicar
 * em concluir (`handleToggleTask`) ou em excluir (`handleRemoveTask`).
 */
function refreshAppView(tasks) {
  renderTasks(tasks, handleToggleTask, handleRemoveTask);
}

/**
 * QUANDO O USUÁRIO CLICA PARA CONCLUIR / DESMARCAR UMA TAREFA:
 * 1. Pede ao `state.js` para inverter o `completed` daquela tarefa no localStorage;
 * 2. Recebe a lista atualizada e pede para a `view.js` redesenhar a tela.
 */
function handleToggleTask(taskId) {
  const tarefasAtualizadas = toggleTask(taskId);
  refreshAppView(tarefasAtualizadas);
}

/**
 * QUANDO O USUÁRIO CLICA NO BOTÃO "✕" PARA REMOVER UMA TAREFA:
 * 1. Pede ao `state.js` para filtrar e remover a tarefa do localStorage;
 * 2. Recebe a lista atualizada e pede para a `view.js` redesenhar a tela.
 */
function handleRemoveTask(taskId) {
  const tarefasAtualizadas = removeTask(taskId);
  refreshAppView(tarefasAtualizadas);
}

/**
 * CARREGAR FRASE DO DIA (loadDailyQuote)
 * Chama o módulo `api.js` de forma assíncrona e exibe o resultado na `view.js`.
 */
async function loadDailyQuote() {
  renderQuote({
    quote: 'Buscando uma mensagem gentil para o seu dia...',
    source: ''
  });

  const dadosFrase = await fetchDailyQuote();
  renderQuote(dadosFrase);
}

/**
 * INICIALIZAÇÃO DA APLICAÇÃO (initApp)
 * Configura os ouvintes de eventos (Event Listeners) e faz a primeira
 * renderização assim que a página carrega.
 */
function initApp() {
  const formulario = document.getElementById('care-form');
  const campoTexto = document.getElementById('care-input');
  const seletorCategoria = document.getElementById('care-category');
  const botaoNovaFrase = document.getElementById('refresh-quote-btn');
  const botaoRestaurarPadrao = document.getElementById('reset-defaults-btn');

  // 1. Carregamos as tarefas salvas no localStorage (ou as 3 tarefas padrão na 1ª visita)
  const tarefasIniciais = getTasks();
  refreshAppView(tarefasIniciais);

  // 2. Buscamos a frase inspiradora do dia na API gratuita
  loadDailyQuote();

  // 3. Ouvinte de Envio do Formulário (<form> submit event)
  formulario.addEventListener('submit', (evento) => {
    // CONCEITO-CHAVE: Por que usamos `evento.preventDefault()`?
    // Por padrão, desde os anos 90, quando um formulário HTML é enviado,
    // o navegador tenta enviar os dados para outro servidor e RECARREGA a página inteira!
    // Como nossa aplicação roda 100% no navegador com JavaScript, usamos
    // `evento.preventDefault()` para dizer: "Navegador, não recarregue a página!
    // Deixe que o nosso JavaScript cuida de salvar a tarefa".
    evento.preventDefault();

    const tituloDigitado = campoTexto.value.trim();
    const categoriaEscolhida = seletorCategoria.value;

    // Se o usuário digitou apenas espaços em branco, não adicionamos nada.
    if (!tituloDigitado) {
      campoTexto.focus();
      return;
    }

    // Adicionamos a nova tarefa no estado (localStorage) e redesenhamos a tela!
    const tarefasAtualizadas = addTask(tituloDigitado, categoriaEscolhida);
    refreshAppView(tarefasAtualizadas);

    // Limpamos apenas o campo de texto e devolvemos o cursor (foco) para ele,
    // facilitando adicionar várias tarefas seguidas usando apenas o teclado!
    campoTexto.value = '';
    campoTexto.focus();
  });

  // 4. Botão para buscar uma nova frase inspiradora na API
  botaoNovaFrase.addEventListener('click', () => {
    loadDailyQuote();
  });

  // 5. Botão para restaurar as 3 tarefas padrão de autocuidado
  botaoRestaurarPadrao.addEventListener('click', () => {
    const tarefasPadrao = resetDefaultTasks();
    refreshAppView(tarefasPadrao);
  });
}

// Inicia o CareLog!
initApp();
