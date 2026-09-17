import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    model,
    output,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { DocsLocaleState } from '../../../services/locale';
import { docsSwatchStyle } from '../swatch';
import { DocsColorFamily, DocsColorGroup } from './palette-catalog';

/**
 * Two-pane colour picker: families on the left, every step of the chosen family on the right.
 *
 * Presentation only — it knows nothing about themes, roles or the semantic layer, which is what
 * lets the same component serve the family knobs, the role overrides and, later, the colour tabs.
 *
 * Hosted in a popover rather than a dropdown on purpose: `kbq-dropdown` closes on any click inside
 * its content, and picking a family here must not close the panel.
 */
@Component({
    selector: 'docs-color-picker',
    imports: [KbqButtonModule, KbqPopoverModule, KbqFormFieldModule, KbqInputModule, KbqIconModule],
    templateUrl: './color-picker.html',
    styleUrls: ['./color-picker.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-color-picker' }
})
export class DocsColorPicker extends DocsLocaleState {
    readonly groups = input.required<DocsColorGroup[]>();

    /** The chosen variable, or `null` while the target still follows its shipped default. */
    readonly value = model<string | null>(null);

    /** What the trigger shows while nothing is chosen — normally the default this target follows. */
    readonly placeholder = input('');

    readonly label = input('');
    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether the target can go back to following a default. A family knob always has a value. */
    readonly clearable = input(false, { transform: booleanAttribute });

    /** Emitted when the user asks to go back to the shipped default. */
    readonly cleared = output<void>();

    protected readonly popoverSize = PopUpSizes.Custom;
    protected readonly search = signal('');

    /** Which family's steps the right pane shows. Follows `value` until the user picks another. */
    private readonly browsed = signal<string | null>(null);

    protected readonly families = computed(() => this.groups().flatMap(({ families }) => families));

    /** The family the current value belongs to, so opening the panel lands on it. */
    protected readonly selectedFamily = computed(() => {
        const value = this.value();

        return value
            ? (this.families().find(({ steps }) => steps.some((step) => step.token === value))?.id ?? null)
            : null;
    });

    protected readonly activeFamily = computed<DocsColorFamily | null>(() => {
        const id = this.browsed() ?? this.selectedFamily();
        const families = this.families();

        return families.find((family) => family.id === id) ?? families[0] ?? null;
    });

    /** Steps of the active family, narrowed by the search box. */
    protected readonly steps = computed(() => {
        const query = this.search().trim().toLowerCase();
        const steps = this.activeFamily()?.steps ?? [];

        return query ? steps.filter(({ token }) => token.toLowerCase().includes(query)) : steps;
    });

    /** Families narrowed by the same search box, so a query reaches both panes. */
    protected readonly visibleGroups = computed(() => {
        const query = this.search().trim().toLowerCase();

        if (!query) return this.groups();

        return this.groups()
            .map(({ title, families }) => ({
                title,
                families: families.filter(
                    (family) =>
                        family.name.toLowerCase().includes(query) ||
                        family.steps.some(({ token }) => token.toLowerCase().includes(query))
                )
            }))
            .filter(({ families }) => families.length > 0);
    });

    protected swatch(token: string): string {
        return docsSwatchStyle(token);
    }

    protected browse(id: string): void {
        this.browsed.set(id);
    }

    protected choose(token: string): void {
        this.value.set(token);
    }

    protected clear(): void {
        this.value.set(null);
        this.browsed.set(null);
        this.cleared.emit();
    }

    protected onSearch(query: string): void {
        this.search.set(query);

        // A query that only matches another family should move the right pane there, otherwise the
        // panel shows an empty list next to a left pane full of hits.
        const [first] = this.visibleGroups();

        if (query.trim() && first?.families.length && !this.steps().length) {
            this.browsed.set(first.families[0].id);
        }
    }
}
