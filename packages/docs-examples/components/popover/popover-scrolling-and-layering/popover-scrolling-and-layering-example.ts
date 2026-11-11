import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectExampleText } from '../l10n';

/**
 * @title popover-scrolling-and-layering
 */
@Component({
    selector: 'popover-scrolling-and-layering-example',
    template: `
        <iframe
            src="/examples/popover-scrolling-and-layering-page"
            loading="lazy"
            width="648"
            height="400"
            title="popover-scrolling-and-layering-example"
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
export class PopoverScrollingAndLayeringExample {
    protected readonly text = injectExampleText();
}
