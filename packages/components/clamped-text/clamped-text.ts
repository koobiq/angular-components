import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

const baseClass = 'kbq-clamped-text';

@Component({
    selector: 'kbq-clamped-text',
    standalone: true,
    exportAs: 'kbqUsername',
    imports: [],
    template: `
        <ng-content />
    `,
    styleUrls: ['./clamped-text.scss', './clamped-text-tokens.scss'],
    host: {
        class: baseClass
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClampedText {}
