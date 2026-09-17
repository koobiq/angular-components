import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqAlertColors, KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors, KbqThemeService } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { DocsClipboardService } from 'src/app/services/clipboard';
import {
    DOCS_PALETTE_STEPS,
    DOCS_THEMEABLE_FAMILIES,
    DOCS_THEMEABLE_ROLES,
    DocsCustomTheme,
    DocsThemeableRole
} from '../../services/custom-theme';
import { DocsTranslationKey } from '../../services/i18n';
import { DocsLocaleState } from '../../services/locale';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';
import { DocsColorPicker } from './color-picker/color-picker';
import { docsSwatchStyle } from './swatch';
import { DocsTokensPlaygroundService } from './tokens-playground.service';

/** The curated roles in the order they are listed, grouped by section. */
const ROLE_GROUPS: { key: DocsThemeableRole['group']; labelKey: DocsTranslationKey }[] = [
    { key: 'surfaces', labelKey: 'playgroundGroupSurfaces' },
    { key: 'text', labelKey: 'playgroundGroupText' },
    { key: 'brand', labelKey: 'playgroundGroupBrand' },
    { key: 'lines', labelKey: 'playgroundGroupLines' },
    { key: 'status', labelKey: 'playgroundGroupStatus' }
];

/**
 * Live playground for the design token layers.
 *
 * Every knob rewrites only the `semantic.*` layer, and the whole page — including the docs
 * chrome around it — follows. That is the argument for keeping the semantic palette as a
 * separate 1:1 alias of the engineering palette rather than pointing roles straight at hues:
 * re-theming is a change to one layer, not a search-and-replace across all of them.
 */
@Component({
    selector: 'docs-tokens-playground',
    imports: [
        ReactiveFormsModule,
        DocsComponentViewerWrapperComponent,
        KbqAlertModule,
        KbqButtonModule,
        KbqButtonToggleModule,
        KbqCheckboxModule,
        KbqDividerModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        KbqLinkModule,
        KbqProgressBarModule,
        KbqRadioModule,
        KbqSelectModule,
        KbqToggleModule,
        DocsColorPicker
    ],
    templateUrl: './tokens-playground.html',
    styleUrls: ['./tokens-playground.scss'],
    providers: [DocsTokensPlaygroundService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-tokens-playground' }
})
export class DocsTokensPlayground extends DocsLocaleState {
    protected readonly playground = inject(DocsTokensPlaygroundService);
    protected readonly customTheme = inject(DocsCustomTheme);
    private readonly clipboard = inject(DocsClipboardService);
    private readonly themeService = inject(KbqThemeService);
    private readonly toastService = inject(KbqToastService);

    protected readonly families = DOCS_THEMEABLE_FAMILIES;
    protected readonly steps = Array.from({ length: DOCS_PALETTE_STEPS }, (_, index) => index + 1);
    protected readonly colors = KbqComponentColors;
    protected readonly alertColors = KbqAlertColors;

    /** A form field only turns red through an invalid control, not through a colour input. */
    protected readonly validControl = new FormControl(this.t('playgroundInputValue'));
    protected readonly invalidControl = new FormControl('', Validators.required);

    /** Filled in once the user clicks something in the preview. */
    protected readonly chain = signal<{ variable: string; value: string }[]>([]);
    protected readonly inspected = signal<string | null>(null);

    /** Which half of every ramp is shown. Alpha by default — it is what the roles actually read. */
    protected readonly rampKind = signal<'' | 'a'>('a');

    /** The scheme the role pickers edit: whichever theme is on right now. */
    protected readonly scheme = computed(() => this.themeService.colorScheme());

    protected readonly roleGroups = computed(() =>
        ROLE_GROUPS.map(({ key, labelKey }) => ({
            labelKey,
            roles: DOCS_THEMEABLE_ROLES.filter((role) => role.group === key)
        }))
    );

    /** Semantic ramps above the engineering ones, filtered to the scheme being edited. */
    protected readonly rolePickerGroups = computed(() =>
        this.playground.catalogFor(this.scheme(), {
            semantic: this.t('pickerSemanticGroup'),
            palette: this.t('pickerPaletteGroup')
        })
    );

    /**
     * Both schemes side by side: a theme repoints both, and seeing only the active one was why
     * nobody noticed these rows.
     */
    protected readonly ramps = computed(() => {
        const alpha = this.rampKind();
        const selection = this.playground.selection();

        return this.families.map(({ key, labelKey }) => ({
            labelKey,
            source: selection[key],
            rows: [
                {
                    schemeKey: 'playgroundRampsLight' as DocsTranslationKey,
                    variables: this.steps.map((step) => `--kbq-semantic-${key.toLowerCase()}-${alpha}${step}`)
                },
                {
                    schemeKey: 'playgroundRampsDark' as DocsTranslationKey,
                    variables: this.steps.map((step) => `--kbq-semantic-${this.darkName(key)}-${alpha}${step}`)
                }
            ]
        }));
    });

    constructor() {
        super();

        // styleSheets only exists in the browser; the docs app is prerendered.
        afterNextRender(() => this.playground.init());

        inject(DestroyRef).onDestroy(() => this.playground.teardown());
    }

    protected inspect(variable: string): void {
        this.inspected.set(variable);
        this.chain.set(this.playground.resolveChain(variable, this.themeService.colorScheme()));
    }

    protected copyPatch(): void {
        if (this.playground.changedFamilies().length === 0) return;

        this.clipboard.copyWithToast(this.playground.buildPatch());
    }

    /** Persists the knobs as the visitor's one custom theme, overwriting whatever was there. */
    protected saveTheme(): void {
        this.playground.saveTheme();

        this.toastService.show({ style: 'success', title: this.t('playgroundThemeSaved') });
    }

    protected copyCss(): void {
        this.clipboard.copyWithToast(this.playground.buildCssExport());
    }

    protected swatch(token: string): string {
        return docsSwatchStyle(token);
    }

    /** What a family knob shows: any step of the ramp it currently points at. */
    protected familyValue(key: string): string | null {
        return this.playground.familyPreview(this.playground.selection()[key]);
    }

    /** A click on any step of a ramp repoints the whole family. */
    protected selectFamily(key: string, token: string | null): void {
        const family = token && this.playground.familyFromToken(token);

        if (family) this.playground.select(key, family);
    }

    protected rolePin(token: string): string | null {
        return this.playground.roles()[token]?.[this.scheme()] ?? null;
    }

    protected roleDefault(token: string): string {
        return this.playground.roleDefaults()[token]?.[this.scheme()] ?? '';
    }

    protected pinRole(token: string, source: string | null): void {
        if (source) this.playground.pinRole(token, this.scheme(), source);
    }

    protected unpinRole(token: string): void {
        this.playground.unpinRole(token, this.scheme());
    }

    private darkName(key: string): string {
        return `dark-${key.toLowerCase()}`;
    }
}
