/**
 * ============================================================================
 * MÓDULO DE ESTADO E PERSISTÊNCIA (src/state.js)
 * ============================================================================
 * O QUE ESTE ARQUIVO FAZ?
 * Este arquivo cuida UNICAMENTE dos dados (tarefas de autocuidado) da aplicação.
 * Ele NÃO sabe nada sobre HTML, cores ou cliques de botão (Separation of Concerns).
 *
 * Sua única responsabilidade é:
 * 1. Ler as tarefas salvas no navegador (localStorage);
 * 2. Salvar alterações no navegador;
 * 3. Adicionar, alternar status (concluída/pendente) e remover tarefas.
 * ============================================================================
 */

// Nome da "gaveta" onde guardamos nossas tarefas dentro do localStorage do navegador.
const STORAGE_KEY = 'carelog_tasks_v1';

/**
 * TAREFAS PADRÃO DE AUTOCUIDADO:
 * Caso o usuário esteja abrindo o CareLog pela primeira vez (localStorage vazio),
 * inicializamos com 3 hábitos leves para ele já ver a aplicação funcionando!
 */
const DEFAULT_TASKS = [
  {
    id: 'padrao-1',
    category: 'Corpo',
    title: "Beber 1 copo d'água ao acordar.",
    completed: false
  },
  {
    id: 'padrao-2',
    category: 'Mente',
    title: 'Fazer 5 minutos de respiração ou pausa sem telas.',
    completed: false
  },
  {
    id: 'padrao-3',
    category: 'Ambiente',
    title: 'Organizar a mesa de trabalho no final do dia.',
    completed: false
  }
];

/**
 * 1. OBTER TAREFAS (getTasks)
 * Lê a lista de tarefas salva no localStorage.
 * Se for a primeira visita do usuário, salva e devolve as 3 tarefas padrão.
 */
export function getTasks() {
  try {
    // localStorage.getItem() busca o texto salvo na chave 'carelog_tasks_v1'.
    // Se nunca salvamos nada antes, ele retorna `null`.
    const textoSalvo = localStorage.getItem(STORAGE_KEY);

    if (textoSalvo === null) {
      // Primeira visita! Salvamos as tarefas padrão no navegador e as retornamos.
      saveTasks(DEFAULT_TASKS);
      // Usamos o operador spread [...] para devolver uma cópia limpa da lista.
      return [...DEFAULT_TASKS];
    }

    // POR QUE USAMOS JSON.parse()?
    // O localStorage só consegue guardar TEXTO puro (strings).
    // O JSON.parse() transforma o texto salvo (ex: '[{"id":"1","title":"..."}]')
    // de volta em um Array de Objetos de verdade que o JavaScript consegue manipular!
    const tarefasConvertidas = JSON.parse(textoSalvo);

    // Verificação de segurança: garantimos que o dado lido realmente é uma lista (Array).
    if (Array.isArray(tarefasConvertidas)) {
      return tarefasConvertidas;
    }

    return [...DEFAULT_TASKS];
  } catch (erro) {
    // Se alguém alterou o localStorage manualmente e corrompeu o JSON,
    // o bloco catch impede que o site trave e devolve a lista padrão.
    console.error('Erro ao ler tarefas do localStorage:', erro);
    return [...DEFAULT_TASKS];
  }
}

/**
 * 2. SALVAR TAREFAS (saveTasks)
 * Recebe o Array atualizado de tarefas e grava no localStorage.
 */
export function saveTasks(tasks) {
  try {
    // POR QUE USAMOS JSON.stringify()?
    // Se tentarmos salvar um Array direto no localStorage, o JavaScript converte
    // tudo para o texto inútil "[object Object]".
    // O JSON.stringify(tasks) empacota nosso Array de objetos em uma string JSON válida!
    const textoJson = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, textoJson);
  } catch (erro) {
    console.error('Não foi possível salvar as tarefas no localStorage:', erro);
  }
}

/**
 * 3. ADICIONAR TAREFA (addTask)
 * Cria um novo objeto de tarefa, coloca na lista, salva no localStorage
 * e retorna a lista atualizada.
 */
export function addTask(title, category = 'Corpo') {
  const tarefasAtuais = getTasks();

  // Criamos um novo objeto representando o hábito de autocuidado.
  // Usamos Date.now().toString() para gerar um ID único baseado no milissegundo atual.
  const novaTarefa = {
    id: `care-${Date.now()}`,
    category: category,
    title: title.trim(), // .trim() remove espaços vazios acidentais no começo e no fim
    completed: false     // Toda nova tarefa nasce como pendente (false)
  };

  // Criamos um novo array contendo as tarefas antigas + a nova tarefa no final.
  const listaAtualizada = [...tarefasAtuais, novaTarefa];

  // Persistimos no localStorage e devolvemos a lista nova para o controlador.
  saveTasks(listaAtualizada);
  return listaAtualizada;
}

/**
 * 4. ALTERNAR STATUS DA TAREFA (toggleTask)
 * Marca uma tarefa pendente como concluída (ou vice-versa) quando clicada.
 */
export function toggleTask(taskId) {
  const tarefasAtuais = getTasks();

  // CONCEITO-CHAVE: Método .map()
  // O .map() percorre cada tarefa da lista e cria uma nova lista do mesmo tamanho.
  // Quando encontramos a tarefa que tem o mesmo ID clicado pelo usuário:
  // invertemos o valor de `completed` usando o ponto de exclamação `!` (NOT lógico).
  // Ou seja: se era `false`, vira `true`. Se era `true`, vira `false`!
  const listaAtualizada = tarefasAtuais.map((tarefa) => {
    if (tarefa.id === taskId) {
      return {
        ...tarefa,                  // Copia id, category e title iguais
        completed: !tarefa.completed // Inverte apenas o status de conclusão
      };
    }
    return tarefa; // As outras tarefas continuam exatamente como estavam
  });

  saveTasks(listaAtualizada);
  return listaAtualizada;
}

/**
 * 5. REMOVER TAREFA (removeTask)
 * Exclui uma tarefa da lista usando seu ID.
 */
export function removeTask(taskId) {
  const tarefasAtuais = getTasks();

  // CONCEITO-CHAVE: Método .filter()
  // O .filter() cria uma nova lista mantendo APENAS os itens que passarem no teste.
  // Aqui dizemos: "Mantenha todas as tarefas cujo ID seja DIFERENTE (!==) do ID excluído".
  const listaAtualizada = tarefasAtuais.filter((tarefa) => tarefa.id !== taskId);

  saveTasks(listaAtualizada);
  return listaAtualizada;
}

/**
 * 6. RESTAURAR TAREFAS PADRÃO (resetDefaultTasks)
 * Permite ao usuário voltar às 3 tarefas iniciais de autocuidado quando quiser.
 */
export function resetDefaultTasks() {
  const copiaPadrao = DEFAULT_TASKS.map((tarefa) => ({ ...tarefa }));
  saveTasks(copiaPadrao);
  return copiaPadrao;
}
