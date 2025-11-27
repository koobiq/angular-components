import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle multiline example
 */
@Component({
    selector: 'toggle-multiline-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <div
            class="example-toggle-multiline__container layout-align-center-start layout-column layout-gap-s layout-padding-top-l layout-padding-left-l layout-padding-right-l layout-padding-bottom-xl "
        >
            <kbq-toggle labelPosition="left">
                Shake to undo
                <kbq-hint>
                    If you tend to share your phone by accident, you can disable
                    <span class="kbq-text-compact-strong">Shake to Undo</span>
                    to prevent the
                    <span class="kbq-text-compact-strong">Undo</span>
                    alert from appearing.
                </kbq-hint>
            </kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-multiline__container {
            max-width: 320px;
            background: var(--kbq-background-card);
            box-shadow: var(--kbq-shadow-card);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    host: {
        class: 'layout-align-center-center layout-row layout-margin-top-l layout-margin-bottom-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleMultilineExample {}
