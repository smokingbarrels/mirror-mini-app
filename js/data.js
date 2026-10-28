const PRODUCTS = [
    {
        id: 1,
        name: 'Лонгслив "mirror"',
        price: 85,
        image: 'assets/img/longsleeve-mirror.png',
        category: 'longsleeves',
        sizes: ['S', 'M', 'L', 'XL']
    }
];

const CATEGORIES = [
    { value: 'all', label: 'Все' },
    { value: 'longsleeves', label: 'Лонгсливы' }
];

const SORT_OPTIONS = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'popular', label: 'По популярности' },
    { value: 'name-asc', label: 'Название: А-Я' },
    { value: 'name-desc', label: 'Название: Я-А' },
    { value: 'price-asc', label: 'Цене: по возрастанию' }
];
