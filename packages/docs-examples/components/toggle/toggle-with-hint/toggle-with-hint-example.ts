import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle With Hint
 */
@Component({
    standalone: true,
    selector: 'toggle-with-hint-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <div class="example-toggle-with-hint__container layout-align-center-start layout-column layout-gap-s">
            <div>Touch</div>
            <kbq-toggle>
                Tap to wake
                <kbq-hint>Wake the screen when you tap on the display</kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                Shake to undo
                <kbq-hint>
                    If you tend to share your phone by accident, you can disable Shake to Undo to prevent the Undo alert
                    from appearing.
                </kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                Vibration
                <kbq-hint>
                    When this witch is off, all vibration on your phone will be disabled, including those for
                    earthquake, tsunami and other emergency alerts.
                </kbq-hint>
            </kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-with-hint__container {
            max-width: 320px;
        }
    `,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-top-l layout-padding-bottom-3xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleWithHintExample {}
