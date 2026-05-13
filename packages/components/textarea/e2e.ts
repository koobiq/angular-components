import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

@Component({
    selector: 'e2e-textarea-states',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label | empty</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | value</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [(ngModel)]="value"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | disabled empty</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [disabled]="true"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | disabled value</kbq-label>
            <textarea
                kbqTextarea
                placeholder="Placeholder"
                canGrow="false"
                [disabled]="true"
                [(ngModel)]="value"
            ></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | invalid</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [formControl]="invalidControl"></textarea>
            <kbq-hint>Hint</kbq-hint>
            <kbq-error>Error</kbq-error>
        </kbq-form-field>

        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <kbq-label>Label | focused</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [(ngModel)]="value"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <kbq-label>Label | focused invalid</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [formControl]="invalidControl"></textarea>
            <kbq-hint>Hint</kbq-hint>
            <kbq-error>Error</kbq-error>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | maxRows</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [maxRows]="5" [(ngModel)]="longValue"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | canGrow</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [canGrow]="true" [(ngModel)]="longValue"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
        }
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTextareaStates'
    }
})
export class E2eTextareaStates {
    protected readonly value = model('Value');
    protected readonly longValue = model(
        'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
    );
    protected readonly invalidControl = new FormControl('', [Validators.minLength(10), Validators.required]);

    constructor() {
        this.invalidControl.markAsTouched();
        this.invalidControl.updateValueAndValidity();
    }
}

@Component({
    selector: 'e2e-textarea-grow-behavior',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea data-testid="grow_textarea" [(ngModel)]="value"></textarea>
        </kbq-form-field>

        <button data-testid="grow_set_short" type="button" (click)="value.set(short)">Short</button>
        <button data-testid="grow_set_medium" type="button" (click)="value.set(medium)">Medium</button>
        <button data-testid="grow_set_long" type="button" (click)="value.set(long)">Long</button>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-s);
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTextareaGrowBehavior'
    }
})
export class E2eTextareaGrowBehavior {
    protected readonly short = 'test\ntest';
    protected readonly medium = 'test\ntest\ntest';
    protected readonly long = 'test\ntest\ntest\ntest\ntest\ntest';

    protected readonly value = model<string>(this.medium);
}

const longTextareaContent =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque scelerisque non purus et tristique. Phasellus tincidunt eleifend mollis. Fusce non mi semper, accumsan erat ac, auctor nisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur mattis justo est, non egestas mauris venenatis vitae. Sed nisi orci, tincidunt eget est non, egestas volutpat quam. Etiam eget interdum urna. Duis vitae erat posuere est malesuada accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel hendrerit dui. Vivamus tristique nulla sagittis luctus semper.\nVestibulum a magna maximus, consequat sem sit amet, egestas magna. Nam nunc nulla, porttitor in dignissim nec, pharetra nec ante. Integer auctor, ex vel imperdiet vulputate, erat mauris suscipit ligula, vitae aliquet urna elit quis magna. Vivamus volutpat vel massa sit amet malesuada. Quisque accumsan a sem ac convallis. Sed euismod, elit in varius vehicula, odio eros interdum nisl, porta venenatis leo libero non arcu. Fusce rutrum ultrices venenatis. Vestibulum a elit vel metus tincidunt auctor id in turpis. Vivamus a mi faucibus, varius nunc sed, sagittis metus.\nDonec pharetra, orci viverra vulputate consequat, magna nunc feugiat erat, vel egestas enim nibh in ipsum. Pellentesque egestas mi in lectus accumsan sodales. Nunc gravida, purus ac pulvinar tristique, massa eros pellentesque tellus, vel feugiat lectus urna a est. Sed nibh erat, scelerisque et justo ut, gravida feugiat ante. Fusce sollicitudin mi ipsum, nec interdum nisl venenatis mollis. Etiam massa orci, vulputate vel nulla eget, interdum pellentesque orci. Proin faucibus consectetur nulla ut volutpat. Donec sodales vestibulum semper. Etiam dui est, condimentum eu odio nec, ullamcorper interdum quam. Duis rhoncus feugiat quam et ultrices. Duis mattis, libero eget euismod tempor, mauris neque malesuada odio, vitae vulputate est est sit amet sapien. Proin ut risus eu justo commodo blandit. Fusce feugiat nec mi eu finibus. Mauris sit amet nulla diam. Nullam eu venenatis metus.\nInteger pretium, augue eget ultrices commodo, tellus massa dignissim mauris, eu tempus quam lacus nec felis. Sed in molestie enim. Duis varius eu purus id rhoncus. Vestibulum iaculis ipsum dui. Cras scelerisque mauris a sapien interdum, non eleifend turpis aliquam. Cras bibendum id metus et malesuada. Curabitur dignissim euismod diam non venenatis. Curabitur posuere risus diam, in interdum ligula commodo vitae. Sed lobortis pharetra porta. Ut ut metus pharetra turpis laoreet tempor at sit amet nulla. Suspendisse blandit ullamcorper sem id faucibus. Vestibulum turpis urna, semper eget metus at, fermentum vestibulum libero. Ut id libero nec felis laoreet sodales.\nVestibulum vitae neque purus. Aliquam justo ipsum, consequat vel efficitur a, pharetra vitae dui. Nunc quis nibh ut velit cursus ultricies non faucibus nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque lacinia lacinia placerat. Mauris at dui sit amet turpis scelerisque egestas. Integer sapien purus, tincidunt at lectus eu, aliquet elementum massa. Nunc nec arcu quam. Nam tristique scelerisque odio, et porttitor arcu varius eu. Maecenas quis blandit neque. Curabitur consequat ultrices arcu sit amet commodo. Ut ex odio, consectetur vitae nisi at, feugiat tempor justo.';

@Component({
    selector: 'e2e-textarea-scroll-on-focus',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule],
    template: `
        <div data-testid="scroll_spacer_top" style="height: 200vh;">spacer above</div>

        <kbq-form-field>
            <textarea kbqTextarea data-testid="scroll_textarea" [(ngModel)]="value"></textarea>
        </kbq-form-field>

        <div data-testid="scroll_spacer_bottom" style="height: 200vh;">spacer below</div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTextareaScrollOnFocus'
    }
})
export class E2eTextareaScrollOnFocus {
    protected readonly value = model<string>(longTextareaContent);
}
