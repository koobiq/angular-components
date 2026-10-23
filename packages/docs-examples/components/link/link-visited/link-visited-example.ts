import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link visited
 */
@Component({
    selector: 'link-visited-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink useVisited>Отчет от 19.05.2020</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkVisitedExample {}
