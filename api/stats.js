const https = require('https');

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvRequest(commands) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(commands);
        const url = new URL(KV_URL + '/pipeline');
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KV_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function kvGet(key) {
    return new Promise((resolve, reject) => {
        const url = new URL(KV_URL + '/get/' + key);
        const req = https.request(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${KV_TOKEN}` }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function kvSet(key, value) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(["SET", key, value]);
        const url = new URL(KV_URL);
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KV_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const key = req.query.key;
    if (key !== (process.env.STATS_KEY || 'mirror2026')) {
        return res.status(403).json({ error: 'forbidden' });
    }

    if (!KV_URL || !KV_TOKEN) {
        return res.status(500).json({ error: 'KV not configured' });
    }

    try {
        if (req.method === 'POST' && req.body?.visit) {
            const v = req.body.visit;
            const today = new Date().toISOString().slice(0, 10);
            const userKey = `user:${v.userId}`;
            const dayKey = `day:${today}`;

            const existing = await kvGet(userKey);
            const userData = existing?.result ? JSON.parse(existing.result) : { name: v.name, username: v.username, visits: 0, firstVisit: today, lastVisit: today };
            userData.visits++;
            userData.lastVisit = today;
            userData.name = v.name || userData.name;
            userData.username = v.username || userData.username;

            await kvSet(userKey, JSON.stringify(userData));

            const dayData = await kvGet(dayKey);
            const dayCount = dayData?.result ? parseInt(dayData.result) + 1 : 1;
            await kvSet(dayKey, String(dayCount));

            const allUsers = await kvGet('all_users');
            let userList = allUsers?.result ? JSON.parse(allUsers.result) : [];
            if (!userList.includes(String(v.userId))) {
                userList.push(String(v.userId));
                await kvSet('all_users', JSON.stringify(userList));
            }

            return res.status(200).json({ ok: true });
        }

        // GET stats
        const allUsers = await kvGet('all_users');
        const userIds = allUsers?.result ? JSON.parse(allUsers.result) : [];

        const users = [];
        for (const uid of userIds) {
            const ud = await kvGet(`user:${uid}`);
            if (ud?.result) {
                const data = JSON.parse(ud.result);
                users.push({ id: uid, ...data });
            }
        }

        const today = new Date().toISOString().slice(0, 10);
        const days = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dk = d.toISOString().slice(0, 10);
            const dc = await kvGet(`day:${dk}`);
            days[dk] = dc?.result ? parseInt(dc.result) : 0;
        }

        res.status(200).json({
            totalUsers: userIds.length,
            totalVisits: users.reduce((s, u) => s + u.visits, 0),
            days,
            users: users.sort((a, b) => b.visits - a.visits)
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: 'server error' });
    }
};
