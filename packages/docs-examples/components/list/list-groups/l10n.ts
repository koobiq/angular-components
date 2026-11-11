import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** One security control of the groups example. */
export interface SecurityItem {
    id: string;
    displayName: string;
}

/** Security categories of the groups example. */
export interface ExampleText {
    categories: { categoryName: string; disabled?: boolean; securityItems: SecurityItem[] }[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        categories: [
            {
                categoryName: 'Сетевая безопасность',
                securityItems: [
                    { id: 'firewall-0', displayName: 'Межсетевой экран' },
                    { id: 'vpn-1', displayName: 'Виртуальная частная сеть (VPN)' },
                    { id: 'ids-2', displayName: 'Система обнаружения вторжений (IDS)' }
                ]
            },
            {
                categoryName: 'Безопасность приложений',
                disabled: true,
                securityItems: [
                    { id: 'sast-3', displayName: 'Статическое тестирование безопасности (SAST)' },
                    { id: 'owasp-4', displayName: 'OWASP Top 10' },
                    { id: 'code-review-5', displayName: 'Ревью кода' }
                ]
            },
            {
                categoryName: 'Облачная безопасность',
                securityItems: [
                    { id: 'iam-6', displayName: 'Управление идентификацией и доступом (IAM)' },
                    { id: 'cspm-7', displayName: 'Управление конфигурацией облака (CSPM)' },
                    { id: 'casb-8', displayName: 'Облачный брокер безопасности (CASB)' }
                ]
            },
            {
                categoryName: 'Безопасность конечных точек',
                securityItems: [
                    { id: 'antivirus-9', displayName: 'Антивирус' },
                    { id: 'edr-10', displayName: 'Обнаружение и реагирование на конечных точках (EDR)' }
                ]
            }
        ]
    },
    default: {
        categories: [
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
        ]
    }
};

/** Security categories of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
