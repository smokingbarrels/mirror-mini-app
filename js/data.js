const PRODUCTS = [
    {
        id: 1,
        name: 'ЗИП-ХУДИ «ONLY 52» WHITE',
        price: 6990,
        oldPrice: null,
        badge: 'NEW',
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Зип-худи оверсайз с принтом «52». Плотный хлопок с начёсом.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 2,
        name: 'ФУТБОЛКА «ONLY 52» PINK',
        price: 2990,
        oldPrice: null,
        badge: 'NEW',
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Футболка оверсайз с принтом «52». Мягкий хлопок.',
        composition: '100% хлопок',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 3,
        name: 'ФУТБОЛКА «MEMBERS ONLY» GLITTER',
        price: 3990,
        oldPrice: null,
        badge: 'СВЕРКАЮЩАЯ',
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Первая вещь в бренде в данном стиле. Дизайн спереди и сзади выполнен из глиттер плёнки.',
        composition: '100% хлопок',
        care: 'Машинная стирка при 30°C, не гладить принт',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 4,
        name: 'ХУДИ «MEMBERS ONLY» REFLECTIVE',
        price: 6990,
        oldPrice: null,
        badge: 'РЕФЛЕКТИВ',
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Худи оверсайз с рефлективным принтом «Members Only 52».',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 5,
        name: 'ХУДИ "WOLF PINK" BLACK',
        price: 6990,
        oldPrice: null,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Худи оверсайз с вышивкой волка. Плотный хлопок с начёсом.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 6,
        name: 'ХУДИ "WOLF WHITE" BLACK',
        price: 6990,
        oldPrice: null,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Худи оверсайз с вышивкой волка. Плотный хлопок с начёсом.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 7,
        name: 'ШТАНЫ "WOLF PINK" BLACK',
        price: 5990,
        oldPrice: 6990,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Штаны с вышивкой волка. Утяжки на резинке.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    },
    {
        id: 8,
        name: 'ШТАНЫ "WOLF WHITE" BLACK',
        price: 5990,
        oldPrice: 6990,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Штаны с вышивкой волка. Утяжки на резинке.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['placeholder', 'placeholder']
    }
];

const CATEGORIES = ['В наличии', 'Sale', 'SOLDOUT', 'Зип-худи', 'Футболки', 'Лонгсливы', 'Худи', 'Штаны'];

const SORT_OPTIONS = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'popular', label: 'По популярности' },
    { value: 'name-asc', label: 'Название: А-Я' },
    { value: 'name-desc', label: 'Название: Я-А' },
    { value: 'price-asc', label: 'Цене: по возрастанию' }
];
