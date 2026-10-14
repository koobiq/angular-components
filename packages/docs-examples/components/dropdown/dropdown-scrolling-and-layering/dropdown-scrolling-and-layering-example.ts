import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @title Dropdown scrolling and layering
 */
@Component({
    selector: 'dropdown-scrolling-and-layering-example',
    template: `
        <iframe
            src="/examples/dropdown-scrolling-and-layering-page"
            loading="lazy"
            width="648"
            height="400"
            title="dropdown-scrolling-and-layering-example"
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
export class DropdownScrollingAndLayeringExample {}
