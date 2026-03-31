import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @title select-scrolling-and-layering
 */
@Component({
    selector: 'select-scrolling-and-layering-example',
    template: `
        <iframe
            src="/examples/select"
            width="648"
            height="400"
            title="select-scrolling-and-layering-example"
            style="border: none"
        ></iframe>
    `,
    styles: `
        :host {
            display: flex;
            margin: -20px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectScrollingAndLayeringExample {}
