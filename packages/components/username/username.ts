import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    input,
    ViewEncapsulation
} from '@angular/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { kbqDefaultFullNameFormat } from './constants';
import { KbqUsernameMode, KbqUsernameStyle } from './types';
import { KbqUsernamePipe } from './username.pipe';

const baseClass = 'kbq-username';

type Profile = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    login?: string;
    site?: string;
};

/** Styles the primary part of the username (e.g. full name). */
@Directive({
    selector: '[kbqUsernamePrimary]',
    exportAs: 'kbqUsernamePrimary',
    standalone: true,
    host: {
        class: `${baseClass}__primary`
    }
})
export class KbqUsernamePrimary {}

/** Styles the secondary part. */
@Directive({
    selector: '[kbqUsernameSecondary]',
    exportAs: 'kbqUsernameSecondary',
    standalone: true,
    host: {
        class: `${baseClass}__secondary`
    }
})
export class KbqUsernameSecondary {}

/** Styles a secondary hint (e.g. site info). */
@Directive({
    selector: '[kbqUsernameSecondaryHint]',
    exportAs: 'kbqUsernameSecondaryHint',
    standalone: true,
    host: {
        class: `${baseClass}__secondary-hint`
    }
})
export class KbqUsernameSecondaryHint {}

/** Custom content for `KbqUsername`, overrides default view. */
@Directive({
    selector: 'kbq-username-custom-view, [kbq-username-custom-view]',
    standalone: true,
    exportAs: 'kbqUsernameCustomView'
})
export class KbqUsernameCustomView {}

@Component({
    selector: 'kbq-username',
    standalone: true,
    exportAs: 'kbqUsername',
    imports: [
        KbqTitleModule,
        KbqUsernamePipe,
        KbqUsernamePrimary,
        KbqUsernameSecondary,
        KbqUsernameSecondaryHint
    ],
    templateUrl: './username.html',
    styleUrls: ['./username.scss', './username-tokens.scss'],
    host: {
        class: baseClass,
        '[class]': 'class()'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUsername {
    /** User profile data used for display. */
    readonly userInfo = input<Profile>();
    /** Enables compact display mode */
    readonly isCompact = input(false, { transform: booleanAttribute });
    /** Format string for rendering the user's full name. */
    readonly fullNameFormat = input<string>(kbqDefaultFullNameFormat);
    /**
     * Display mode of the username.
     * @default inline
     */
    readonly mode = input<KbqUsernameMode>('inline');
    /**
     * Visual style of the username.
     * @default default
     */
    readonly type = input<KbqUsernameStyle>('default');
    /** Custom projected view for username rendering. */
    protected readonly customView = contentChild(KbqUsernameCustomView);

    protected readonly hasFullName = computed(() => {
        const profile = this.userInfo();

        if (!profile) return false;

        return profile?.lastName && profile?.firstName;
    });

    protected readonly class = computed(() => {
        return [this.type(), this.mode()].map((modificator) => `${baseClass}_${modificator}`).join(' ');
    });
}
