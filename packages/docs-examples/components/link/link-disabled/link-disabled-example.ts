import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link disabled
 */
@Component({
    selector: 'link-disabled-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a kbq-link [disabled]="disabled">Отчет от 15.05.2020</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDisabledExample {
    disabled = true;
}
