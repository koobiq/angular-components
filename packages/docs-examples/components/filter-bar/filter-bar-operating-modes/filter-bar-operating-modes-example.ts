import { Component } from '@angular/core';
import { KbqFilterBarModule, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-operating-modes
 */
@Component({
    standalone: true,
    selector: 'filter-bar-operating-modes-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <div class="docs-grid kbq-text-normal">
            <div></div>
            <div>Cleanable</div>
            <div>Removable</div>
            <div>Required</div>
            <div class="row-header">Empty</div>
            <div>
                <ng-container *kbq-pipe="emptyCleanable" />
            </div>
            <div>
                <ng-container *kbq-pipe="emptyRemovable" />
                <div class="layout-margin-top-s kbq-text-compact">Крестик удаляет кнопку</div>
            </div>
            <div>
                <div class="layout-margin-top-s kbq-text-compact">Фильтр нельзя удалить</div>
            </div>
            <div class="row-header">Filled</div>
            <div>
                <ng-container *kbq-pipe="filledCleanable" />
                <div class="layout-margin-top-s kbq-text-compact">Крестик не удаляет кнопку</div>
            </div>
            <div>
                <ng-container *kbq-pipe="filledRemovable" />
                <div class="layout-margin-top-s kbq-text-compact">Крестик удаляет кнопку</div>
            </div>
            <div>
                <ng-container *kbq-pipe="filledRequired" />
                <div class="layout-margin-top-s kbq-text-compact">Фильтр нельзя очистить</div>
            </div>
        </div>
    `,
    styles: `
        .docs-grid {
            margin: 16px auto;

            justify-self: center;

            display: grid;
            grid-template-columns: 80px 132px 132px 132px;
            grid-template-rows: repeat(3, 0fr);
            grid-column-gap: 40px;
            grid-row-gap: 25px;

            width: 600px;

            color: var(--kbq-foreground-contrast-secondary);

            .row-header {
                padding-left: 40px;
            }
        }
    `
})
export class FilterBarOperatingModesExample {
    base = {
        name: 'Filter',
        type: KbqPipeTypes.Text,

        required: false,
        cleanable: false,
        removable: false,
        disabled: false
    };

    emptyCleanable = { ...this.base, cleanable: true };
    emptyRemovable = { ...this.base, removable: true };
    filledCleanable = { ...this.base, value: 'Value', cleanable: true };
    filledRemovable = { ...this.base, value: 'Value', removable: true };
    filledRequired = { ...this.base, value: 'Value', required: true };
}
