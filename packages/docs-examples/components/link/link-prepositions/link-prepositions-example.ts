import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link preposition
 */
@Component({
    selector: 'link-prepositions-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            Обратитесь
            <a href="#" kbqLink>в Центр технической поддержки</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPrepositionsExample {}
