import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { enUSLocaleDataSet } from '../en-US';
import { esLALocaleDataSet } from '../es-LA';
import { faIRLocaleDataSet } from '../fa-IR';
import { ptBRLocaleDataSet } from '../pt-BR';
import { ruRULocaleDataSet } from '../ru-RU';
import { zhCNLocaleDataSet } from '../zh-CN';

const localeDataSet = {
    'en-US': enUSLocaleDataSet,
    'zh-CN': zhCNLocaleDataSet,
    'es-LA': esLALocaleDataSet,
    'pt-BR': ptBRLocaleDataSet,
    'ru-RU': ruRULocaleDataSet,
    'fa-IR': faIRLocaleDataSet
};

/**
 * @title Select disabled
 */
@Component({
    standalone: true,
    selector: 'select-disabled-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    templateUrl: 'select-disabled-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .example-row {
            width: 440px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
            align-items: center;
            gap: var(--kbq-size-xxl);
            justify-content: flex-end;
        }

        kbq-form-field {
            width: 320px;
        }

        .kbq-form__label {
            white-space: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectDisabledExample {
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
    selected = '';
    selectedDisabled = '';

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = localeDataSet[locale].items[0];
        this.selectedDisabled = localeDataSet[locale].items[0];
    };
}
