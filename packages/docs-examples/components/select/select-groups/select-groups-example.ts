import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select groups
 */
@Component({
    standalone: true,
    selector: 'select-groups-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field style="width: 320px">
            <kbq-select [(value)]="pokemonTypes[0].pokemon[0].value">
                @for (group of pokemonTypes; track group) {
                    <kbq-optgroup [disabled]="group.disabled" [label]="group.name">
                        @for (pokemon of group.pokemon; track pokemon) {
                            <kbq-option [value]="pokemon.value">
                                {{ pokemon.viewValue }}
                            </kbq-option>
                        }
                    </kbq-optgroup>
                }
                <kbq-option [value]="'mime-11'">Mr. Mime</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: 16px;
        }
    `
})
export class SelectGroupsExample {
    pokemonTypes = [
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
            disabled: true,
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
                { value: 'vulpix-7', viewValue: 'Vulpix' },
                { value: 'flareon-8', viewValue: 'Flareon' }
            ]
        },
        {
            name: 'Psychic',
            pokemon: [
                { value: 'mew-9', viewValue: 'Mew' },
                { value: 'mewtwo-10', viewValue: 'Mewtwo' }
            ]
        }
    ];
}
