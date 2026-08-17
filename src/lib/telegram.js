/**
 * Avisos por Telegram. Vive en lib/ y no en publish.js a propósito: publish.js
 * tiene código de nivel superior que publica al importarlo, así que cualquier
 * otro comando que quisiera avisar habría disparado una publicación.
 *
 * Si no hay TG_BOT_TOKEN y TG_CHAT_ID, `notify` no hace nada y no rompe: los
 * avisos son opcionales y nunca deben tumbar al que los llama.
 */

const TOKEN = process.env.TG_BOT_TOKEN;
const CHAT = process.env.TG_CHAT_ID;

export const configurado = Boolean(TOKEN && CHAT);

export async function tg(metodo, body) {
  if (!configurado) throw new Error('Falta TG_BOT_TOKEN o TG_CHAT_ID en .env');
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, ...body }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${metodo}: ${data.description}`);
  return data.result;
}

/** Aviso best-effort: si Telegram falla, se reporta pero no se propaga. */
export async function notify(text) {
  if (!configurado) return false;
  try {
    await tg('sendMessage', { text, disable_web_page_preview: true });
    return true;
  } catch (e) {
    console.error(`No se pudo avisar por Telegram: ${e.message}`);
    return false;
  }
}

export async function askApproval(post, minutes = 45) {
  await tg('sendMessage', {
    text: `Toca publicar: ${post.meta.slug}\n\n${'—'.repeat(20)}\n\n${post.body}`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Publicar', callback_data: `go:${post.meta.slug}` },
          { text: 'Saltar hoy', callback_data: `no:${post.meta.slug}` },
        ],
      ],
    },
  });

  const deadline = Date.now() + minutes * 60_000;
  let offset = 0;
  console.log(`Esperando tu respuesta en Telegram (hasta ${minutes} min)...`);

  while (Date.now() < deadline) {
    const updates = await tg('getUpdates', { offset, timeout: 30 });
    for (const u of updates) {
      offset = u.update_id + 1;
      const cb = u.callback_query;
      // Comparación exacta, no endsWith: dos slugs donde uno es sufijo del otro
      // habrían respondido al botón equivocado.
      if (cb?.data !== `go:${post.meta.slug}` && cb?.data !== `no:${post.meta.slug}`) continue;
      await tg('answerCallbackQuery', { callback_query_id: cb.id });
      return cb.data.startsWith('go:');
    }
  }
  console.log('Se venció el tiempo de espera. No se publicó nada.');
  return false;
}
