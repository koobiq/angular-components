import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';
import { injectLocalizedText } from '../localized-data';

const ATTACK_TYPES: KbqSelectValue[] = [
    'Adversary-in-the-Middle',
    'Brute Force',
    'Buffer Overflow',
    'Command and Control',
    'Credential Stuffing',
    'Cross-Site Scripting',
    'Denial of Service',
    'DNS Spoofing',
    'Drive-by Download',
    'Eavesdropping',
    'Exploit Kit',
    'Keylogging',
    'Man-in-the-Middle',
    'Phishing',
    'Privilege Escalation',
    'Ransomware',
    'Rootkit',
    'SQL Injection',
    'Trojan Horse',
    'Zero-Day Exploit'
].map((name) => ({ name, id: name, value: name }));

/**
 * @title filter-bar-not-specified
 */
@Component({
    selector: 'filter-bar-not-specified-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="activeFilter">
            @for (pipe of activeFilter().pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarNotSpecifiedExample {
    /** Text the example owns; the option is worded to agree with the name of the filter. */
    protected readonly text = injectLocalizedText({
        'ru-RU': { name: 'Тип атаки', notSpecified: 'Не указан' },
        default: { name: 'Attack Type', notSpecified: 'Not specified' }
    });

    /** Objects whose attack type is not set: the first option of the list. */
    private readonly notSpecified = computed<KbqSelectValue>(() => ({
        name: this.text().notSpecified,
        id: 'NotSpecified',
        value: null
    }));

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: this.text().name,
            id: 'AttackType',
            type: KbqPipeTypes.MultiSelect,
            values: [this.notSpecified(), ...ATTACK_TYPES],

            cleanable: false,
            removable: true,
            disabled: false
        }
    ]);

    // Rebuilt whenever the locale changes: `*kbqPipe` builds a pipe component once from the object it is
    // given, so relabelled pipes only reach the screen as new objects.
    readonly activeFilter = linkedSignal<KbqFilter>(() => ({
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: this.text().name,
                id: 'AttackType',
                type: KbqPipeTypes.MultiSelect,
                value: [this.notSpecified()],
                search: true,
                selectAll: true,

                cleanable: false,
                removable: true,
                disabled: false
            }
        ]
    }));
}
