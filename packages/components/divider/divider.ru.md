`<kbq-divider>` — это компонент, который используется для разделительной линии с различными вариантами ориентации.

<!-- example(divider-overview) -->

### Simple divider

Элемент `<kbq-divider>` может использоваться самостоятельно для создания горизонтальной или вертикальной линии.

```html
<kbq-divider></kbq-divider>
```

### Inset divider

Добавьте атрибут `inset`, чтобы указать, является ли разделитель вставным.

```html
<kbq-divider [inset]="true"></kbq-divider>
```

### Vertical divider

Добавьте атрибут `vertical`, чтобы указать, ориентирован ли разделитель вертикально.

<!-- example(divider-vertical) -->

### Lists with inset dividers

Разделители можно добавлять в списки для разделения контента на отдельные секции.
`Inset` разделители также можно добавлять, чтобы создать вид отдельных элементов в списке,
не загромождая контент, например, изображениями аватаров или иконками.

Убедитесь, что вы не добавляете `inset` разделитель к последнему элементу в списке,
поскольку он будет перекрывать разделитель секции.

```html
<kbq-list>
    <h3>Folders</h3>
    <kbq-list-item *ngFor="let folder of folders; last as last">
        <kbq-icon kbq-list-icon>folder</kbq-icon>
        <h4 kbq-line>{{folder.name}}</h4>
        <p class="demo-2" kbq-line>{{folder.updated}}</p>
        <kbq-divider [inset]="true" *ngIf="!last"></kbq-divider>
    </kbq-list-item>
    <kbq-divider></kbq-divider>
    <h3>Notes</h3>
    <kbq-list-item *ngFor="let note of notes">
        <kbq-icon kbq-list-icon>note</kbq-icon>
        <h4 kbq-line>{{note.name}}</h4>
        <p class="demo-2" kbq-line>{{note.updated}}</p>
    </kbq-list-item>
</kbq-list>
```
