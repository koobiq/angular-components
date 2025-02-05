import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqListModule } from '@koobiq/components/list';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select groups
 */
@Component({
    standalone: true,
    selector: 'select-groups-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqListModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="securityCategories[0].securityItems[0].id">
                @for (category of securityCategories; track category) {
                    <kbq-optgroup [disabled]="category.disabled" [label]="category.categoryName">
                        @for (securityItem of category.securityItems; track securityItem.id) {
                            <kbq-option [value]="securityItem.id">
                                {{ securityItem.displayName }}
                            </kbq-option>
                        }
                    </kbq-optgroup>
                }
                <kbq-option [value]="'rbac-11'">Role-Based Access Control (RBAC)</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectGroupsExample {
    securityCategories = [
        {
            categoryName: 'Network Security',
            securityItems: [
                { id: 'firewall-0', displayName: 'Firewall' },
                { id: 'vpn-1', displayName: 'Virtual Private Network (VPN)' },
                { id: 'ids-2', displayName: 'Intrusion Detection System (IDS)' }
            ]
        },
        {
            categoryName: 'Application Security',
            disabled: true,
            securityItems: [
                { id: 'sast-3', displayName: 'Static Application Security Testing (SAST)' },
                { id: 'owasp-4', displayName: 'OWASP Top 10' },
                { id: 'code-review-5', displayName: 'Code Review' }
            ]
        },
        {
            categoryName: 'Cloud Security',
            securityItems: [
                { id: 'iam-6', displayName: 'Identity and Access Management (IAM)' },
                { id: 'cspm-7', displayName: 'Cloud Security Posture Management (CSPM)' },
                { id: 'casb-8', displayName: 'Cloud Access Security Broker (CASB)' }
            ]
        },
        {
            categoryName: 'Endpoint Security',
            securityItems: [
                { id: 'antivirus-9', displayName: 'Antivirus' },
                { id: 'edr-10', displayName: 'Endpoint Detection and Response (EDR)' }
            ]
        }
    ];
}
