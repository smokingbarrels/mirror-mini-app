# mirror.mirror.o — Telegram Mini App

## Что это
Магазин одежды в виде Telegram Mini App. Каталог, избранное, корзина, оформление заявок, история заказов, панель статистики.

## Структура проекта

```
mirror-app/
├── index.html          — Точка входа (SPA)
├── stats.html          — Панель статистики (для админа)
├── css/styles.css      — Стили
├── js/data.js          — Данные товаров (каталог)
├── js/app.js           — Логика приложения
├── api/webhook.js      — Vercel serverless: бот + заявки
├── api/stats.js        — Vercel serverless: аналитика
├── assets/img/         — Фото товаров
├── vercel.json         — Конфигурация Vercel
└── .env                — Токен бота (НЕ коммитить!)
```

## Хостинг

- **Frontend (магазин):** GitHub Pages — https://smokingbarrels.github.io/mirror-mini-app/
- **Backend (бот + API):** Vercel — https://mirror-mini-app.vercel.app/
- **База (статистика):** Upstash Redis (бесплатно)

## Как запустить с нуля

### 1. Telegram бот
1. Создай бота в @BotFather → `/newbot`
2. Получи токен бота
3. В @BotFather → `/setmenubutton` → выбери бота → отправь URL магазина

### 2. GitHub
1. Создай репозиторий, залей код
2. Settings → Pages → Source: Deploy from branch → `main` → Save
3. Подожди 2 минуты, сайт будет на `https://<username>.github.io/<repo>/`

### 3. Vercel
1. Зайди на vercel.com → Import Git Repository → выбери репозиторий
2. Environment Variables — добавь:
   - `BOT_TOKEN` = токен бота из BotFather
3. Deploy

### 4. Upstash Redis (для статистики)
1. Зайди на upstash.com → Create Database
2. Name: любое, Region: US-East-1
3. Скопируй `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`
4. В Vercel → Settings → Environment Variables → добавь:
   - `KV_REST_API_URL` = URL из Upstash
   - `KV_REST_API_TOKEN` = Token из Upstash
5. Redeploy проект в Vercel

### 5. Регистрация webhook бота
Открой в браузере (подставь свой токен и URL):
```
https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://<vercel-домен>/api/webhook
```

## Как управлять

### Добавить/изменить товар
Редактируй файл `js/data.js`:
```javascript
{
    id: 3,                    // уникальный номер
    name: 'Название',
    price: 100,               // цена в BYN
    images: ['assets/img/photo1.png', 'assets/img/photo2.png'],
    category: 'longsleeves',  // категория
    sizes: ['S', 'M', 'L'],
    shippingDays: 10,
    description: 'Описание товара'
}
```
После изменений: bump версию в index.html (`?v=N+1`), commit, push.

### Добавить категорию
В `js/data.js` массив `CATEGORIES`:
```javascript
{ value: 'hoodies', label: 'Худи' }
```

### Изменить кому приходят заявки
В `api/webhook.js`:
- `ADMIN_CHAT_ID` — основной админ
- `SUPPORT_CHAT_ID` — поддержка

### Панель статистики
```
https://<github-pages-url>/stats.html?key=mirror2026
```
Ключ `mirror2026` можно изменить в `api/stats.js` (переменная `STATS_KEY`).

### Кеширование
После каждого обновления JS/CSS файлов — увеличь версию в `index.html`:
```html
<link rel="stylesheet" href="css/styles.css?v=25">
<script src="js/data.js?v=25"></script>
<script src="js/app.js?v=25"></script>
```

## Текущие настройки
- Валюта: BYN
- Админ chat ID: 1225606022
- Поддержка chat ID: 6287602044
- Ссылка поддержки: t.me/mirshvv
- Ключ статистики: mirror2026

## Стек
- HTML/CSS/JS (без фреймворков)
- Telegram Web App SDK
- Vercel Serverless Functions (Node.js)
- Upstash Redis (REST API)
- GitHub Pages
