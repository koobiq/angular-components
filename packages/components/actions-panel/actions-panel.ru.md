`KbqActionsPanel` — всплывающая панель с массовыми действиями над выбранными объектами.

<!-- example(actions-panel-overview) -->

### Свойства

#### Адаптивность

Панель массовых действий становится компактной, чтобы помещаться в доступную область экрана. Адаптивность реализована при помощи компонента [`KbqOverflowItems`](ru/components/overflow-items), который автоматически скрывает элементы с динамической адаптацией под ширину контейнера. Для отслеживания изменений размеров панели используется атрибут `additionalResizeObserverTargets`, который позволяет отслеживать изменения размеров указанных элементов на странице.

<!-- example(actions-panel-adaptive) -->

#### Дополнительный счетчик

В компоненте есть возможность показать дополнительный счетчик. Принцип работы дополнительного счетчика можно настроить под нужды своего продукта. Например, если элементы списка сгруппированы, то счетчик внутри бейджа может показать общее количество элементов, а не только групп.

<!-- example(actions-panel-custom-counter) -->

### Закрыть панель при запуске действия

Панель обычно остается открытой после запуска действия. Иногда бывают такие команды, после которых в таблице не остается выбранных элементов, например «Удалить». В подобных случаях предусмотрена возможность закрывать панель.

<!-- example(actions-panel-close) -->

### Взаимодействие с клавиатурой

По умолчанию клавиша `ESCAPE` закрывает `KbqActionsPanel`, но вы можете отключить это поведение с помощью свойства `disableClose` в `KbqActionsPanelConfig`.

### Обмен данными с компонентом

Вы можете использовать опцию `data` для передачи информации компоненту:

```ts
import { inject } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';

export class YourComponent {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });

    openActionsPanel() {
        const actionsPanelRef = this.actionsPanel.open(YourActionsPanelComponent, {
            data: { name: 'koobiq' }
        });
    }
}
```

Доступ к данным в компоненте осуществляется при помощи `KBQ_ACTIONS_PANEL_DATA` токена:

```ts
import { Component, Inject } from '@angular/core';
import { KBQ_ACTIONS_PANEL_DATA } from '@koobiq/components/actions-panel';

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

`OverlayContainer` определяет, где в DOM-дереве будет отображаться панель действий. По умолчанию - в теле документа (`document.body`).

#### Настройка контейнера для конкретной панели

Если вам необходимо отобразить панель действий в определенном элементе (например, внутри [Sidebar](/ru/components/sidebar)), используйте опцию `overlayContainer`:

```ts
import { ElementRef, inject } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';

export class YourComponent {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly customContainer = inject(ElementRef);

    openActionsPanel() {
        const actionsPanelRef = this.actionsPanel.open(YourActionsPanelComponent, {
            overlayContainer: this.customContainer
        });
    }
}
```

#### Глобальная настройка контейнера

```ts
import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class CustomOverlayContainer extends OverlayContainer {}

@NgModule({
    providers: [{ provide: OverlayContainer, useClass: CustomOverlayContainer }]
})
```
