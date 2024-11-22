import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link disabled
 */
@Component({
    standalone: true,
    selector: 'link-disabled-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a [disabled]="disabled" kbq-link>Отчет от 15.05.2020</a>
        </div>
    `
})
export class LinkDisabledExample {
    disabled = true;
}
