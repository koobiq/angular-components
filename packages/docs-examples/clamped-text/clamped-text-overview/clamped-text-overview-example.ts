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
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedTextOverviewExample {
    protected readonly collapsed = signal(true);
    protected readonly text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');
}
