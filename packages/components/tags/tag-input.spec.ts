import { Directionality } from '@angular/cdk/bidi';
import { DASH } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { Component, DebugElement, Provider, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KbqAutocompleteModule,
    KbqAutocompleteSelectedEvent,
    KbqAutocompleteTrigger
} from '@koobiq/components/autocomplete';
import { COMMA, createKeyboardEvent, dispatchFakeEvent, ENTER, SEMICOLON, SPACE, TAB } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KbqTagsModule } from './index';
import { KbqTagInput, KbqTagInputEvent, kbqTagsDefaultOptionsProvider } from './tag-input';
import { KbqTagList } from './tag-list.component';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getInputElement = (fixture: ComponentFixture<any>): HTMLInputElement => {
    return fixture.debugElement.query(By.directive(KbqTagInput)).nativeElement;
};

const createPasteEvent = (data: string): ClipboardEvent => {
    return {
        clipboardData: {
            getData: (_: string) => data
        },
        preventDefault: () => {},
        stopPropagation: () => {}
    } as unknown as ClipboardEvent;
};

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags; track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
                <input
                    [kbqTagInputFor]="tagList"
                    [distinct]="distinct()"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeyCodes"
                    (kbqTagInputTokenEnd)="add($event)"
                />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class TestTagInputDistinct {
    readonly tagList = viewChild.required(KbqTagList);
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly distinct = signal(false);
    separatorKeyCodes: number[] = [ENTER];
    readonly tags: string[] = ['existing-tag'];
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" [kbqTagInputAddOnBlur]="addOnBlur" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `
})
class TestTagInputDefaultSeparators {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly add = jest.fn();

    addOnBlur = false;
}

@Component({
    // Deliberately importing the standalone directive/component directly, without KbqTagsModule
    // (the only place that provides KBQ_TAGS_DEFAULT_OPTIONS), to verify the token's own
    // `providedIn: 'root'` factory default keeps KbqTagInput usable on its own.
    imports: [KbqTagInput, KbqTagList],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `
})
class TestTagInputStandaloneWithoutModule {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `,
    providers: [
        kbqTagsDefaultOptionsProvider({
            separatorKeyCodes: [DASH],
            separators: [{ symbol: /-/, key: '-', keyCode: DASH }],
            addOnPaste: true
        })
    ]
})
class TestTagInputWithDashSeparator {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `,
    providers: [
        kbqTagsDefaultOptionsProvider({
            separatorKeyCodes: [ENTER, SPACE],
            separators: [
                { symbol: /\r?\n/, key: 'Enter', keyCode: ENTER },
                { symbol: / /, key: ' ', keyCode: SPACE, appliesTo: ['paste'] }
            ],
            addOnPaste: true
        })
    ]
})
class TestTagInputWithPasteOnlySpace {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `,
    providers: [
        kbqTagsDefaultOptionsProvider({
            separatorKeyCodes: [ENTER],
            separators: [
                { symbol: /\r?\n/, key: 'Enter', keyCode: ENTER },
                { symbol: /\s+/, appliesTo: ['paste'] }
            ],
            addOnPaste: true
        })
    ]
})
class TestTagInputWithKeylessWhitespaceSeparator {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                <input
                    [kbqTagInputFor]="tagList"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeyCodes()"
                    [kbqTagInputAddOnPaste]="addOnPaste()"
                    (kbqTagInputTokenEnd)="add($event)"
                />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class TestTagInputSeparators {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly separatorKeyCodes = signal<number[]>([ENTER]);
    readonly addOnPaste = signal(true);
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags; track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
                <input
                    [kbqTagInputFor]="tagList"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputAddOnBlur]="true"
                    (kbqTagInputTokenEnd)="add($event)"
                />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="select($event)">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
class TestTagInputWithAutocomplete {
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly options = ['HIPS alert', 'Phishing'];
    readonly tags: string[] = [];

    add({ input, value }: KbqTagInputEvent) {
        if (value) {
            this.tags.push(value);
            input.value = '';
        }
    }

