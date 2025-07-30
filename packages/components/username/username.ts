import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KbqUsernameMode } from './types';

@Component({
    selector: 'kbq-username',
    standalone: true,
    exportAs: 'kbqUsername',
    imports: [],
    template: `
        <ng-content select="kbq-username-main,[kbq-username-main]" />

        <ng-content select="kbq-username-secondary,[kbq-username-secondary]" />
    `,
    host: {
        class: 'kbq-username'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUsername<T> {
    profile = input.required<T>();
    mode = input<KbqUsernameMode>('inline');
}
