import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { KbqOrientation } from '@koobiq/components/core';

/** Groups and styling related `KbqButton`s into a single visual unit. */
@Component({
    selector: 'kbq-button-group, [kbq-button-group]',
    template: `
        <ng-content />
    `,
    styleUrls: ['./button-group.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'group',
        class: 'kbq-button-group',
        '[class]': '"kbq-button-group_" + orientation()',
        '[attr.aria-orientation]': 'orientation()'
    }
})
export class KbqButtonGroup {
    /**
     * Layout direction: `'horizontal'` or `'vertical'`
     * @default 'horizontal'
     */
    readonly orientation = input<KbqOrientation>('horizontal');
}
