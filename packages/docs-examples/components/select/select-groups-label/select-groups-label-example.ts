import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Select group label
 */
@Component({
    selector: 'select-groups-label-example',
    imports: [KbqSelectModule, KbqBadgeModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="t().placeholder" [value]="selected">
                @for (group of pokemonTypes; track group.name) {
                    <kbq-optgroup #optgroup="kbqOptgroup" [label]="group.name">
                        <div kbq-optgroup-label>
                            {{ group.name }}
                            <kbq-badge aria-hidden="true">{{ optgroup.selectedCount }}</kbq-badge>
                        </div>
                        @for (pokemon of group.pokemon; track pokemon.value) {
                            <kbq-option [value]="pokemon.value">{{ pokemon.viewValue }}</kbq-option>
                        }
                    </kbq-optgroup>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectGroupsLabelExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly pokemonTypes = [
        {
            name: 'Grass',
            pokemon: [
                { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
                { value: 'oddish-1', viewValue: 'Oddish' },
                { value: 'bellsprout-2', viewValue: 'Bellsprout' }
            ]
        },
        {
            name: 'Water',
            pokemon: [
                { value: 'squirtle-3', viewValue: 'Squirtle' },
                { value: 'psyduck-4', viewValue: 'Psyduck' },
                { value: 'horsea-5', viewValue: 'Horsea' }
            ]
        },
        {
            name: 'Fire',
            pokemon: [
                { value: 'charmander-6', viewValue: 'Charmander' },
                { value: 'vulpix-7', viewValue: 'Vulpix' }
            ]
        }
    ];

    readonly selected = ['bulbasaur-0', 'oddish-1'];
}
