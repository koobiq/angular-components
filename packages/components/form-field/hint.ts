import { booleanAttribute, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';

let nextHintUniqueId = 0;

@Component({
    selector: 'kbq-hint',
    exportAs: 'kbqHint',
    template: `
        <ng-content select="[kbq-icon]" />

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    styleUrls: ['hint.scss', 'hint-tokens.scss'],
    host: {
        class: 'kbq-hint',
        '[attr.id]': 'id',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHint extends KbqColorDirective {
    @Input() id: string = `kbq-hint-${nextHintUniqueId++}`;

    @Input({ transform: booleanAttribute }) fillTextOff: boolean = false;

    @Input({ transform: booleanAttribute }) compact: boolean = false;
}
