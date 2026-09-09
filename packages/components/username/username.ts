import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    ViewEncapsulation
} from '@angular/core';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    KBQ_PROFILE_MAPPING,
    kbqDefaultFullNameFormat,
    kbqDefaultProfileMapping,
    kbqInjectUsernameLocaleConfiguration
} from './constants';
import { KbqUserInfo, KbqUsernameMode, KbqUsernameStyle } from './types';
import { kbqFormatUsername } from './username.pipe';

const baseClass = 'kbq-username';

/**
 * Unabbreviated counterpart of a format: every key renders in full, so the abbreviation marks go.
 *
 * The case is left alone. `kbqFormatUsername` resolves a key through the mapping whatever its case, and
 * upper-casing would miss every mapping typed `KbqFormatKeyToProfileMapping` — the shape the token is
 * documented with, which by design carries the lowercase keys only.
 */
const expandFormat = (format: string): string => format.replaceAll('.', '');

/** Styles the primary part of the username (e.g. full name). */
@Directive({
    selector: '[kbqUsernamePrimary]',
    host: {
        class: `${baseClass}__primary`
    },
    exportAs: 'kbqUsernamePrimary'
})
export class KbqUsernamePrimary {}

/** Styles the secondary part. */
@Directive({
    selector: '[kbqUsernameSecondary]',
    host: {
        class: `${baseClass}__secondary`
    },
    exportAs: 'kbqUsernameSecondary'
})
export class KbqUsernameSecondary {}

/** Styles a secondary hint. */
@Directive({
    selector: '[kbqUsernameSecondaryHint]',
    host: {
        class: `${baseClass}__secondary-hint`
    },
    exportAs: 'kbqUsernameSecondaryHint'
})
export class KbqUsernameSecondaryHint {}

/** Custom content for `KbqUsername`, overrides default view. */
@Directive({
    selector: 'kbq-username-custom-view, [kbq-username-custom-view]',
    host: {
        class: `${baseClass}__custom-view`
    },
    exportAs: 'kbqUsernameCustomView'
})
export class KbqUsernameCustomView {}

/**
 * Displays a user's name based on profile data.
 * Supports different display modes and visual styles.
 * A custom view can be provided via `<kbq-username-custom-view>` for full control over the output.
 * Accepts input profile data and optional formatting options.
 */
@Component({
    selector: 'kbq-username',
    imports: [
        KbqTitleModule,
        KbqUsernamePrimary,
        KbqUsernameSecondary,
        KbqUsernameSecondaryHint
    ],
    templateUrl: './username.html',
    styleUrls: ['./username.scss', './username-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: baseClass,
        '[class]': 'class()'
    },
    exportAs: 'kbqUsername'
})
export class KbqUsername {
    /**
     * Resolved at the component's own injector, so a mapping scoped to a route or a host component
     * applies to what is rendered here.
     */
    private readonly mapping = inject(KBQ_PROFILE_MAPPING) ?? kbqDefaultProfileMapping;

    /** User profile data used for display. */
    readonly userInfo = input<KbqUserInfo>();
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
    /**
     * Custom projected view for username rendering.
     * @docs-private
     */
    protected readonly customView = contentChild(KbqUsernameCustomView);

    /** @docs-private */
    protected readonly localeConfiguration = kbqInjectUsernameLocaleConfiguration();

    /** Name as rendered, i.e. abbreviated according to `fullNameFormat`.
     * @docs-private */
    protected readonly formattedName = computed(() =>
        kbqFormatUsername(this.userInfo(), this.fullNameFormat(), this.mapping)
    );

    /**
     * Whether the profile yields any name at all. A profile carrying only one of the name fields still
     * has a name, and the formatter degrades to whatever it finds.
     * @docs-private
     */
    protected readonly hasName = computed(() => !!this.formattedName());

    /** Unabbreviated name, offered as the tooltip of the truncated primary part.
     * @docs-private */
    protected readonly expandedName = computed(() =>
        kbqFormatUsername(this.userInfo(), expandFormat(this.fullNameFormat()), this.mapping)
    );

    /** Tooltip of the secondary part: the login with the site hint it renders inline.
     * @docs-private */
    protected readonly secondaryTitle = computed(() => this.withSite(this.userInfo()?.login || ''));

    /** Tooltip of the compact layout, whose single part carries the name — or the login when there is
     * none — followed by the site.
     * @docs-private */
    protected readonly compactTitle = computed(() =>
        this.withSite(this.hasName() ? this.expandedName() || this.formattedName() : this.userInfo()?.login || '')
    );

    /**
     * Whether the layout can clip its text. `text` mode applies no ellipsis, so the `kbq-title`
     * measurement — a resize observer, a content observer and a focus monitor per part — has nothing to
     * detect there and is not attached.
     * @docs-private
     */
    protected readonly canTruncate = computed(() => this.mode() !== 'text');

    /** @docs-private */
    protected readonly class = computed(() => {
        return [this.type(), this.mode()].map((modificator) => `${baseClass}_${modificator}`).join(' ');
    });

    private withSite(text: string): string {
        const site = this.userInfo()?.site;

        return site ? `${text} (${site})`.trim() : text;
    }
}
