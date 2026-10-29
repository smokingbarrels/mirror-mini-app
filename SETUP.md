# mirror.mirror.o — Telegram Mini App

## Что это
Магазин одежды бренда mirror.mirror.o в виде Telegram Mini App.
Каталог товаров, избранное, корзина, оформление заявок, история заказов, панель статистики.

---

## Что сейчас работает

| Сервис | Ссылка |
|--------|--------|
| Магазин | https://smokingbarrels.github.io/mirror-mini-app/ |
| Бот API | https://mirror-mini-app.vercel.app/ |
| Статистика | https://smokingbarrels.github.io/mirror-mini-app/stats.html?key=mirror2026 |

---

## Как работает

1. Клиент пишет боту `/start` → получает приветствие и кнопку "Открыть магазин"
2. Открывает магазин → выбирает товар, размер, добавляет в корзину
3. Оформляет заявку → заполняет имя (подтягивается из Telegram), юзернейм, комментарий
4. Заявка приходит **админу** и **поддержке** в Telegram
5. Клиент получает сообщение: "Ваш заказ принят! Скоро вам напишет менеджер"

---

## Как пользоваться

### Заявки
Заявки автоматически приходят в Telegram:
- Админу (chat ID: `1225606022`)
- Поддержке (chat ID: `6287602044`)

Чтобы изменить кому приходят — нужно поменять ID в файле `api/webhook.js`.

### Статистика
Открой в браузере:
```
https://smokingbarrels.github.io/mirror-mini-app/stats.html?key=mirror2026
```
Показывает: сколько людей заходило, кто, сколько раз, график по дням.
Пароль доступа: `mirror2026` (в ссылке после `key=`).

---

## Как менять товары

### Файл с товарами: `js/data.js`

Каждый товар выглядит так:
```javascript
{
    id: 1,                      // уникальный номер (не повторять)
    name: 'Лонгслив "mirror"',  // название
    price: 85,                  // цена в BYN
    images: [                   // фото (пути к файлам в папке assets/img/)
        'assets/img/photo1.png',
        'assets/img/photo2.png',
        'assets/img/photo3.png'
    ],
    category: 'longsleeves',    // категория (должна совпадать с CATEGORIES ниже)
    sizes: ['S', 'M', 'L'],    // доступные размеры
    shippingDays: 10,           // срок доставки в рабочих днях
    description: 'Описание'     // описание товара
}
```

### Добавить новый товар
1. Добавь фото в папку `assets/img/`
2. Добавь блок товара в массив `PRODUCTS` в `js/data.js`
3. Если новая категория — добавь её в массив `CATEGORIES`

### Добавить категорию
В `js/data.js` массив `CATEGORIES`, добавь строку:
```javascript
{ value: 'hoodies', label: 'Худи' }
```

### После любых изменений
В файле `index.html` увеличь номер версии на 1 везде где `?v=`:
```html
<link rel="stylesheet" href="css/styles.css?v=25">
<script src="js/data.js?v=25"></script>
<script src="js/app.js?v=25"></script>
```
Это нужно чтобы у пользователей загрузилась новая версия, а не старая из кеша.

---

## Если нужно перенести на нового бота

1. Открой Telegram → @BotFather → `/newbot` → придумай имя и юзернейм
2. Скопируй токен который даст BotFather
3. Зайди на vercel.com → твой проект → Settings → Environment Variables
4. Замени значение `BOT_TOKEN` на новый токен
5. Нажми Redeploy (Deployments → последний → ... → Redeploy)
6. Зарегистрируй webhook — открой в браузере:
   ```
   https://api.telegram.org/bot<НОВЫЙ_ТОКЕН>/setWebhook?url=https://mirror-mini-app.vercel.app/api/webhook
   ```
   Должно показать `{"ok":true}`
7. В @BotFather: `/setmenubutton` → выбери нового бота → отправь:
   ```
   https://smokingbarrels.github.io/mirror-mini-app/
   ```
   Потом напиши название кнопки: `Shop`

---

## Структура файлов

```
index.html           — Главная страница магазина
stats.html           — Панель статистики
css/styles.css       — Внешний вид
js/data.js           — Товары и категории (ЭТО МЕНЯТЬ ДЛЯ ТОВАРОВ)
js/app.js            — Логика (не трогать без разработчика)
api/webhook.js       — Бот и отправка заявок (тут chat ID админа/поддержки)
api/stats.js         — Аналитика (не трогать)
assets/img/          — Фото товаров
vercel.json          — Настройки Vercel (не трогать)
```

---

## Текущие настройки
- Валюта: BYN
- Админ chat ID: `1225606022`
- Поддержка chat ID: `6287602044`
- Ссылка поддержки: t.me/mirshvv
- Пароль статистики: `mirror2026`
