import { Component } from '@angular/core';
import { KbqListModule } from '@koobiq/components/list';

/**
 * @title List groups
 */
@Component({
    standalone: true,
    selector: 'list-groups-example',
    imports: [KbqListModule],
    template: `
        <kbq-list-selection>
            @for (group of pokemonTypes; track group) {
                <kbq-optgroup [disabled]="group.disabled" [label]="group.name">
                    @for (pokemon of group.pokemon; track pokemon) {
                        <kbq-list-option [value]="pokemon.value">
                            {{ pokemon.viewValue }}
                        </kbq-list-option>
                    }
                </kbq-optgroup>
            }
            <kbq-list-option [value]="'mime-11'">Mr. Mime</kbq-list-option>
        </kbq-list-selection>
    `
})
export class ListGroupsExample {
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
