`<kbq-divider>` — это компонент, который используется для разделительной линии с различными вариантами ориентации.

<!-- example(divider-overview) -->

### Simple divider

Элемент `<kbq-divider>` может использоваться самостоятельно для создания горизонтальной или вертикальной линии.

```html
<kbq-divider />
```

### Vertical divider

Добавьте атрибут `vertical`, чтобы указать, ориентирован ли разделитель вертикально.

<!-- example(divider-vertical) -->

Вертикальный разделитель растягивается на всю поперечную сторону flex- или grid-строки, поэтому внутри панели инструментов
собственная высота ему не нужна. Задайте высоту явно через токен `--kbq-divider-size-vertical-height` — на самом
разделителе, где объявлено значение по умолчанию, — если нужен разделитель короче или расположенный вне такой строки.

```css
.toolbar .kbq-divider {
    --kbq-divider-size-vertical-height: var(--kbq-size-m);
}
```

### Spacing

Обе ориентации по умолчанию отступают от соседних элементов. Добавьте `[paddings]="false"`, чтобы разделитель
прилегал к ним вплотную; отступы задаются как margin, поэтому окружающий класс может заменить их полностью.

```html
<kbq-divider [paddings]="false" />
```

### Decorative divider

Для вспомогательных технологий разделитель — это `separator`: он объявляет границу, которую рисует. Добавьте атрибут
`decorative` там, где эта граница уже передана иначе — заголовком, группой или самой разметкой, — чтобы она не была
объявлена дважды.

```html
<kbq-divider decorative />
```

### Lists with dividers

Разделители можно добавлять в списки для разделения контента на отдельные секции. Разделитель между элементами одной
секции повторяет границу, которую список уже передаёт, поэтому пометьте его как `decorative`; объявлять стоит тот
разделитель, который завершает секцию.

<!-- prettier-ignore -->
```html
<kbq-list>
    <h3>Folders</h3>
    @for (folder of folders; track folder.name) {
        <kbq-list-item>
            <h4 kbq-line>{{ folder.name }}</h4>
            <p kbq-line>{{ folder.updated }}</p>
        </kbq-list-item>
        @if (!$last) {
            <kbq-divider decorative />
        }
    }
    <kbq-divider />
    <h3>Notes</h3>
    @for (note of notes; track note.name) {
        <kbq-list-item>
            <h4 kbq-line>{{ note.name }}</h4>
            <p kbq-line>{{ note.updated }}</p>
        </kbq-list-item>
    }
</kbq-list>
```
