import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

@Component({
    selector: 'e2e-checkbox-state-and-style',
    imports: [KbqCheckboxModule],
    template: `
        @for (state of states; track state) {
            @for (type of types; track type) {
                <div>
                    @for (color of colors; track color) {
                        <kbq-checkbox
                            [checked]="type === 'checked'"
                            [color]="color"
                            [disabled]="state === 'disabled'"
                            [class.kbq-hover]="state === 'hovered'"
                            [class.cdk-keyboard-focused]="state === 'focused'"
                            [indeterminate]="type === 'indeterminate'"
                            [big]="type === 'big'"
                        />
                    }
                </div>
            }
        }
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCheckboxStateAndStyle'
    }
})
export class E2eCheckboxStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
    readonly colors = Object.values(KbqComponentColors);
    readonly types = ['default', 'checked', 'indeterminate', 'big'] as const;
}

@Component({
    selector: 'e2e-checkbox-with-text-and-caption',
    imports: [KbqCheckboxModule, KbqFormFieldModule],
    template: `
        <kbq-checkbox>
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
        <kbq-checkbox disabled>
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
        <kbq-checkbox [big]="true">
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCheckboxWithTextAndCaption'
    }
})
export class E2eCheckboxWithTextAndCaption {}
