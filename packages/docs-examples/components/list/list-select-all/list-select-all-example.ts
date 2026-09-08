import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createSearchPredicate, KbqHighlightBackgroundPipe, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * @title List select all
 */
@Component({
    selector: 'list-select-all-example',
    imports: [
        KbqListModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqEmptyStateModule,
        KbqScrollbar,
        KbqHighlightBackgroundPipe,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `
        <div class="example-list-select-all">
            <kbq-form-field>
                <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
                <input kbqInput type="text" placeholder="Search" autocomplete="off" [formControl]="searchControl" />
                <kbq-cleaner />
            </kbq-form-field>

            <kbq-scrollbar class="example-list-select-all__scrollbar">
                <kbq-list-selection
                    class="layout-padding-horizontal-xxs"
                    aria-label="Incident types"
                    multiple="checkbox"
                    selectAll
                    [(ngModel)]="selected"
                >
                    @for (option of filteredOptions(); track option) {
                        <kbq-list-option [value]="option">
                            <span [innerHTML]="option | kbqHighlightBackground: searchTokens() : true"></span>
                        </kbq-list-option>
                    }
                </kbq-list-selection>

                @if (!filteredOptions().length) {
                    <kbq-empty-state class="example-list-select-all__empty-state">
                        <span kbq-empty-state-text>Nothing found</span>
                    </kbq-empty-state>
                }
            </kbq-scrollbar>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .example-list-select-all {
            width: 400px;
        }

        /* 8.5 rows of 32px: the half row is what says there is more below. The parent stays a block, because
           the scrollbar host is a flex item whose flex-basis would otherwise outrank this height. */
        .example-list-select-all__scrollbar {
            height: 272px;
            margin-top: var(--kbq-size-m);
        }

        /* Fills the fixed-height viewport, so the message is centered rather than pinned to the top. */
        .example-list-select-all__empty-state {
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSelectAllExample {
    protected readonly options = [
        'Account Compromise',
        'Data Breach',
        'Denial of Service (DoS)',
        'Insider Threat',
        'Malware Infection',
        'Man-in-the-Middle Attack',
        'Phishing',
        'Privilege Escalation',
        'Ransomware',
        'Social Engineering',
        'SQL Injection',
        'Supply Chain Attack',
        'Unauthorized Access',
        'Zero-Day Exploit'
    ];

    protected selected: string[] = [];

    protected readonly searchControl = new FormControl('', { nonNullable: true });

    /** Debounced query behind both the filter and the highlighter, so the two can never disagree. */
    private readonly query = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), {
        initialValue: ''
    });

    protected readonly filteredOptions = computed(() => this.options.filter(createSearchPredicate(this.query())));

    /** Memoized: a getter would re-tokenize once per option on every change detection pass. */
    protected readonly searchTokens = computed(() => tokenizeSearchQuery(this.query()));
}
