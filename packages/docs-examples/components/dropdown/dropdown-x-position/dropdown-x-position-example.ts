import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule, KbqDropdownPositionX } from '@koobiq/components/dropdown';

/**
 * @title Dropdown xPosition
 */
@Component({
    selector: 'dropdown-x-position-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqDividerModule],
    template: `
        <div style="display: flex; gap: 8px; margin-bottom: 16px">
            @for (pos of positions; track pos) {
                <button kbq-button (click)="setPosition(pos)">{{ pos }}</button>
            }
        </div>

        <button kbq-button [kbqDropdownTriggerFor]="appDropdown">Dropdown ({{ xPosition() }})</button>

        <kbq-dropdown #appDropdown="kbqDropdown" [xPosition]="xPosition()">
            <button kbq-dropdown-item>Dropdown option 1</button>
            <button kbq-dropdown-item>Dropdown option 2</button>
            <kbq-divider />
            <button kbq-dropdown-item>Dropdown option 3</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center'
    }
})
export class DropdownXPositionExample {
    readonly positions: KbqDropdownPositionX[] = ['before', 'after', 'center'];
    readonly xPosition = signal<KbqDropdownPositionX>('center');

    setPosition(pos: KbqDropdownPositionX) {
        this.xPosition.set(pos);
    }
}
