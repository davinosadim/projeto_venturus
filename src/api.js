/**
 * ============================================================================
 * MÓDULO DE COMUNICAÇÃO COM API EXTERNA (src/api.js)
 * ============================================================================
 * O QUE ESTE ARQUIVO FAZ?
 * Cuida exclusivamente de buscar uma frase inspiradora na internet usando a
 * API nativa `fetch()` do navegador e `async/await`.
 *
 * POR QUE SEPARAR EM UM ARQUIVO PRÓPRIO?
 * Se amanhã você quiser trocar a API por outra, basta alterar este arquivo!
 * O restante do sistema (`view.js` e `app.js`) continuará funcionando igual.
 * ============================================================================
 */

// URL da API pública e gratuita (não precisa de cadastro nem chave de acesso).
// Usamos `https://dummyjson.com/quotes/random` ou `https://api.adviceslip.com/advice`.
const API_URL = 'https://api.adviceslip.com/advice';

/**
 * FRASES LOCAIS DE RESERVA (Fallback):
 * Se o usuário estiver sem internet (offline) ou se o servidor da API cair,
 * sorteamos uma destas frases acolhedoras para a tela NUNCA ficar em branco!
 */
const FALLBACK_QUOTES = [
  {
    quote: 'Descansar também faz parte do progresso. Respire fundo e vá no seu próprio ritmo.',
    source: 'CareLog • Sabedoria Local'
  },
  {
    quote: 'Pequenos hábitos gentis repetidos todos os dias transformam a sua rotina.',
    source: 'CareLog • Sabedoria Local'
  },
  {
    quote: 'Hidrate-se, alongue os ombros e lembre-se: você não precisa resolver tudo de uma vez.',
    source: 'CareLog • Sabedoria Local'
  },
  {
    quote: 'Cuidar do seu ambiente e da sua mente é um ato de carinho com o seu eu de amanhã.',
    source: 'CareLog • Sabedoria Local'
  }
];

/**
 * Função auxiliar que sorteia uma frase local caso o usuário esteja offline.
 */
function getFallbackQuote() {
  // Math.random() gera um número entre 0 e 0.999...
  // Multiplicamos pelo tamanho da lista e usamos Math.floor() para arredondar para baixo.
  const indiceAleatorio = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[indiceAleatorio];
}

/**
 * BUSCAR FRASE DIÁRIA (fetchDailyQuote)
 *
 * CONCEITO-CHAVE: O que significam `async` e `await`?
 * Buscar dados na internet leva alguns milissegundos (ou segundos).
 * - `async` avisa ao JavaScript que esta função fará uma tarefa demorada (assíncrona).
 * - `await` pede para o JavaScript esperar a resposta chegar sem congelar a tela do usuário!
 */
export async function fetchDailyQuote() {
  // CONCEITO-CHAVE: Por que usar `try / catch`?
  // Quando dependemos da internet, muita coisa pode falhar (Wi-Fi desconectado,
  // servidor fora do ar). O bloco `try` tenta buscar na internet; se der qualquer
  // erro, o programa pula imediatamente para o bloco `catch` sem travar o aplicativo!
  try {
    // 1. Fazemos o pedido (requisição HTTP GET) para a API.
    // O parâmetro `{ cache: 'no-store' }` pede ao navegador para buscar uma frase
    // fresquinha sempre que o usuário clicar em "Nova".
    const resposta = await fetch(API_URL, { cache: 'no-store' });

    // 2. Verificamos se o servidor respondeu com sucesso (código HTTP 200-299).
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    // 3. Lemos o corpo da resposta e convertemos de texto JSON para Objeto JS.
    // A API Advice Slip devolve um objeto no formato:
    // { slip: { id: 42, advice: "Take time to know yourself." } }
    const dados = await resposta.json();

    // 4. Verificamos se a frase veio preenchida corretamente.
    if (dados && dados.slip && dados.slip.advice) {
      return {
        quote: `"${dados.slip.advice}"`,
        source: `Conselho #${dados.slip.id} • via Advice Slip API`
      };
    }

    // Se o formato vier diferente do esperado, usamos a frase local.
    return getFallbackQuote();
  } catch (erro) {
    // Se estiver offline ou a API falhar, registramos um aviso amigável no console
    // e retornamos nossa frase local de autocuidado!
    console.warn('Modo offline ou API indisponível. Carregando frase local de autocuidado:', erro.message);
    return getFallbackQuote();
  }
}
