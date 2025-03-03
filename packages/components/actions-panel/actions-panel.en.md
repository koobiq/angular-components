`KbqActionsPanel` - popup panel with bulk actions on selected objects.

<!-- example(actions-panel-overview) -->

### Properties

#### Adaptability

The bulk actions panel becomes compact to fit in the available screen area.

<!-- example(actions-panel-adaptive) -->

#### Additional counter

The component has an option to show an additional counter. The principle of operation of the additional counter can be customized to meet the needs of your product. For example, if the list items are grouped, the counter inside the badge can show the total number of items, not just groups.

<!-- example(actions-panel-custom-counter) -->

### Close the panel when an action is started

The panel usually remains open after the action is started. Sometimes there are commands that leave no selected items in the table, such as “Remove”. In such cases it is possible to close the panel.

<!-- example(actions-panel-close) -->

### Keyboard interaction

By default, the `ESCAPE` key closes `KbqActionsPanel`. While you can disable this behavior via the `disableClose` property of `KbqActionsPanelConfig`.

### Sharing data with the component

You can use the `data` option to pass information to the component:

```ts
import { KbqActionsPanel } from '@koobiq/components/actions-panel';

const actionsPanel = inject(KbqActionsPanel);
const actionsPanelRef = actionsPanel.open(YourActionsPanelComponent, {
    data: { name: 'koobiq' }
});
```

Access to data in the component is performed using `KBQ_ACTIONS_PANEL_DATA` injection token:

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

If you are using a `TemplateRef` for your actions panel content, the `data` and `actionsPanelRef` is available in the template:

```html
<ng-template let-data let-actionsPanelRef="actionsPanelRef">
    <div>{{ data.name }}</div>
    <button (click)="actionsPanelRef.close()">close</button>
</ng-template>
```
