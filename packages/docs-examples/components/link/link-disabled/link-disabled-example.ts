import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link disabled
 */
@Component({
    selector: 'link-disabled-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            <a kbqLink href="https://koobiq.io/en/components/link" [disabled]="disabled">Отчет от 15.05.2020</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDisabledExample {
    disabled = true;
}
