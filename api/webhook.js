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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    try {
        const update = req.body;
        const msg = update.message;

        if (msg && msg.text === '/start') {
            const firstName = msg.from.first_name || '';
            await sendMessage(msg.chat.id,
                `Привет, ${firstName}!\n\nmirror.mirror.o — твой стиль.\n\nНажми кнопку ниже, чтобы открыть каталог.`,
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
