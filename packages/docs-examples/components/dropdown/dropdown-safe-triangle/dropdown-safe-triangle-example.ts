import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Dropdown safe triangle
 */
@Component({
    selector: 'dropdown-safe-triangle-example',
    imports: [KbqDropdownModule, KbqToggleModule, KbqButtonModule, KbqIconModule, KbqDividerModule],
    template: `
        <kbq-toggle [checked]="safeTriangle()" (change)="safeTriangle.set($event.checked)">Safe Area</kbq-toggle>

        <button kbq-button [kbqDropdownTriggerFor]="appDropdown">
            File
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #appDropdown="kbqDropdown" [safeTriangle]="safeTriangle()">
            <button kbq-dropdown-item>New</button>
            <button kbq-dropdown-item>Open</button>
            <button kbq-dropdown-item [kbqDropdownTriggerFor]="appDropdownNested">Share</button>
            <button kbq-dropdown-item>Save</button>
            <button kbq-dropdown-item>Save as...</button>
            <button kbq-dropdown-item>Rename</button>
            <button kbq-dropdown-item>Move</button>

            <kbq-divider />

            <button kbq-dropdown-item>Print</button>
        </kbq-dropdown>

        <kbq-dropdown #appDropdownNested="kbqDropdown">
            <button kbq-dropdown-item>Email as attachment</button>
            <button kbq-dropdown-item>Publish to web</button>
            <button kbq-dropdown-item>Share with people</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-s'
    }
})
export class DropdownSafeTriangleExample {
    /**
     * Enabled by default so the effect is visible immediately — move the pointer diagonally from
     * "Share" toward its submenu, crossing "Save" on the way, and the submenu stays open. Toggle off
     * to compare against the default (no safe triangle) behavior.
     */
    readonly safeTriangle = signal(true);
}
