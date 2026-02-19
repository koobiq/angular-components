import { Directionality } from '@angular/cdk/bidi';
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

@Component({
    imports: [KbqTagsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags; track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
            </kbq-tag-list>
            <input [kbqTagInputFor]="tagList" [distinct]="distinct()" (kbqTagInputTokenEnd)="add($event)" />
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
                NoopAnimationsModule
            ],
            declarations: [TestTagInput],
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

        it('emits (tagEnd) when the separator keys are configured globally', () => {
            fixture.destroy();

            TestBed.resetTestingModule()
                .configureTestingModule({
                    imports: [KbqTagsModule, KbqFormFieldModule, PlatformModule, NoopAnimationsModule],
                    declarations: [TestTagInput],
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

        it('should not emit the tagEnd event if a separator is pressed with a modifier key', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');

            Object.defineProperty(ENTER_EVENT, 'shiftKey', { get: () => true });
            const addSpyFn = jest.spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [ENTER];
            fixture.detectChanges();

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(addSpyFn).not.toHaveBeenCalled();
        });
    });
});

describe('[distinct]', () => {
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

        directive.onPaste({
            clipboardData: { getData: (_: string) => 'existing-tag,new-tag' },
            preventDefault: () => {},
            stopPropagation: () => {}
        } as unknown as ClipboardEvent);

        expect(componentInstance.add).toHaveBeenCalledTimes(1);
        expect(componentInstance.add).toHaveBeenCalledWith(expect.objectContaining({ value: 'new-tag' }));
    });

    it('should not filter duplicate values on paste when distinct=false', () => {
        const fixture = createComponent(TestTagInputDistinct);
        const { componentInstance } = fixture;
        const directive = componentInstance.tagInput();

        directive.separatorKeyCodes = [COMMA];
        fixture.detectChanges();

        directive.onPaste({
            clipboardData: { getData: (_: string) => 'existing-tag,new-tag' },
            preventDefault: () => {},
            stopPropagation: () => {}
        } as unknown as ClipboardEvent);

        expect(componentInstance.add).toHaveBeenCalledTimes(2);
    });
});

@Component({
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
