import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @title tree-select-scrolling-and-layering
 */
@Component({
    selector: 'tree-select-scrolling-and-layering-example',
    template: `
        <iframe
            src="/examples/tree-select-scrolling-and-layering-page"
            loading="lazy"
            width="648"
            height="400"
            title="tree-select-scrolling-and-layering-example"
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
export class TreeSelectScrollingAndLayeringExample {}