    select({ option }: KbqAutocompleteSelectedEvent) {
        this.tags.push(option.value);
        option.deselect();
    }
}

describe(KbqTagInput.name, () => {
    it('should not emit (tagEnd) when distinct=true and a duplicate value is entered', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.distinct.set(true);
        fixture.detectChanges();

        getInputElement(fixture).value = 'existing-tag';
        directive.emitTagEnd();

        expect(componentInstance.add).not.toHaveBeenCalled();
    });

    it('should emit (tagEnd) when distinct=true and a unique value is entered', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.distinct.set(true);
        fixture.detectChanges();

        getInputElement(fixture).value = 'new-tag';
        directive.emitTagEnd();

        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'new-tag' }));
    });

    it('should emit (tagEnd) when distinct=false and a duplicate value is entered', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        getInputElement(fixture).value = 'existing-tag';
        directive.emitTagEnd();

        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'existing-tag' }));
    });

    it('should filter duplicate values on paste when distinct=true', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.distinct.set(true);
        componentInstance.separatorKeyCodes = [COMMA];
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('existing-tag,new-tag'));

        expect(componentInstance.add).toHaveBeenCalledTimes(1);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'new-tag' }));
    });

    it('should not filter duplicate values on paste when distinct=false', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes = [COMMA];
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('existing-tag,new-tag'));

        expect(componentInstance.add).toHaveBeenCalledTimes(2);
    });

    it('should trigger tagEnd on ENTER by default', () => {
        const fixture = createComponent(TestTagInputDefaultSeparators);
        const directive = fixture.componentInstance.tagInput();
        const inputElement = getInputElement(fixture);

        inputElement.value = 'tag';
        directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag' }));
    });

    it('works standalone without KbqTagsModule providing KBQ_TAGS_DEFAULT_OPTIONS', () => {
        const fixture = createComponent(TestTagInputStandaloneWithoutModule);
        const inputElement = getInputElement(fixture);

        inputElement.value = 'tag';
        fixture.componentInstance.tagInput().onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag' }));
    });

    it('should kbqTagInputAddOnPaste by default', () => {
        const fixture = createComponent(TestTagInputWithDashSeparator);
        const directive = fixture.componentInstance.tagInput();

        directive.onPaste(createPasteEvent('a-b'));

        expect(fixture.componentInstance.add).toHaveBeenCalledTimes(2);
        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }));
    });

    it('should NOT trigger tagEnd when separatorKeyCodes is empty', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();
        const inputElement = getInputElement(fixture);

        componentInstance.separatorKeyCodes.set([]);
        fixture.detectChanges();

        inputElement.value = 'tag';
        directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

        expect(componentInstance.add).not.toHaveBeenCalled();
    });

    it('should trigger tagEnd on COMMA', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();
        const inputElement = getInputElement(fixture);

        componentInstance.separatorKeyCodes.set([COMMA]);
        fixture.detectChanges();

        inputElement.value = 'tag';
        directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));
        expect(componentInstance.add).not.toHaveBeenCalled();

        directive.onKeydown(createKeyboardEvent('keydown', COMMA, inputElement, ','));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag' }));
    });

    it('should trigger tagEnd on both ENTER and COMMA', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();
        const inputElement = getInputElement(fixture);

        componentInstance.separatorKeyCodes.set([ENTER, COMMA]);
        fixture.detectChanges();

        inputElement.value = 'tag1';
        directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag1' }));

        inputElement.value = 'tag2';
        directive.onKeydown(createKeyboardEvent('keydown', COMMA, inputElement, ','));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag2' }));
    });

    it('should NOT emit tagEnd when kbqTagInputAddOnPaste is false', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([COMMA]);
        componentInstance.addOnPaste.set(false);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a,b,c'));

        expect(componentInstance.add).toHaveBeenCalledTimes(0);
    });

    it('should split pasted text by COMMA', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([COMMA]);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a,b,c,,'));

        expect(componentInstance.add).toHaveBeenCalledTimes(5);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: '' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: '' }));
    });

    it('should split pasted text by COMMA and emit 3 tags preserving spaces', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([COMMA]);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a,  b, c'));

        expect(componentInstance.add).toHaveBeenCalledTimes(3);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: '  b' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: ' c' }));
    });

    it('should split pasted text by separators', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([COMMA, SEMICOLON, SPACE, ENTER, TAB]);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a,b;c d\te\nf\ng'));

        expect(componentInstance.add).toHaveBeenCalledTimes(7);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'd' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'e' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'f' }));
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'g' }));
    });

    it('should split pasted text by custom DASH separator', () => {
        const fixture = createComponent(TestTagInputWithDashSeparator);
        const directive = fixture.componentInstance.tagInput();

        directive.onPaste(createPasteEvent('a-b-'));

        expect(fixture.componentInstance.add).toHaveBeenCalledTimes(3);
        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }));
        expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: '' }));
    });

    describe('separator `appliesTo` scoping', () => {
        it('should NOT split on keydown when a separator is scoped to `paste` only', () => {
            const fixture = createComponent(TestTagInputWithPasteOnlySpace);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'New York';
            directive.onKeydown(createKeyboardEvent('keydown', SPACE, inputElement, ' '));

            expect(fixture.componentInstance.add).not.toHaveBeenCalled();
        });

        it('should still split on paste when a separator is scoped to `paste` only', () => {
            const fixture = createComponent(TestTagInputWithPasteOnlySpace);
            const directive = fixture.componentInstance.tagInput();

            directive.onPaste(createPasteEvent('New York Boston'));

            expect(fixture.componentInstance.add).toHaveBeenCalledTimes(3);
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'New' }));
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'York' }));
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'Boston' }));
        });

        it('should still trigger tagEnd on Enter keydown, which is not restricted to `paste`', () => {
            const fixture = createComponent(TestTagInputWithPasteOnlySpace);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'tag';
            directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'tag' }));
        });

        it('should split pasted text using a keyless regex separator regardless of separatorKeyCodes', () => {
            const fixture = createComponent(TestTagInputWithKeylessWhitespaceSeparator);
            const directive = fixture.componentInstance.tagInput();

            directive.onPaste(createPasteEvent('a b\tc'));

            expect(fixture.componentInstance.add).toHaveBeenCalledTimes(3);
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'b' }));
            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
        });

        it('should not let a keyless separator affect keydown, since it can never match a KeyboardEvent.key', () => {
            const fixture = createComponent(TestTagInputWithKeylessWhitespaceSeparator);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'tag';
            directive.onKeydown(createKeyboardEvent('keydown', SPACE, inputElement, ' '));

            expect(fixture.componentInstance.add).not.toHaveBeenCalled();
        });
    });

    it('should emit the whole pasted string as a single tag when no separator is found', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([COMMA]);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a; b; c'));

        expect(componentInstance.add).toHaveBeenCalledTimes(1);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a; b; c' }));
    });

    it('should emit the whole pasted string as a single tag when separatorKeyCodes is empty', () => {
        const fixture = createComponent(TestTagInputSeparators);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        componentInstance.separatorKeyCodes.set([]);
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('a,b,c'));

        expect(componentInstance.add).toHaveBeenCalledTimes(1);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'a,b,c' }));
    });

    describe('autocomplete interaction', () => {
        it('should NOT emit tagEnd on ENTER when autocomplete panel is open with an active option', () => {
            const fixture = createComponent(TestTagInputDefaultSeparators);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'some text';
            directive.autocompleteTrigger = { panelOpen: true, activeOption: {} } as KbqAutocompleteTrigger;

            directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

            expect(fixture.componentInstance.add).not.toHaveBeenCalled();
        });

        it('should emit tagEnd on ENTER when autocomplete panel is open but no active option', () => {
            const fixture = createComponent(TestTagInputDefaultSeparators);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'some text';
            directive.autocompleteTrigger = { panelOpen: true, activeOption: null } as KbqAutocompleteTrigger;

            directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'some text' }));
        });

        it('should emit tagEnd on ENTER when autocomplete panel is closed', () => {
            const fixture = createComponent(TestTagInputDefaultSeparators);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'some text';
            directive.autocompleteTrigger = { panelOpen: false, activeOption: {} } as KbqAutocompleteTrigger;

            directive.onKeydown(createKeyboardEvent('keydown', ENTER, inputElement, 'Enter'));

            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'some text' }));
        });

        it('should emit tagEnd on COMMA when autocomplete panel is open with an active option', () => {
            const fixture = createComponent(TestTagInputSeparators);
            const { componentInstance } = fixture;
            const directive = componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            componentInstance.separatorKeyCodes.set([COMMA]);
            fixture.detectChanges();

            inputElement.value = 'some text';
            directive.autocompleteTrigger = { panelOpen: true, activeOption: {} } as KbqAutocompleteTrigger;

            directive.onKeydown(createKeyboardEvent('keydown', COMMA, inputElement, ','));

            expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'some text' }));
        });

        it('should NOT emit tagEnd on blur when the autocomplete reports focus moved to an option', () => {
            const fixture = createComponent(TestTagInputDefaultSeparators);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'some text';
            directive.autocompleteTrigger = {
                onInputBlur: () => () => false
            } as unknown as KbqAutocompleteTrigger;

            fixture.componentInstance.addOnBlur = true;
            fixture.detectChanges();
            directive.blur({} as FocusEvent);

            expect(fixture.componentInstance.add).not.toHaveBeenCalled();
        });

        it('should emit tagEnd on blur when the autocomplete reports focus did NOT move to an option', () => {
            const fixture = createComponent(TestTagInputDefaultSeparators);
            const directive = fixture.componentInstance.tagInput();
            const inputElement = getInputElement(fixture);

            inputElement.value = 'some text';
            directive.autocompleteTrigger = {
                onInputBlur: () => () => true
            } as unknown as KbqAutocompleteTrigger;

            fixture.componentInstance.addOnBlur = true;
            fixture.detectChanges();
            directive.blur({} as FocusEvent);

            expect(fixture.componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'some text' }));
        });

        // Regression test for DS-5279-like bug: selecting an option from the autocomplete panel
        // while [kbqTagInputAddOnBlur]="true" was adding both the raw typed text AND the selected
        // option as separate tags, because the mousedown on the (focusable) kbq-option blurs the
        // input first, and that blur unconditionally called emitTagEnd() regardless of what
        // onInputBlur() reported.
        describe('[kbqTagInputAddOnBlur] with a real autocomplete panel', () => {
            let fixture: ComponentFixture<TestTagInputWithAutocomplete>;
            let componentInstance: TestTagInputWithAutocomplete;
            let inputElement: HTMLInputElement;
            let overlayContainer: OverlayContainer;
            let overlayContainerElement: HTMLElement;

            beforeEach(() => {
                fixture = createComponent(TestTagInputWithAutocomplete);
                componentInstance = fixture.componentInstance;
                inputElement = getInputElement(fixture);

                inject([OverlayContainer], (oc: OverlayContainer) => {
                    overlayContainer = oc;
                    overlayContainerElement = oc.getContainerElement();
                })();
            });

            afterEach(() => {
                overlayContainer.ngOnDestroy();
            });

            it('adds only the selected option, not the typed text, when an option is picked from the panel', fakeAsync(() => {
                dispatchFakeEvent(inputElement, 'focusin');
                fixture.detectChanges();
                tick();

                inputElement.value = 'hi';
                dispatchFakeEvent(inputElement, 'input');
                fixture.detectChanges();
                tick();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

                // Real browsers blur the input on mousedown (kbq-option is focusable),
                // before the option's own click handler runs.
                inputElement.dispatchEvent(new FocusEvent('blur', { relatedTarget: option }));
                option.click();
                fixture.detectChanges();
                tick();

                expect(componentInstance.tags).toEqual(['HIPS alert']);
            }));

            it('still converts typed text into a tag on blur when focus does not move to an option', fakeAsync(() => {
                dispatchFakeEvent(inputElement, 'focusin');
                fixture.detectChanges();
                tick();

                inputElement.value = 'custom text';
                dispatchFakeEvent(inputElement, 'input');
                fixture.detectChanges();
                tick();

                inputElement.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }));
                fixture.detectChanges();
                tick();

                expect(componentInstance.tags).toEqual(['custom text']);
            }));
        });
    });
});

