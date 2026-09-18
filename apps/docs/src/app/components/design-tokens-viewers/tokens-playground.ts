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
import { KbqToggleModule } from '@koobiq/components/toggle';
import { DocsClipboardService } from 'src/app/services/clipboard';
import { DocsLocaleState } from '../../services/locale';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';
import { DOCS_PALETTE_STEPS, DOCS_THEMEABLE_FAMILIES, DocsTokensPlaygroundService } from './tokens-playground.service';

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
        KbqCheckboxModule,
        KbqDividerModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        KbqLinkModule,
        KbqProgressBarModule,
        KbqRadioModule,
        KbqSelectModule,
        KbqToggleModule
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
    private readonly clipboard = inject(DocsClipboardService);
    private readonly themeService = inject(KbqThemeService);

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

    /** `dark*` families back the dark theme, so the swatches have to follow the active theme. */
    protected readonly ramps = computed(() => {
        const dark = this.themeService.colorScheme() === 'dark';

        // Touch the selection so the swatches re-render when a family is repointed.
        this.playground.selection();

        return this.families.map(({ key, labelKey }) => ({
            labelKey,
            variables: this.steps.map(
                (step) => `--kbq-semantic-${dark ? this.darkName(key) : key.toLowerCase()}-${step}`
            )
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

    private darkName(key: string): string {
        return `dark-${key.toLowerCase()}`;
    }
}
