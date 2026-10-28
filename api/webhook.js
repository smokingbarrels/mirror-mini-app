const https = require('https');

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = 'https://smokingbarrels.github.io/mirror-mini-app/';

function sendMessage(chatId, text, replyMarkup) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            ...(replyMarkup && { reply_markup: replyMarkup })
        });
        const url = new URL(`https://api.telegram.org/bot${TOKEN}/sendMessage`);
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '1225606022';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    try {
        const body = req.body;

        // Order from mini-app
        if (body.order) {
            await sendMessage(ADMIN_CHAT_ID, body.order.text);
            return res.status(200).json({ ok: true });
        }

        // Telegram webhook update
        const msg = body.message;
        if (msg && msg.text === '/start') {
            const firstName = msg.from.first_name || '';
            await sendMessage(msg.chat.id,
                `The world is a mirror that never lies: It doesn't give you what you want, but what you are.\n\nПривет, ${firstName} 🪞`,
                {
                    inline_keyboard: [[
                        { text: '🛍 Открыть магазин', web_app: { url: WEBAPP_URL } }
                    ]]
                }
            );
        }

        res.status(200).send('OK');
    } catch (e) {
        console.error(e);
        res.status(200).send('OK');
    }
};
