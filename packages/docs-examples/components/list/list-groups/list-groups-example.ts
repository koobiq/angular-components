import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqListModule } from '@koobiq/components/list';

/**
 * @title List groups
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'list-groups-example',
    imports: [KbqListModule],
    template: `
        <kbq-list-selection>
            @for (category of securityCategories; track category) {
                <kbq-optgroup [disabled]="category.disabled" [label]="category.categoryName">
                    @for (securityItem of category.securityItems; track securityItem.id) {
                        <kbq-list-option [value]="securityItem.id">
                            {{ securityItem.displayName }}
                        </kbq-list-option>
                    }
                </kbq-optgroup>
            }
            <kbq-list-option [value]="'rbac-11'">Role-Based Access Control (RBAC)</kbq-list-option>
        </kbq-list-selection>
    `
})
export class ListGroupsExample {
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
