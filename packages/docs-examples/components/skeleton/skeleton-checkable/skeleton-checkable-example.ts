import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSkeletonCheckable } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Skeleton checkable preset
 */
@Component({
    selector: 'skeleton-checkable-example',
    imports: [
        KbqSkeletonCheckable,
        KbqToggleModule,
        FormsModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqFormFieldModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-checkable hint />
            <kbq-skeleton-checkable control="radio" [rows]="3" />
            <kbq-skeleton-checkable control="toggle" hint />
        } @else {
            <kbq-checkbox>
                Synchronize every hour
                <kbq-hint>{{ text().syncHint }}</kbq-hint>
            </kbq-checkbox>
            <kbq-radio-group name="protocol">
                <kbq-radio-button [checked]="true" [value]="'ldaps'">LDAPS</kbq-radio-button>
                <kbq-radio-button [value]="'ldap'">LDAP</kbq-radio-button>
                <kbq-radio-button [value]="'starttls'">LDAP with StartTLS</kbq-radio-button>
            </kbq-radio-group>
            <kbq-toggle>
                Notify the administrators
                <kbq-hint>{{ text().notifyHint }}</kbq-hint>
            </kbq-toggle>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCheckableExample extends BaseLocalizedExample<ExampleText> {
    protected readonly loading = model(true);

    constructor() {
        super(TEXT);
    }
}
