import { ChangeDetectionStrategy, Component } from '@angular/core';

const baseClass = 'kbq-inline-edit';

@Component({
    standalone: true,
    selector: 'kbq-inline-edit',
    exportAs: 'kbqInlineEdit',
    template: `
        hello world
    `,
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    host: {
        class: baseClass
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqInlineEdit {}
