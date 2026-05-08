import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    selector: 'e2e-form-field-group',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqIconModule],
    template: `
        <div data-testid="e2eHorizontalTarget" style="max-width: 300px">
            <div class="kbq-group">
                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <button kbq-button class="kbq-group-item" aria-label="Dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </div>
        </div>

        <div data-testid="e2eVerticalTarget" style="max-width: 100px">
            <div class="kbq-vertical-group">
                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <button kbq-button class="kbq-group-item">
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    Save
                </button>
            </div>
        </div>
    `,
    styleUrls: ['../core/styles/common/_groups.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFormFieldGroup'
    }
})
export class E2eFormFieldGroup {}

@Component({
    selector: 'e2e-form-fieldset',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqIconModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-fieldset>
                <legend kbqLegend>
                    A long field name that wraps to a new line and is positioned even above the button.
                </legend>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput />
                </kbq-form-field>

                <button kbq-button kbqFieldsetItem kbqStyle="outline">
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    Save
                </button>

                <kbq-hint>
                    A long hint text under the field that wraps to a new line and even extends beneath the button.
                </kbq-hint>
            </kbq-fieldset>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-m);
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFormFieldset'
    }
})
export class E2eFormFieldset {}
