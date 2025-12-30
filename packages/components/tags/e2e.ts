import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagsModule } from '@koobiq/components/tags';

@Component({
    selector: 'e2e-tag-state-and-style',
    imports: [KbqTagsModule, KbqIconModule],
    template: `
        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (color of colors; track color) {
                    <tr>
                        @for (state of states; track state) {
                            <td>
                                @for (type of types; track type) {
                                    <kbq-tag
                                        [selected]="type === 'selected'"
                                        [color]="color"
                                        [class.kbq-hovered]="state === 'hovered'"
                                        [class.cdk-keyboard-focused]="state === 'focused'"
                                        [disabled]="state === 'disabled'"
                                    >
                                        <i kbq-icon="kbq-circle-check_16"></i>
                                        Tag
                                        <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                                    </kbq-tag>
                                }
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        td {
            padding: var(--kbq-size-xs);
            width: 1px;
        }

        .kbq-tag:first-of-type {
            margin-bottom: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTagStateAndStyle'
    }
})
export class E2eTagStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
    readonly colors = [
        KbqComponentColors.Theme,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Warning
    ];
    readonly types = ['default', 'selected'] as const;
}

@Component({
    selector: 'e2e-tag-editable',
    imports: [KbqTagsModule, KbqIconModule, FormsModule],
    template: `
        <kbq-tag editable>
            <i kbq-icon="kbq-circle-check_16"></i>
            {{ tag() }}
            <input kbqInput kbqTagEditInput [(ngModel)]="tag" />
            @if (tag().length > 0) {
                <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            } @else {
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            }
            <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
        </kbq-tag>
        <kbq-tag editable>
            <i kbq-icon="kbq-circle-check_16"></i>
            {{ tag() }}
            <input kbqInput kbqTagEditInput [(ngModel)]="tag" />
            @if (tag().length > 0) {
                <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            } @else {
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            }
            <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
        </kbq-tag>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTagEditable'
    }
})
export class E2eTagEditable {
    readonly tag = model('Editable tag');
    readonly color = KbqComponentColors;
}

@Component({
    selector: 'e2e-tag-list-states',
    imports: [KbqTagsModule, KbqIconModule],
    template: `
        <kbq-tag-list removable>
            <kbq-tag removable>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected class="cdk-keyboard-focused">
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag disabled>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
        </kbq-tag-list>

        <kbq-tag-list removable="false">
            <kbq-tag removable>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected removable>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected removable class="cdk-keyboard-focused">
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag disabled removable>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
        </kbq-tag-list>

        <kbq-tag-list disabled>
            <kbq-tag>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag selected>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
            <kbq-tag disabled>
                Tag
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
        </kbq-tag-list>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
        }
    `,
    host: {
        'data-testid': 'e2eTagListStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eTagListStates {}

@Component({
    selector: 'e2e-tag-input-states',
    imports: [KbqTagsModule, KbqIconModule, KbqFormFieldModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of [0, 1]; track tag) {
                    <kbq-tag>
                        Tag
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    data-testid="e2eTagInput"
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>

            <kbq-label>Label</kbq-label>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tag-list #tagList2="kbqTagList">
                @for (tag of [0, 1, 2, 3, 4]; track tag) {
                    <kbq-tag [class.cdk-keyboard-focused]="$first">
                        Tag
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input autocomplete="off" kbqInput placeholder="New tag" [kbqTagInputFor]="tagList2" />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tag-list #tagList3="kbqTagList" disabled>
                <kbq-tag>
                    Tag
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
                <kbq-tag selected>
                    Tag
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>

                <input autocomplete="off" kbqInput placeholder="New tag" [kbqTagInputFor]="tagList3" />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tag-list #tagList4="kbqTagList">
                <kbq-tag selected>
                    Tag
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
                <kbq-tag selected class="cdk-keyboard-focused">
                    Tag
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>

                <input autocomplete="off" kbqInput placeholder="New tag" [kbqTagInputFor]="tagList4" />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            width: 250px;
            padding: var(--kbq-size-xs);
        }
    `,
    host: {
        'data-testid': 'e2eTagInputStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eTagInputStates {}

@Component({
    selector: 'e2e-tag-autocomplete-states',
    imports: [FormsModule, KbqFormFieldModule, KbqTagsModule, KbqAutocompleteModule, KbqIconModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of [0, 1, 2]; track tag) {
                    <kbq-tag>
                        Tag
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    #input
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    [kbqAutocomplete]="autocomplete"
                />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>

            <kbq-label>Label</kbq-label>
            <kbq-hint>Hint</kbq-hint>

            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of [0, 1, 2, 3]; track option) {
                    <kbq-option>Option</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tag-list #tagList2="kbqTagList">
                @for (tag of [0, 1, 2, 3, 4]; track tag) {
                    <kbq-tag>
                        Tag
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    data-testid="e2eTagAutocompleteInput"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList2"
                    [kbqAutocomplete]="autocomplete2"
                />

                <kbq-cleaner #kbqTagListCleaner />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete2="kbqAutocomplete">
                @for (option of [0, 1, 2, 3]; track option) {
                    <kbq-option>Option</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            width: 300px;
            padding: var(--kbq-size-xs);
            height: 300px;
        }
    `,
    host: {
        'data-testid': 'e2eTagAutocompleteStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eTagAutocompleteStates {}
