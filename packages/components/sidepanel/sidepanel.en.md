The `KbqSidepanelService` can be used to open sidepanels.
These panels appear at the edge of the screen and can be used to perform
some actions or display additional information without losing context.

You can open a sidepanel by calling `open` method with a component to be loaded or a template
and an optional config object.
The `open` method will return an instance of `KbqSidepanelRef`:

```ts
const sidepanelRef = sidepanelService.open(ExampleSidepanelComponent, {
    hasBackdrop: false,
});
```

The `KbqSidepanelRef` is a reference to the opened sidepanel and can be used to close it or
to receive notification when the sidepanel has been opened (after animation) or closed.

```ts
sidepanelRef.afterClosed().subscribe((result) => {
    console.log(`Sidepanel result: ${result}`); // I was closed
});

sidepanelRef.close('I was closed');
```

Note that multiple sidepanels can be open at a time. Any component contained inside of a sidepanel
can inject the `KbqSidepanelRef` as well.

### Specifying global configuration defaults

Default sidepanel options can be specified by providing an instance of `KbqSidepanelConfig`
for `KBQ_SIDEPANEL_DEFAULT_OPTIONS` in your application's root module.

```ts
@NgModule({
    providers: [
        { provide: KBQ_SIDEPANEL_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
    ]
})
```

### Sharing data with the sidepanel component

If you want to pass in some data to the sidepanel, you can do so by using `data` property
in configuration:

```ts
const sidepanelRef = sidepanelService.open(ExampleSidepanelComponent, {
    data: { items: ['One', 'Two', 'Three'] },
});
```

Afterwards you can access thr injected data using the `KBQ_SIDEPANEL_DATA` injection token:

```ts
import { Component, Inject } from '@angular/core';

import { KBQ_SIDEPANEL_DATA } from '@koobiq/components';

@Component({
    template: 'passed in {{ data.items }}',
})
export class ExampleSidepanelComponent {
    constructor(@Inject(KBQ_SIDEPANEL_DATA) public data: any) {}
}
```

### Configuring sidepanel content

`KbqSidepanelService` instantiates components at run-time. In order for it to work,
the Angular compiler needs extra information to create the necessary `ComponentFactory`
for your sidepanel content component.

```ts
@NgModule({
    imports: [
        // ...
        KbqSidepanelModule,
    ],

    declarations: [AppComponent, ExampleSidepanelComponent],

    bootstrap: [AppComponent],
})
export class AppModule {}
```

### Sidepanel content

To structure your sidepanel content you can use several directives:
`<kbq-sidepanel-header>`, `<kbq-sidepanel-body>`, `<kbq-sidepanel-footer>`
and `<kbq-sidepanel-actions>`.

Also `kbq-sidepanel-close` directive is available to mark button which need
to close sidepanel. For example, cancel button in footer.

```html
<kbq-sidepanel-header [closeable]="true">Sidepanel Header</kbq-sidepanel-header>
<kbq-sidepanel-body class="layout-padding">Sidepanel Body</kbq-sidepanel-body>
<kbq-sidepanel-footer>
    <kbq-sidepanel-actions align="left">
        <button kbq-button [color]="'contrast'" (click)="doAnotherAction()">
            <span>Another Action</span>
        </button>
    </kbq-sidepanel-actions>
    <kbq-sidepanel-actions align="right">
        <button kbq-button [color]="'contrast'" (click)="doAction()">
            <span>Action</span>
        </button>

        <button kbq-button kbq-sidepanel-close>
            <span>Close</span>
        </button>
    </kbq-sidepanel-actions>
</kbq-sidepanel-footer>
```

#### Keyboard interaction

By default pressing the escape key will close the sidepanel. While this behavior can
be turned off via the `disableClose` option, users should generally avoid doing so
as it breaks the expected interaction pattern for screen-reader users.
