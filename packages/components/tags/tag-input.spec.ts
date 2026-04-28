import { Directionality } from '@angular/cdk/bidi';
import { DASH } from '@angular/cdk/keycodes';
import { PlatformModule } from '@angular/cdk/platform';
import { Component, DebugElement, Provider, signal, Type, viewChild, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER, SEMICOLON, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KbqTagsModule } from './index';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagsDefaultOptions } from './tag-default-options';
import { KbqTagInput, KbqTagInputEvent } from './tag-input';
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
                <input [kbqTagInputFor]="tagList" [distinct]="distinct()" (kbqTagInputTokenEnd)="add($event)" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class TestTagInputDistinct {
    readonly tagList = viewChild.required(KbqTagList);
    readonly tagInput = viewChild.required(KbqTagInput);
    readonly distinct = signal(false);
    readonly tags: string[] = ['existing-tag'];
    readonly add = jest.fn();
}

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-tag-list #tagList>
            <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
        </kbq-tag-list>
    `
})
class TestTagInputDefaultSeparators {
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
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            useValue: {
                separatorKeyCodes: [DASH],
                separators: { [DASH]: { symbol: /-/, key: '-' } },
                addOnPaste: true
            } as KbqTagsDefaultOptions
        }
    ]
})
class TestTagInputWithDashSeparator {
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
        directive.separatorKeyCodes = [COMMA];
        fixture.detectChanges();

        directive.onPaste(createPasteEvent('existing-tag,new-tag'));

        expect(componentInstance.add).toHaveBeenCalledTimes(1);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'new-tag' }));
    });

    it('should not filter duplicate values on paste when distinct=false', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        directive.separatorKeyCodes = [COMMA];
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
            tagInputDirective.separatorKeyCodes = [COMMA, SEMICOLON, SPACE, ENTER];
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

            tagInputDirective.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(addSpyFn).not.toHaveBeenCalled();
        });

        it('emits (tagEnd) when a custom separator key was pressed', () => {
            const COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement, ',');
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [COMMA];
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

            tagInputDirective.separatorKeyCodes = separators.map((separator) => separator.keyCode);

            fixture.detectChanges();

            SEPARATOR_EVENTS.forEach((event) => tagInputDirective.onKeydown(event));
            expect(addSpyFn).toHaveBeenCalledTimes(SEPARATOR_EVENTS.length);
        });

        // todo fix me after update angular
        xit('emits (tagEnd) when the separator keys are configured globally', () => {
            fixture.destroy();

            TestBed.resetTestingModule()
                .configureTestingModule({
                    imports: [KbqTagsModule, KbqFormFieldModule, PlatformModule, NoopAnimationsModule],
                    providers: [
                        {
                            provide: KBQ_TAGS_DEFAULT_OPTIONS,
                            useValue: {
                                separatorKeyCodes: [COMMA],
                                separators: { [COMMA]: { symbol: /,/, key: ',' } }
                            } as KbqTagsDefaultOptions
                        }
                    ]
                })
                .compileComponents();

            fixture = TestBed.createComponent(TestTagInput);
            testTagInput = fixture.debugElement.componentInstance;
            fixture.detectChanges();

            inputDebugElement = fixture.debugElement.query(By.directive(KbqTagInput));
            tagInputDirective = inputDebugElement.injector.get<KbqTagInput>(KbqTagInput);
            inputNativeElement = inputDebugElement.nativeElement;

            const addSpyFn = jest.spyOn(testTagInput, 'add');

            fixture.detectChanges();

            tagInputDirective.onKeydown(createKeyboardEvent('keydown', COMMA, inputNativeElement, ','));

            expect(addSpyFn).toHaveBeenCalled();
        });

        it.each(['shiftKey', 'ctrlKey', 'altKey', 'metaKey'])(
            'should not emit tagEnd when %s is pressed with separator',
            (modifierKey) => {
                const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');

                Object.defineProperty(ENTER_EVENT, modifierKey, { get: () => true });
                const addSpyFn = jest.spyOn(testTagInput, 'add');

                tagInputDirective.separatorKeyCodes = [ENTER];
                (inputNativeElement as HTMLInputElement).value = 'tag-value';
                fixture.detectChanges();

                tagInputDirective.onKeydown(ENTER_EVENT);
                expect(addSpyFn).not.toHaveBeenCalled();
            }
        );

        it('should prevent default when a separator key is pressed with empty input', () => {
            const SPACE_EVENT = createKeyboardEvent('keydown', SPACE, inputNativeElement, ' ');
            const preventDefaultSpy = jest.spyOn(SPACE_EVENT, 'preventDefault');

            tagInputDirective.separatorKeyCodes = [SPACE];
            (inputNativeElement as HTMLInputElement).value = '';
            fixture.detectChanges();

            tagInputDirective.onKeydown(SPACE_EVENT);
            expect(preventDefaultSpy).toHaveBeenCalled();
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
                [placeholder]="placeholder"
                (kbqTagInputTokenEnd)="add($event)"
            />
        </kbq-form-field>
    `
})
class TestTagInput {
    @ViewChild(KbqTagList, { static: false }) tagListInstance: KbqTagList;

    inputValue = 'inputValue';
    addOnBlur: boolean = false;
    addOnPaste: boolean = false;
    placeholder = '';

    add(_: KbqTagInputEvent) {}
}
