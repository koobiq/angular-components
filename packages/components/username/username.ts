import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    ViewEncapsulation
} from '@angular/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { kbqDefaultFullNameFormat } from './constants';
import { KbqUsernameMode, KbqUsernameStyle } from './types';
import { KbqUsernamePipe } from './username.pipe';

const cssBase = 'kbq-username';

type Profile = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    login?: string;
    site?: string;
};

@Component({
    selector: 'kbq-username',
    standalone: true,
    exportAs: 'kbqUsername',
    imports: [
        KbqUsernamePipe,
        KbqTitleModule
    ],
    templateUrl: './username.html',
    styleUrls: ['./username.scss'],
    host: {
        class: cssBase,
        '[class]': 'class()'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUsername {
    readonly userInfo = input<Profile>();
    readonly mode = input<KbqUsernameMode>('inline');
    readonly isCompact = input(false, { transform: booleanAttribute });
    readonly fullNameFormat = input<string>(kbqDefaultFullNameFormat);
    readonly type = input<KbqUsernameStyle>('default');

    protected readonly hasFullName = computed(() => {
        const profile = this.userInfo();

        if (!profile) return false;

        return profile?.lastName && profile?.firstName;
    });

    protected readonly class = computed(() => {
        return [this.type(), this.mode()].map((modificator) => `${cssBase}_${modificator}`).join(' ');
    });
}

@Component({
    selector: 'kbq-username-custom',
    standalone: true,
    exportAs: 'kbqUsernameCustom',
    imports: [],
    template: `
        <ng-content select="kbq-username-primary,[kbq-username-primary]" />

        <ng-content select="kbq-username-secondary,[kbq-username-secondary]" />
    `,
    host: {
        class: 'kbq-username'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUsernameCustom {
    protected readonly mode = input<KbqUsernameMode>('inline');
}
