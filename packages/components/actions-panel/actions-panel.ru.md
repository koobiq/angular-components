`KbqActionsPanel` — всплывающая панель с массовыми действиями над выбранными объектами.

<!-- example(actions-panel-overview) -->

### Свойства

#### Адаптивность

Панель массовых действий становится компактной, чтобы помещаться в доступную область экрана. Адаптивность реализована при помощи компонента [`KbqOverflowItems`](ru/components/overflow-items), который автоматически скрывает элементы с динамической адаптацией под ширину контейнера. Для отслеживания изменений размеров панели используется атрибут `additionalResizeObserverTargets`, который позволяет отслеживать изменения размеров указанных элементов на странице.

<!-- example(actions-panel-adaptive) -->

#### Дополнительный счетчик

Компонент поддерживает дополнительный счетчик, который можно настроить под задачи продукта. Например, при группировке элементов списка счетчик отображает общее количество элементов, а не количество групп.

<!-- example(actions-panel-custom-counter) -->

### Закрыть панель при запуске действия

Панель обычно остается открытой после запуска действия. Иногда бывают такие команды, после которых в таблице не остается выбранных элементов, например «Удалить». В подобных случаях предусмотрена возможность закрывать панель.

<!-- example(actions-panel-close) -->

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает `KbqActionsPanel`, но вы можете отключить это поведение с помощью свойства `disableClose` в `KbqActionsPanelConfig`.

### Обмен данными с компонентом

Вы можете использовать опцию `data` для передачи информации компоненту:

```ts
import { Component, inject } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';

@Component({
    selector: 'your-component',
    templateUrl: './your-component.html',
    providers: [KbqActionsPanel]
})
export class YourComponent {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });

    openActionsPanel() {
        this.actionsPanel.open(YourActionsPanelComponent, {
            data: { name: 'koobiq' }
        });
    }
}
```

Доступ к данным в компоненте осуществляется при помощи `KBQ_ACTIONS_PANEL_DATA` токена:

```ts
import { Component, inject } from '@angular/core';
import { KBQ_ACTIONS_PANEL_DATA, KbqActionsPanelRef } from '@koobiq/components/actions-panel';

@Component({
    selector: 'your-actions-panel',
    template: `
        <div>{{ data.name }}</div>
        <button (click)="actionsPanelRef.close()">close</button>
    `
})
export class YourActionsPanelComponent {
    readonly data = inject(KBQ_ACTIONS_PANEL_DATA);
    readonly actionsPanelRef = inject(KbqActionsPanelRef);
}
```

Если вы используете `TemplateRef` для содержимого панели действий, то `data` и `actionsPanelRef` доступны в шаблоне:

```html
<ng-template let-data let-actionsPanelRef="actionsPanelRef">
    <div>{{ data.name }}</div>
    <button (click)="actionsPanelRef.close()">close</button>
</ng-template>
```

### Управление OverlayContainer

`OverlayContainer` определяет, где в DOM-дереве будет отображаться панель действий. По умолчанию — в теле документа (`document.body`).

#### Контейнер по умолчанию

Если `overlayContainer` не задан, панель отображается в общем контейнере оверлеев приложения и прижимается к нижнему краю окна поверх страницы — как диалог. Такой вариант подходит, когда действия относятся ко всему экрану, а не к одному блоку на нём.

<!-- example(actions-panel-global) -->

#### Настройка контейнера для конкретной панели

Если вам необходимо отобразить панель действий в определенном элементе (например, внутри [Sidebar](/ru/components/sidebar)), используйте опцию `overlayContainer`:

```ts
import { Component, ElementRef, inject } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';

@Component({
    selector: 'your-component',
    templateUrl: './your-component.html',
    providers: [KbqActionsPanel]
})
export class YourComponent {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly customContainer = inject<ElementRef<HTMLElement>>(ElementRef);

    openActionsPanel() {
        this.actionsPanel.open(YourActionsPanelComponent, {
            overlayContainer: this.customContainer
        });
    }
}
```

Панель рендерится внутри этого элемента, прижатая к его нижнему краю по центру, и меняет размер вместе с ним. Ширина
ограничена шириной элемента, если не задан `maxWidth`. Элемент с `overflow: hidden` обрезает панель; при значении по
умолчанию `overflow: visible` анимация появления покажет её ниже элемента.

Пока панель открыта, элемент изменён: у него появляется один дочерний узел с оверлеем, а элементу с `position: static`
проставляется `position: relative`, потому что оверлей позиционируется относительно него.

#### Глобальная настройка контейнера

`OverlayContainer` можно переопределить на уровне приложения — тогда все оверлеи окажутся в другом месте DOM:

```ts
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
    providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }]
});
```

Опция `overlayContainer` имеет приоритет: открытая с ней панель глобальный контейнер не использует.