describe('KbqTagInput', () => {
    let fixture: ComponentFixture<any>;
    let testTagInput: TestTagInput;
    let inputDebugElement: DebugElement;
    let inputNativeElement: HTMLElement;
    let tagInputDirective: KbqTagInput;
    const dir = 'ltr';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                PlatformModule,
                KbqTagsModule,
                KbqFormFieldModule,
                NoopAnimationsModule,
                TestTagInput
            ],
            providers: [
                {
                    provide: Directionality,
                    useFactory: () => {
                        return {
                            value: dir.toLowerCase(),
                            change: new Subject()
                        };
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestTagInput);
        testTagInput = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        inputDebugElement = fixture.debugElement.query(By.directive(KbqTagInput));
        tagInputDirective = inputDebugElement.injector.get<KbqTagInput>(KbqTagInput);
        inputNativeElement = inputDebugElement.nativeElement;
    });

    describe('basic behavior', () => {
        it('emits the (tagEnd) on enter keyup', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');

            const addSpyFn = jest.spyOn(testTagInput, 'add');

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(addSpyFn).toHaveBeenCalled();
        });

        it('should have a default id', () => {
            expect(inputNativeElement.getAttribute('id')).toBeTruthy();
        });

        it('should allow binding to the `placeholder` input', () => {
            expect(inputNativeElement.hasAttribute('placeholder')).toBe(false);

            testTagInput.placeholder = 'bound placeholder';
            fixture.detectChanges();

            expect(inputNativeElement.getAttribute('placeholder')).toBe('bound placeholder');
        });
    });

    describe('[addOnBlur]', () => {
        it('allows (tagEnd) when true', () => {
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = true;
            fixture.detectChanges();

            tagInputDirective.blur({} as FocusEvent);
            expect(addSpyFn).toHaveBeenCalled();
        });

        it('disallows (tagEnd) when false', () => {
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = false;
            fixture.detectChanges();

            tagInputDirective.blur({} as FocusEvent);
            expect(addSpyFn).not.toHaveBeenCalled();
        });
    });

    describe('[addOnPaste]', () => {
        const clipboardEventData = {
            clipboardData: {
                getData: (_) => 'test test test'
            },
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        it('allows (tagEnd) when true', () => {
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.addOnPaste = true;
            fixture.detectChanges();

            tagInputDirective.onPaste(clipboardEventData as ClipboardEvent);
            expect(addSpyFn).toHaveBeenCalled();
        });

        it('disallows (tagEnd) when false', () => {
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.addOnPaste = false;
            fixture.detectChanges();

            tagInputDirective.onPaste(clipboardEventData as ClipboardEvent);
            expect(addSpyFn).not.toHaveBeenCalled();
        });

        it('divide string by kbqTagInputSeparatorKeyCodes and add 4 item', () => {
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.addOnPaste = true;
            testTagInput.separatorKeyCodes = [COMMA, SEMICOLON, SPACE, ENTER];
            fixture.detectChanges();

            const clipboardEventData = {
                clipboardData: {
                    getData: (_) => '36.185.103.120 16.229.226.236,160.249.196.235;144.132.144.37'
                },
                preventDefault: () => {},
                stopPropagation: () => {}
            };

            tagInputDirective.onPaste(clipboardEventData as ClipboardEvent);
            expect(addSpyFn).toHaveBeenCalledTimes(4);
            expect(addSpyFn).toHaveBeenCalledWith(expect.objectContaining({ value: '36.185.103.120' }));
            expect(addSpyFn).toHaveBeenCalledWith(expect.objectContaining({ value: '16.229.226.236' }));
            expect(addSpyFn).toHaveBeenCalledWith(expect.objectContaining({ value: '160.249.196.235' }));
            expect(addSpyFn).toHaveBeenCalledWith(expect.objectContaining({ value: '144.132.144.37' }));
        });
    });

    describe('[separatorKeyCodes]', () => {
        it('does not emit (tagEnd) when a non-separator key is pressed', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(addSpyFn).not.toHaveBeenCalled();
        });

        it('emits (tagEnd) when a custom separator key was pressed', () => {
            const COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement, ',');
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.onKeydown(COMMA_EVENT);
            expect(addSpyFn).toHaveBeenCalled();
        });

        it('emits accepts the custom separator keys in a Set', () => {
            const separators = [
                { keyCode: ENTER, key: 'Enter' },
                { keyCode: COMMA, key: ',' },
                { keyCode: TAB, key: 'Tab' },
                { keyCode: SPACE, key: ' ' }
            ];
            const SEPARATOR_EVENTS = separators.map(({ keyCode, key }) =>
                createKeyboardEvent('keydown', keyCode, inputNativeElement, key)
            );

            const addSpyFn = jest.spyOn(testTagInput, 'add');

            testTagInput.separatorKeyCodes = separators.map((separator) => separator.keyCode);

            fixture.detectChanges();

            SEPARATOR_EVENTS.forEach((event) => tagInputDirective.onKeydown(event));
            expect(addSpyFn).toHaveBeenCalledTimes(SEPARATOR_EVENTS.length);
        });

        it('emits (tagEnd) when the separator keys are configured globally', () => {
            // KbqTagsModule provides KBQ_TAGS_DEFAULT_OPTIONS = { separatorKeyCodes: [ENTER] }
            // and that provider is imported INTO the standalone TestTagInput's injector —
            // a test-module-level override would be shadowed. Instead configure the
            // directive instance directly: this still exercises the keydown → tagEnd
            // emission for a non-default separator (COMMA in this case).
            testTagInput.separatorKeyCodes = [COMMA];

            const addSpyFn = jest.spyOn(testTagInput, 'add');

            (inputNativeElement as HTMLInputElement).value = 'pending-tag';
            fixture.detectChanges();

            expect(tagInputDirective.separators().some((s) => s.key === ',')).toBe(true);

            tagInputDirective.onKeydown(createKeyboardEvent('keydown', COMMA, inputNativeElement, ','));

            expect(addSpyFn).toHaveBeenCalled();
        });

        it.each(['shiftKey', 'ctrlKey', 'altKey', 'metaKey'])(
            'should not emit tagEnd when %s is pressed with separator',
            (modifierKey) => {
                const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');

                Object.defineProperty(ENTER_EVENT, modifierKey, { get: () => true });
                const addSpyFn = jest.spyOn(testTagInput, 'add');

                testTagInput.separatorKeyCodes = [ENTER];
                (inputNativeElement as HTMLInputElement).value = 'tag-value';
                fixture.detectChanges();

                tagInputDirective.onKeydown(ENTER_EVENT);
                expect(addSpyFn).not.toHaveBeenCalled();
            }
        );

        it('should prevent default when a separator key is pressed with empty input', () => {
            const SPACE_EVENT = createKeyboardEvent('keydown', SPACE, inputNativeElement, ' ');
            const preventDefaultSpy = jest.spyOn(SPACE_EVENT, 'preventDefault');

            testTagInput.separatorKeyCodes = [SPACE];
            (inputNativeElement as HTMLInputElement).value = '';
            fixture.detectChanges();

            tagInputDirective.onKeydown(SPACE_EVENT);
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should not prevent default when TAB separator is pressed with empty input', () => {
            const TAB_EVENT = createKeyboardEvent('keydown', TAB, inputNativeElement, 'Tab');
            const preventDefaultSpy = jest.spyOn(TAB_EVENT, 'preventDefault');

            testTagInput.separatorKeyCodes = [TAB];
            (inputNativeElement as HTMLInputElement).value = '';
            fixture.detectChanges();

            tagInputDirective.onKeydown(TAB_EVENT);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });
    });
    describe('signal inputs', () => {
        beforeEach(() => TestBed.resetTestingModule());

        it('should treat a null separatorKeyCodes as no separators', () => {
            const fixture = createComponent(TestTagInput);

            fixture.detectChanges();

            const directive = fixture.debugElement.query(By.directive(KbqTagInput)).injector.get(KbqTagInput);

            fixture.componentInstance.separatorKeyCodes = null as unknown as number[];
            fixture.detectChanges();

            expect(directive.separatorKeyCodes()).toEqual([]);
            expect(directive.separators().every(({ keyCode }) => keyCode === undefined)).toBe(true);
        });

        it('should treat valueless addOnBlur and distinct attributes as true', () => {
            const fixture = createComponent(TestTagInputValuelessAttributes);

            fixture.detectChanges();

            const directive = fixture.debugElement.query(By.directive(KbqTagInput)).injector.get(KbqTagInput);

            expect(directive.addOnBlur()).toBe(true);
            expect(directive.distinct()).toBe(true);
        });

        it('should generate a unique id', () => {
            const fixture = createComponent(TestTagInput);

            fixture.detectChanges();

            const directive = fixture.debugElement.query(By.directive(KbqTagInput)).injector.get(KbqTagInput);

            expect(directive.id).toMatch(/^kbq-tag-list-input-\w+$/);
        });
    });
});

@Component({
    imports: [PlatformModule, KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList />
            <input
                [value]="inputValue"
                [kbqTagInputFor]="tagList"
                [kbqTagInputAddOnBlur]="addOnBlur"
                [kbqTagInputAddOnPaste]="addOnPaste"
                [kbqTagInputSeparatorKeyCodes]="separatorKeyCodes"
                [placeholder]="placeholder"
                (kbqTagInputTokenEnd)="add($event)"
            />
        </kbq-form-field>
    `
})
class TestTagInput {
    readonly tagListInstance = viewChild.required(KbqTagList);

    inputValue = 'inputValue';
    addOnBlur: boolean = false;
    separatorKeyCodes: number[] = [ENTER];
    addOnPaste: boolean = false;
    placeholder = '';

    add(_: KbqTagInputEvent) {}
}

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList />
            <input kbqTagInputAddOnBlur distinct [kbqTagInputFor]="tagList" />
        </kbq-form-field>
    `
})
class TestTagInputValuelessAttributes {}
