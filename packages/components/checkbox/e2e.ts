import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

@Component({
    selector: 'e2e-checkbox-state-and-style',
    imports: [KbqCheckboxModule],
    template: `
        @for (type of types; track type) {
            <div>
                @for (state of states; track state) {
                    @for (color of colors; track color) {
                        <kbq-checkbox
                            [checked]="type === 'checked'"
                            [color]="color"
                            [disabled]="state === 'disabled'"
                            [class.kbq-hover]="state === 'hovered'"
                            [class.cdk-keyboard-focused]="state === 'focused'"
                            [indeterminate]="type === 'indeterminate'"
                        />
                    }
                }
            </div>
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
    readonly colors = [KbqComponentColors.Theme, KbqComponentColors.Error];
    readonly types = ['default', 'checked', 'indeterminate'] as const;
}

@Component({
    selector: 'e2e-checkbox-with-text-and-caption',
    imports: [KbqCheckboxModule, KbqFormFieldModule],
    template: `
        <!-- base -->
        <kbq-checkbox>Text</kbq-checkbox>
        <kbq-checkbox [big]="true">Text</kbq-checkbox>

        <!-- disabled -->
        <kbq-checkbox disabled>
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
        <kbq-checkbox disabled [big]="true">
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>

        <!-- with caption -->
        <kbq-checkbox>
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
        <kbq-checkbox [big]="true">
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>

        <!-- label position before -->
        <kbq-checkbox labelPosition="before">
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
        <kbq-checkbox labelPosition="before" [big]="true">
            Text
            <kbq-hint>Caption</kbq-hint>
        </kbq-checkbox>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCheckboxWithTextAndCaption'
    }
})
export class E2eCheckboxWithTextAndCaption {}
