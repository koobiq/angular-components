`KbqActionsPanel` - popup panel with bulk actions on selected objects.

<!-- example(actions-panel-overview) -->

### Properties

#### Adaptability

The bulk actions panel becomes compact to fit within the available screen area. Adaptability is implemented using the [`KbqOverflowItems`](en/components/overflow-items) component, which automatically hides elements with dynamic adaptation to the container width. The `additionalResizeObserverTargets` attribute is used to track panel size changes, allowing you to monitor size changes of specified elements on the page.

<!-- example(actions-panel-adaptive) -->

#### Additional counter

The component has an option to show an additional counter. The principle of operation of the additional counter can be customized to meet the needs of your product. For example, if the list items are grouped, the counter text can show the total number of items, not just groups.

<!-- example(actions-panel-custom-counter) -->

### Close the panel when an action is started

The panel usually remains open after the action is started. Sometimes there are commands that leave no selected items in the table, such as “Remove”. In such cases it is possible to close the panel.

<!-- example(actions-panel-close) -->

### Keyboard interaction

By default, the `ESCAPE` key closes `KbqActionsPanel`. While you can disable this behavior via the `disableClose` property of `KbqActionsPanelConfig`.

### Sharing data with the component

You can use the `data` option to pass information to the component:

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

Access to data in the component is performed using `KBQ_ACTIONS_PANEL_DATA` injection token:

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

If you are using a `TemplateRef` for your actions panel content, the `data` and `actionsPanelRef` is available in the template:

```html
<ng-template let-data let-actionsPanelRef="actionsPanelRef">
    <div>{{ data.name }}</div>
    <button (click)="actionsPanelRef.close()">close</button>
</ng-template>
```

### Managing OverlayContainer

`OverlayContainer` determines where in the DOM tree the actions panel will be displayed. By default it is the document
body (`document.body`).

#### Default container

Without `overlayContainer` the panel is rendered in the application-wide overlay container and pinned to the bottom of
the viewport, above the page, the way a dialog is. Use it when the actions apply to the whole screen rather than to a
single block on it.

<!-- example(actions-panel-global) -->

#### Configuring container for a specific panel

If you need to display the actions panel in a specific element (for example, inside a [Sidebar](/en/components/sidebar)), use the `overlayContainer` option:

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

The panel is rendered inside that element, pinned to its bottom center, and resizes with it. Its width is capped by the
element's width unless `maxWidth` says otherwise. An element that sets `overflow: hidden` clips the panel; at the
default `overflow: visible` the entrance animation renders it below the element.

The element is mutated for as long as the panel is open: it gains one child node holding the overlay, and an element
with `position: static` is promoted to `position: relative`, since the overlay is positioned against it.

#### Global container configuration

`OverlayContainer` can be replaced application-wide, which moves every overlay elsewhere in the DOM:

```ts
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
    providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }]
});
```

The `overlayContainer` option takes precedence: a panel opened with it does not use the global container.
