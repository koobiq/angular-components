import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { KbqOrientation } from '@koobiq/components/core';

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
        '[class]': 'className()',
        '[attr.aria-orientation]': 'orientation()'
    }
})
export class KbqButtonGroup {
    readonly orientation = input<KbqOrientation>('horizontal');

    protected readonly className = computed(() => `kbq-button-group_${this.orientation()}`);
}
