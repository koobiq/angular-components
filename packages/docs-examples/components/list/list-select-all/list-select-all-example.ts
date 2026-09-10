import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

/**
 * @title List select all
 */
@Component({
    selector: 'list-select-all-example',
    imports: [KbqListModule, KbqScrollbar, FormsModule],
    template: `
        <div class="example-list-select-all">
            <kbq-scrollbar class="example-list-select-all__scrollbar">
                <kbq-list-selection
                    class="layout-padding-horizontal-xxs"
                    aria-label="Incident types"
                    multiple="checkbox"
                    selectAll
                    [(ngModel)]="selected"
                >
                    @for (option of options; track option) {
                        <kbq-list-option [value]="option">{{ option }}</kbq-list-option>
                    }
                </kbq-list-selection>
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
}
