import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from './select.module';

@Component({
    selector: 'e2e-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect" [value]="'selected'">
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option class="kbq-active" [value]="'active'">active</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-focused" [value]="'focused'">focused</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 350px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eSelectStates {}

@Component({
    selector: 'e2e-multi-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select data-testid="e2eMultiSelect" [multiple]="true" [value]="['selected', 'default', 'default1']">
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option class="kbq-active" [value]="'active'">active</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-focused" [value]="'focused'">focused</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 350px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eMultiselectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMultiSelectStates {}

@Component({
    selector: 'e2e-multiline-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select
                data-testid="e2eMultilineSelect"
                [multiple]="true"
                [multiline]="true"
                [value]="['selected', 'default', 'default1']"
            >
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option class="kbq-active" [value]="'active'">active</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-focused" [value]="'focused'">focused</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 360px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eMultilineSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMultilineSelectStates {}

@Component({
    selector: 'e2e-select-with-search-and-footer',
    imports: [
        KbqSelectModule,
        KbqInputModule,
        FormsModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select data-testid="e2eSelect" [value]="'selected'">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option class="kbq-active" [value]="'active'">active</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-focused" [value]="'focused'">focused</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>

                <kbq-select-footer>Caption ⌥+⌘+F</kbq-select-footer>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 390px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eSelectWithSearchAndFooter'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eSelectWithSearchAndFooter {}
