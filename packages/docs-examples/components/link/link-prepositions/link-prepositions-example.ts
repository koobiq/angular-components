import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link preposition
 */
@Component({
    selector: 'link-prepositions-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            Обратитесь
            <a href="#" kbq-link>в Центр технической поддержки</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPrepositionsExample {}
