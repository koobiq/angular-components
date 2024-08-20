import { Directionality } from '@angular/cdk/bidi';
import { PlatformModule } from '@angular/cdk/platform';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KbqTagsModule } from './index';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagsDefaultOptions } from './tag-default-options';
import { KbqTagInput, KbqTagInputEvent } from './tag-input';
import { KbqTagList } from './tag-list.component';

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

@Component({
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList />
            <input
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

    addOnBlur: boolean = false;
    addOnPaste: boolean = false;
    placeholder = '';

    add(_: KbqTagInputEvent) {}
}
