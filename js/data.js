const PRODUCTS = [
    {
        id: 10,
        name: 'ХУДИ «MIRROR» PINK',
        price: 0,
        oldPrice: null,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Худи розовая MIRROR.',
        composition: '80% хлопок, 20% полиэстер',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['assets/img/product-4.png']
    },
    {
        id: 9,
        name: 'ШОРТЫ «DOUBLE WAIST» BLACK',
        price: 0,
        oldPrice: null,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Double waist shorts.',
        composition: '100% хлопок',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['assets/img/product-3.jpg']
    },
    {
        id: 2,
        name: 'ФУТБОЛКА «MIRR 131» PINK',
        price: 1350,
        oldPrice: null,
        badge: null,
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Футболка розовая MIRR 131.',
        composition: '100% хлопок',
        care: 'Машинная стирка при 30°C',
        shippingDays: 10,
        images: ['assets/img/product-2.png']
    }
];

const CATEGORIES = ['Футболки', 'Шорты', 'Худи'];

const SORT_OPTIONS = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'popular', label: 'По популярности' },
    { value: 'name-asc', label: 'Название: А-Я' },
    { value: 'name-desc', label: 'Название: Я-А' },
    { value: 'price-asc', label: 'Цене: по возрастанию' }
];
