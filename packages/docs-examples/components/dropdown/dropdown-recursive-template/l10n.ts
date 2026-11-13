import { Translations } from '@koobiq/docs-examples/i18n';

/** Menu tree of the recursive-template example. */
export interface ExampleTranslation {
    items: DropdownItem[];
}

/** One node of the recursive menu. */
export interface DropdownItem {
    label: string;
    children?: DropdownItem[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        items: [
            { label: 'Уровень 1 - Настройки безопасности' },
            {
                label: 'Уровень 1 - Шифрование',
                children: [
                    { label: 'Уровень 2 - SSL/TLS' },
                    {
                        label: 'Уровень 2 - Шифрование AES',
                        children: [
                            {
                                label: 'Уровень 3 - Управление ключами',
                                children: [
                                    { label: 'Уровень 4 - Инфраструктура открытых ключей (PKI)' },
                                    { label: 'Уровень 4 - Управление симметричными ключами' },
                                    { label: 'Уровень 4 - Алгоритмы обмена ключами' }
                                ]
                            },
                            { label: 'Уровень 3 - Стандарты шифрования' }
                        ]
                    },
                    { label: 'Уровень 2 - Цифровые подписи' }
                ]
            },
            {
                label: 'Уровень 1 - Контроль доступа',
                children: [
                    { label: 'Уровень 2 - Ролевой контроль доступа (RBAC)' },
                    { label: 'Уровень 2 - Многофакторная аутентификация (MFA)' },
                    { label: 'Уровень 2 - Принцип минимальных привилегий' }
                ]
            }
        ]
    },
    default: {
        items: [
            { label: 'Level 1 - Security Settings' },
            {
                label: 'Level 1 - Encryption',
                children: [
                    { label: 'Level 2 - SSL/TLS' },
                    {
                        label: 'Level 2 - AES Encryption',
                        children: [
                            {
                                label: 'Level 3 - Key Management',
                                children: [
                                    { label: 'Level 4 - Public Key Infrastructure (PKI)' },
                                    { label: 'Level 4 - Symmetric Key Management' },
                                    { label: 'Level 4 - Key Exchange Algorithms' }
                                ]
                            },
                            { label: 'Level 3 - Encryption Standards' }
                        ]
                    },
                    { label: 'Level 2 - Digital Signatures' }
                ]
            },
            {
                label: 'Level 1 - Access Control',
                children: [
                    { label: 'Level 2 - Role-Based Access Control (RBAC)' },
                    { label: 'Level 2 - Multi-Factor Authentication (MFA)' },
                    { label: 'Level 2 - Least Privilege Principle' }
                ]
            }
        ]
    }
};
