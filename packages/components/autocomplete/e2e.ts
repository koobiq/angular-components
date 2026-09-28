import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KBQ_AUTOCOMPLETE_SCROLL_STRATEGY, KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqTextQuery } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';

@Component({
    selector: 'e2e-autocomplete-states',
    imports: [KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
            />
            <kbq-hint>Hint</kbq-hint>

            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of options; track $index) {
                    <kbq-option [disabled]="$index === 4" [value]="option">{{ option }}</kbq-option>
                }
                <kbq-autocomplete-footer>Footer</kbq-autocomplete-footer>
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
            height: 340px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteStates'
    }
})
export class E2eAutocompleteStates {
    protected readonly options = Array.from({ length: 20 }).map((_, i) => `Option ${i + 1}`);
}

@Component({
    selector: 'e2e-autocomplete-fallback-position',
    imports: [KbqInputModule, KbqAutocompleteModule],
    template: `
        <div class="bottom-anchored">
            <kbq-form-field data-testid="e2eFormField">
                <input
                    data-testid="e2eAutocompleteInput"
                    kbqInput
                    placeholder="Placeholder"
                    [kbqAutocomplete]="autocomplete"
                />
            </kbq-form-field>
        </div>

        <kbq-autocomplete #autocomplete="kbqAutocomplete">
            @for (option of options; track $index) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-autocomplete>
    `,
    styles: `
        :host {
            display: block;
            width: 100vw;
            height: 100vh;
        }

        .bottom-anchored {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteFallbackPosition'
    }
})
export class E2eAutocompleteFallbackPosition {
    protected readonly options = Array.from({ length: 8 }).map((_, i) => `Option ${i + 1}`);
}

@Component({
    selector: 'e2e-autocomplete-expand-on-results',
    imports: [FormsModule, KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field data-testid="e2eFormField">
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
                [(ngModel)]="query"
                (ngModelChange)="onQueryChange($event)"
            />
        </kbq-form-field>

        <kbq-autocomplete #autocomplete="kbqAutocomplete">
            @for (option of filtered(); track option) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-autocomplete>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteExpandOnResults'
    }
})
export class E2eAutocompleteExpandOnResults {
    private readonly all = Array.from({ length: 20 }).map((_, i) => `Option ${i + 1}`);

    protected query = '';
    protected readonly filtered = signal<string[]>(this.all.slice(0, 1));

    protected onQueryChange(value: string): void {
        const trimmed = value.trim().toLowerCase();

        this.filtered.set(trimmed ? this.all.filter((opt) => opt.toLowerCase().includes(trimmed)) : this.all.slice());
    }
}

@Component({
    selector: 'e2e-autocomplete-scroll-close',
    imports: [KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
            />
        </kbq-form-field>

        <div class="scroll-spacer"></div>

        <kbq-autocomplete #autocomplete="kbqAutocomplete">
            @for (option of options; track $index) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-autocomplete>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-m);
        }

        .scroll-spacer {
            height: 4000px;
        }
    `,
    providers: [
        {
            provide: KBQ_AUTOCOMPLETE_SCROLL_STRATEGY,
            useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
            deps: [Overlay]
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteScrollClose'
    }
})
export class E2eAutocompleteScrollClose {
    protected readonly options = Array.from({ length: 8 }).map((_, i) => `Option ${i + 1}`);
}

@Component({
    selector: 'e2e-autocomplete-scrollbar',
    imports: [KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
            />

            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of options; track $index) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            padding: var(--kbq-size-l);
            height: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteScrollbar'
    }
})
export class E2eAutocompleteScrollbar {
    protected readonly options = Array.from({ length: 40 }).map((_, i) => `Option ${i}`);
}

@Component({
    selector: 'e2e-autocomplete-scrollbar-no-overflow',
    imports: [KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
            />

            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteScrollbarNoOverflow'
    }
})
export class E2eAutocompleteScrollbarNoOverflow {
    protected readonly options = ['Option 1', 'Option 2', 'Option 3'];
}

const E2E_TEXT_OPTIONS = ['firewall', 'firmware', 'threat', 'threat hunting', 'vulnerability'];

@Component({
    selector: 'e2e-autocomplete-textarea',
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        KbqAutocompleteModule
    ],
    template: `
        <div class="e2e-autocomplete-text" data-testid="e2eScreenshotTarget">
            <kbq-form-field>
                <kbq-label>Description</kbq-label>
                <textarea
                    data-testid="e2eAutocompleteTextField"
                    kbqTextarea
                    [canGrow]="false"
                    [kbqAutocomplete]="autocomplete"
                    [kbqAutocompleteRelativeToCaret]="true"
                    [kbqAutocompleteTextMode]="true"
                    (kbqAutocompleteQueryChange)="query.set($event?.text ?? null)"
                ></textarea>
            </kbq-form-field>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" [autoActiveFirstOption]="true">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </div>
    `,
    styles: `
        .e2e-autocomplete-text {
            width: 480px;
            height: 260px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteTextarea'
    }
})
export class E2eAutocompleteTextarea {
    protected readonly query = signal<string | null>(null);
    protected readonly filteredOptions = computed(() => {
        const text = this.query()?.toLowerCase();

        return text ? E2E_TEXT_OPTIONS.filter((option) => option.startsWith(text)) : [];
    });
}

@Component({
    selector: 'e2e-autocomplete-triggers',
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        KbqAutocompleteModule
    ],
    template: `
        <div class="e2e-autocomplete-text">
            <kbq-form-field>
                <kbq-label>Comment</kbq-label>
                <textarea
                    data-testid="e2eAutocompleteTextField"
                    kbqTextarea
                    [canGrow]="false"
                    [kbqAutocomplete]="autocomplete"
                    [kbqAutocompleteRelativeToCaret]="true"
                    [kbqAutocompleteTextMode]="true"
                    [kbqAutocompleteTriggers]="triggers"
                    (kbqAutocompleteQueryChange)="query.set($event)"
                ></textarea>
            </kbq-form-field>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" [autoActiveFirstOption]="true">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </div>
    `,
    styles: `
        .e2e-autocomplete-text {
            width: 480px;
            height: 260px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteTriggers'
    }
})
export class E2eAutocompleteTriggers {
    protected readonly triggers = ['/', '@'];
    protected readonly query = signal<KbqTextQuery | null>(null);
    protected readonly filteredOptions = computed(() => {
        const query = this.query();

        if (!query) return [];

        const options = query.trigger === '@' ? ['@alice', '@bob'] : ['/closed', '/escalate'];

        return options.filter((option) => option.slice(1).startsWith(query.text.toLowerCase()));
    });
}
