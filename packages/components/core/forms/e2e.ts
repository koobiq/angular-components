import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqFormsModule } from './forms-module';

@Component({
    selector: 'e2e-form-horizontal',
    imports: [
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqSelectModule,
        KbqTextareaModule,
        KbqTagsModule,
        KbqToggleModule,
        KbqRadioModule,
        KbqCheckboxModule,
        KbqButtonModule,
        KbqIconModule,
        KbqFileUploadModule
    ],
    template: `
        <form class="kbq-form-horizontal">
            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Input</label>
                <kbq-form-field class="kbq-form__control flex-80">
                    <input kbqInput value="Text" placeholder="Placeholder" />
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Tag input</label>
                <kbq-form-field class="kbq-form__control flex-80">
                    <kbq-tag-list #tagList="kbqTagList">
                        <kbq-tag value="1">Tag 1</kbq-tag>
                        <input autocomplete="off" kbqInput placeholder="New tag" [kbqTagInputFor]="tagList" />
                    </kbq-tag-list>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Textarea</label>
                <kbq-form-field class="kbq-form__control flex-80">
                    <textarea kbqTextarea placeholder="Placeholder" value="Text"></textarea>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Select</label>
                <kbq-form-field class="kbq-form__control flex-80">
                    <kbq-select placeholder="Placeholder" value="2">
                        <kbq-option value="1">Option 1</kbq-option>
                        <kbq-option value="2">Option 2</kbq-option>
                    </kbq-select>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Toggle</label>
                <div class="kbq-form__control flex-80">
                    <kbq-toggle>Value</kbq-toggle>
                </div>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Radio</label>
                <kbq-radio-group class="kbq-form__control flex-80" value="2">
                    <kbq-radio-button value="1">Button 1</kbq-radio-button>
                    <kbq-radio-button value="2">Button 2</kbq-radio-button>
                </kbq-radio-group>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Checkbox</label>
                <div class="kbq-form__control flex-80">
                    <kbq-checkbox>Value</kbq-checkbox>
                </div>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">Button</label>
                <div class="kbq-form__control flex-80">
                    <button kbq-button>
                        <i kbq-icon="kbq-plus_16"></i>
                        Add
                    </button>
                </div>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">File upload</label>
                <div class="kbq-form__control flex-80">
                    <kbq-single-file-upload>
                        <i kbq-icon="kbq-file-o_16"></i>
                    </kbq-single-file-upload>
                </div>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label flex-20">File upload</label>
                <div class="kbq-form__control flex-80">
                    <kbq-multiple-file-upload>
                        <ng-template #kbqFileIcon>
                            <i kbq-icon="kbq-file-text-o_16"></i>
                        </ng-template>
                    </kbq-multiple-file-upload>
                </div>
            </div>
        </form>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            padding: var(--kbq-size-s);
            width: 430px;
        }

        label {
            flex-shrink: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFormHorizontal'
    }
})
export class E2eFormHorizontal {}
