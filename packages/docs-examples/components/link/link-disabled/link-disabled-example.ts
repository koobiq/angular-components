import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link disabled
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'link-disabled-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a kbq-link [disabled]="disabled">Отчет от 15.05.2020</a>
        </div>
    `
})
export class LinkDisabledExample {
    disabled = true;
}
