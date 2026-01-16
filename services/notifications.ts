
import { getEnv } from '../utils/env';

export const isTelegramConfigured = () => {
  const token = getEnv('VITE_TELEGRAM_BOT_TOKEN');
  const chatId = getEnv('VITE_TELEGRAM_CHAT_ID');
  return !!(token && chatId);
};

export const sendTelegramNotification = async (channel: string, message: string) => {
  const token = getEnv('VITE_TELEGRAM_BOT_TOKEN');
  const chatId = getEnv('VITE_TELEGRAM_CHAT_ID');
  
  if (!token || !chatId) {
    console.warn(`[Surveillance Offline] Sinyal Telegram terputus untuk: ${channel}`);
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `<b>[${channel}]</b>\n\n${message}`,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error("[Telegram Error] Transmisi gagal:", e);
  }
};
