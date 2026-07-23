import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KBQ_AUTOCOMPLETE_SCROLL_STRATEGY, KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqInputModule } from '@koobiq/components/input';

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
