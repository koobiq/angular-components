import { Directive } from '@angular/core';

// import { IcLineClampDirective } from '@mosaic-design/infosec-components/directives';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Directive({
    selector: '[icContentPanelTitle], ic-content-panel-title, [ic-content-panel-title]',
    host: {
        class: 'kbq-title'
    }
    // hostDirectives: [IcLineClampDirective]
})
export class ContentPanelTitleDirective {}
