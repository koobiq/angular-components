import { Directionality } from '@angular/cdk/bidi';
import { PlatformModule } from '@angular/cdk/platform';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [PlatformModule, KbqTagsModule, KbqFormFieldModule, NoopAnimationsModule],
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
        });

        TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(TestTagInput);
        testTagInput = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        inputDebugElement = fixture.debugElement.query(By.directive(KbqTagInput));
        tagInputDirective = inputDebugElement.injector.get<KbqTagInput>(KbqTagInput);
        inputNativeElement = inputDebugElement.nativeElement;
    }));

    describe('basic behavior', () => {
        it('emits the (tagEnd) on enter keyup', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');

            spyOn(testTagInput, 'add');

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(testTagInput.add).toHaveBeenCalled();
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

        // it('should propagate the dynamic `placeholder` value to the form field', () => {
        //     fixture.componentInstance.placeholder = 'add a tag';
        //     fixture.detectChanges();
        //
        //     const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');
        //
        //     expect(label).toBeTruthy();
        //     expect(label.textContent).toContain('add a tag');
        //
        //     fixture.componentInstance.placeholder = 'or don\'t';
        //     fixture.detectChanges();
        //
        //     expect(label.textContent).toContain('or don\'t');
        // });

        // it('should become disabled if the tag list is disabled', () => {
        //     expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
        //     expect(tagInputDirective.disabled).toBe(false);
        //
        //     fixture.componentInstance.tagListInstance.disabled = true;
        //     fixture.detectChanges();
        //
        //     expect(inputNativeElement.getAttribute('disabled')).toBe('true');
        //     expect(tagInputDirective.disabled).toBe(true);
        // });
    });

    describe('[addOnBlur]', () => {
        it('allows (tagEnd) when true', () => {
            spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = true;
            fixture.detectChanges();

            tagInputDirective.blur({} as FocusEvent);
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('disallows (tagEnd) when false', () => {
            spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = false;
            fixture.detectChanges();

            tagInputDirective.blur({} as FocusEvent);
            expect(testTagInput.add).not.toHaveBeenCalled();
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
            spyOn(testTagInput, 'add');

            testTagInput.addOnPaste = true;
            fixture.detectChanges();

            tagInputDirective.onPaste(clipboardEventData as ClipboardEvent);
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('disallows (tagEnd) when false', () => {
            spyOn(testTagInput, 'add');

            testTagInput.addOnPaste = false;
            fixture.detectChanges();

            tagInputDirective.onPaste(clipboardEventData as ClipboardEvent);
            expect(testTagInput.add).not.toHaveBeenCalled();
        });
    });

    describe('[separatorKeyCodes]', () => {
        it('does not emit (tagEnd) when a non-separator key is pressed', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(testTagInput.add).not.toHaveBeenCalled();
        });

        it('emits (tagEnd) when a custom separator key was pressed', () => {
            const COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement, ',');
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.onKeydown(COMMA_EVENT);
            expect(testTagInput.add).toHaveBeenCalled();
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

            spyOn(testTagInput, 'add');
            tagInputDirective.separatorKeyCodes = separators.map((separator) => separator.keyCode);

            fixture.detectChanges();

            SEPARATOR_EVENTS.forEach((event) => tagInputDirective.onKeydown(event));
            expect(testTagInput.add).toHaveBeenCalledTimes(SEPARATOR_EVENTS.length);
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

            spyOn(testTagInput, 'add');
            fixture.detectChanges();

            tagInputDirective.onKeydown(createKeyboardEvent('keydown', COMMA, inputNativeElement, ','));
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('should not emit the tagEnd event if a separator is pressed with a modifier key', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement, 'Enter');
            Object.defineProperty(ENTER_EVENT, 'shiftKey', { get: () => true });
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [ENTER];
            fixture.detectChanges();

            tagInputDirective.onKeydown(ENTER_EVENT);
            expect(testTagInput.add).not.toHaveBeenCalled();
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
