import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqClampedText } from '@koobiq/components/clamped-text';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Clamped-text overview
 */
@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText, KbqToggleModule],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-clamped-text [isCollapsed]="collapsed()" (isCollapsedChange)="collapsed.set($event)">
                {{ text }}
            </kbq-clamped-text>
        </div>

        <kbq-toggle [checked]="collapsed()" (change)="collapsed.set($event.checked)">Collapsed</kbq-toggle>
    `,
    styles: `
        :host > div {
            overflow: auto;
            resize: horizontal;
            max-width: 100%;
            min-width: 150px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedTextOverviewExample {
    protected readonly collapsed = signal(true);
    protected readonly text =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur  adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
}
