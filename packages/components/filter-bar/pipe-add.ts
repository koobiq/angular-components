import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    output,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOption, KbqOptionModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KBQ_FILTER_BAR_HOST, KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';
import { getId } from './pipes/base-pipe';

@Component({
    selector: 'kbq-pipe-add',
    imports: [
        KbqDropdownModule,
        KbqToolTipModule,
        KbqButtonModule,
        KbqIcon,
        KbqOptionModule,
        KbqSelectModule
    ],
    template: `
        <kbq-select #select [tabIndex]="-1" [multiple]="true" [value]="addedPipes()" [compareWith]="compareWith">
            <button
                kbqTooltip="{{ filterBar.configuration.add.tooltip }}"
                kbq-button
                kbq-select-matcher
                [attr.aria-label]="filterBar.configuration.add.tooltip"
                [color]="'contrast-fade'"
                [kbqStyle]="'outline'"
                [class]="{ 'kbq-active': select.panelOpen }"
            >
                <i kbq-icon="kbq-plus_16" aria-hidden="true"></i>
            </button>

            @for (template of filterBar.pipeTemplates; track template) {
                <kbq-option
                    #option
                    [userSelect]="true"
                    [value]="template"
                    [showCheckbox]="false"
                    (click)="addPipeFromTemplate(option)"
                    (keydown.enter)="addPipeFromTemplate(option)"
                    (keydown.space)="addPipeFromTemplate(option)"
                >
                    {{ template.name }}
                </kbq-option>
            }
        </kbq-select>

        <!-- Announces a newly-added pipe to assistive tech (WCAG 4.1.3). -->
        <div class="cdk-visually-hidden" aria-live="polite" aria-atomic="true">{{ announcement() }}</div>
    `,
    styleUrl: 'pipe-add.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe-add'
    }
})
export class KbqPipeAdd {
    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KBQ_FILTER_BAR_HOST);

    /** @docs-private */
    readonly select = viewChild.required(KbqSelect);

    /** Event that is generated after add pipe. */
    readonly onAddPipe = output<KbqPipeTemplate>();

    /** template of filter */
    readonly filterTemplate = input<KbqFilter>({
        name: '',
        pipes: [],
        readonly: false,
        disabled: false,
        changed: false,
        saved: false
    });

    /**
     * Ids of the pipes already added to the current filter. Used to open an already-added pipe.
     * Derived from the `filter` signal so it stays in sync without the retired `changes` bus.
     */
    readonly addedPipes = computed(() => this.filterBar.filter?.pipes.map((pipe: KbqPipe) => getId(pipe)) ?? []);

    /**
     * Visually-hidden live-region text announcing a newly-added pipe to assistive tech (WCAG 4.1.3).
     * @docs-private
     */
    protected readonly announcement = signal('');

    addPipeFromTemplate(option: KbqOption) {
        if (option.selected) {
            this.filterBar.openPipe.next(getId(option.value));
        } else {
            option.select();

            const current = this.filterBar.filter ?? structuredClone(this.filterTemplate());

            // Build a new filter reference (immutable add) so the `filter` signal reacts; keep `pipes` on a
            // new-reference-on-change model instead of an in-place push.
            this.filterBar.filter = {
                ...current,
                changed: true,
                pipes: [
                    ...current.pipes,
                    Object.assign({}, option.value, { values: undefined, valueTemplate: undefined, openOnAdd: true })
                ]
            };

            this.onAddPipe.emit(option.value);
            this.filterBar.filterChange.emit(this.filterBar.filter);

            this.announcement.set(
                this.filterBar.configuration.add.addedAnnouncement.replace('{{ name }}', option.value.name)
            );
        }

        this.select().close();
    }

    /**
     * Function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     */
    compareWith(o1: KbqPipe, o2: string): boolean {
        return getId(o1) === o2;
    }
}
