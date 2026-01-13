import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { A } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    NgZone,
    Provider,
    QueryList,
    Type,
    ViewChild,
    ViewChildren,
    model,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
import { BACKSPACE, DELETE, END, ENTER, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, TAB } from '@koobiq/cdk/keycodes';
import {
    MockNgZone,
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    typeInElement
} from '@koobiq/cdk/testing';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KbqInputModule } from '../input/index';
import { KbqTagList, KbqTagsModule } from './index';
import { KbqTagInput, KbqTagInputEvent } from './tag-input';
import { KbqTag } from './tag.component';

const createStandaloneComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTagListElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTagList)).nativeElement;
};

const getTagElements = (debugElement: DebugElement): HTMLElement[] => {
    return Array.from(debugElement.queryAll(By.directive(KbqTag))).map((tag) => tag.nativeElement);
};

const getLastTagElement = (debugElement: DebugElement): HTMLElement => {
    return getTagElements(debugElement).at(-1)!;
};

const getFirstTagElement = (debugElement: DebugElement): HTMLElement => {
    return getTagElements(debugElement).at(0)!;
};

const getSelectedTags = (debugElement: DebugElement): HTMLElement[] => {
    return getTagElements(debugElement).filter((tag) => tag.classList.contains('kbq-selected'));
};

const getTagInputElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.directive(KbqTagInput)).nativeElement;
};

const getFocusMonitor = () => TestBed.inject(FocusMonitor);

@Component({
    selector: 'test-tag-list',
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list
            [draggable]="draggable()"
            [selectable]="selectable()"
            [removable]="removable()"
            [disabled]="disabled()"
        >
            @for (tag of tags(); track tag) {
                <kbq-tag
                    [selected]="tag.selected"
                    [attr.id]="tag.id"
                    [value]="tag"
                    (selectionChange)="selectionChange($event)"
                    (removed)="removedChange($event)"
                >
                    {{ tag.value }}
                </kbq-tag>
            }
        </kbq-tag-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestTagList {
    readonly tagList = viewChild.required(KbqTagList);
    readonly tags = model<Array<{ id: string; value: string; selected: boolean }>>(
        Array.from({ length: 3 }, (_, i) => ({
            id: `tag${i}`,
            value: `tag${i}`,
            selected: false
        }))
    );

    readonly selectable = model(true);
    readonly removable = model(true);
    readonly draggable = model(false);
    readonly disabled = model(false);

    readonly selectionChange = jest.fn();
    readonly removedChange = jest.fn();
}

@Component({
    selector: 'test-form-field-tag-list',
    imports: [KbqTagsModule, KbqFormFieldModule, CdkMonitorFocus],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of tags(); track tag) {
                    <kbq-tag [selected]="tag.selected" [attr.id]="tag.id" [value]="tag">
                        {{ tag.value }}
                    </kbq-tag>
                }

                <input cdkMonitorElementFocus [kbqTagInputFor]="tagList" />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
export class TestFormFieldTagList {
    readonly tagList = viewChild.required(KbqTagList);
    readonly tags = model<Array<{ id: string; value: string; selected: boolean }>>(
        Array.from({ length: 4 }, (_, i) => ({
            id: `tag${i}`,
            value: `tag${i}`,
            selected: false
        }))
    );
}

describe(KbqTagList.name, () => {
    let fixture: ComponentFixture<any>;
    let tagListDebugElement: DebugElement;
    let tagListNativeElement: HTMLElement;
    let tagListInstance: KbqTagList;
    let testComponent: StandardTagList;
    let tags: QueryList<KbqTag>;
    let manager: FocusKeyManager<KbqTag>;
    let zone: MockNgZone;
    let dirChange: Subject<Direction>;

    describe('StandardTagList', () => {
        describe('basic behaviors', () => {
            beforeEach(() => {
                setupStandardList();
            });

            it('should add the `kbq-tag-list` class', () => {
                expect(tagListNativeElement.classList).toContain('kbq-tag-list');
            });

            it('should toggle the tags disabled state based on whether it is disabled', () => {
                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);

                tagListInstance.disabled = false;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);
            });

            it('should disable a tag that is added after the list became disabled', fakeAsync(() => {
                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);

                fixture.componentInstance.tags.push(5, 6);
                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);
            }));
        });

        describe('with selected tags', () => {
            beforeEach(() => {
                fixture = createComponent(SelectedTagList);
                fixture.detectChanges();
                tagListDebugElement = fixture.debugElement.query(By.directive(KbqTagList));
                tagListNativeElement = tagListDebugElement.nativeElement;
            });

            it('should not override tags selected', () => {
                const instanceTags = fixture.componentInstance.tags.toArray();

                expect(instanceTags[0].selected).toBe(true);

                expect(instanceTags[1].selected).toBe(false);

                expect(instanceTags[2].selected).toBe(true);
            });

            it('should not have role when empty', () => {
                fixture.componentInstance.foods = [];
                fixture.detectChanges();

                expect(tagListNativeElement.getAttribute('role')).toBeNull();
            });
        });

        describe('focus behaviors', () => {
            beforeEach(() => {
                setupStandardList();
                manager = tagListInstance.keyManager;
            });

            it('should focus the first tag on focus', () => {
                tagListInstance.focus();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(0);
            });

            it('should watch for tag focus', fakeAsync(() => {
                const array = tags.toArray();
                const lastIndex = array.length - 1;
                const lastItem = array[lastIndex];

                lastItem.focus();
                tick();

                expect(manager.activeItemIndex).toBe(lastIndex);
            }));

            it('should be able to become focused when disabled', () => {
                expect(tagListInstance.focused).toBe(false);

                tagListInstance.disabled = true;
                fixture.detectChanges();

                tagListInstance.focus();
                fixture.detectChanges();

                expect(tagListInstance.focused).toBe(false);
            });

            it('should remove the tabindex from the list if it is disabled', () => {
                expect(tagListNativeElement.getAttribute('tabindex')).toBeTruthy();

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tagListNativeElement.hasAttribute('tabindex')).toBeFalsy();
            });

            it('should focus next tag if first tag is disabled', () => {
                const arr = tags.toArray();
                const firstElementIndex = 0;

                arr[firstElementIndex].disabled = true;

                tagListInstance.focus();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(firstElementIndex + 1);
            });

            describe('on tag destroy', () => {
                it('should focus the next item', fakeAsync(() => {
                    const array = tags.toArray();
                    const midItem = array[2];

                    // Focus the middle item
                    midItem.focus();
                    tick();

                    // Destroy the middle item
                    testComponent.tags.splice(2, 1);
                    fixture.detectChanges();

                    // It focuses the 4th item (now at index 2)
                    expect(manager.activeItemIndex).toEqual(2);
                }));

                it('should focus the previous item', fakeAsync(() => {
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item
                    lastItem.focus();
                    flush();

                    // Destroy the last item
                    testComponent.tags.pop();
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should not focus if tag list is not focused', () => {
                    const array = tags.toArray();
                    const midItem = array[2];

                    // Focus and blur the middle item
                    midItem.focus();
                    midItem.blur();
                    zone.simulateZoneExit();

                    // Destroy the middle item
                    testComponent.tags.splice(2, 1);
                    fixture.detectChanges();

                    // Should not have focus
                    expect(tagListInstance.keyManager.activeItemIndex).toEqual(-1);
                });

                it('should move focus to the last tag when the focused tag was deleted inside a component with animations', fakeAsync(() => {
                    fixture.destroy();
                    TestBed.resetTestingModule();
                    fixture = createComponent(StandardTagListWithAnimations, []);

                    fixture.detectChanges();

                    tagListDebugElement = fixture.debugElement.query(By.directive(KbqTagList));
                    tagListNativeElement = tagListDebugElement.nativeElement;
                    tagListInstance = tagListDebugElement.componentInstance;
                    testComponent = fixture.debugElement.componentInstance;
                    tags = tagListInstance.tags;

                    tags.last.focus();
                    tick();

                    expect(tagListInstance.keyManager.activeItemIndex).toBe(tags.length - 1);

                    dispatchKeyboardEvent(tags.last.elementRef.nativeElement, 'keydown', BACKSPACE);

                    expect(tagListInstance.keyManager.activeItemIndex).toBe(tags.length - 1);
                }));
            });
        });

        describe('keyboard behavior', () => {
            describe('LTR (default)', () => {
                beforeEach(() => {
                    setupStandardList();
                    manager = tagListInstance.keyManager;
                });

                it('should focus previous item when press LEFT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;

                    const LEFT_EVENT = createKeyboardEvent('keydown', LEFT_ARROW, lastNativeChip);
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item in the array
                    lastItem.focus();
                    tick();
                    expect(manager.activeItemIndex).toEqual(lastIndex);

                    // Press the LEFT arrow
                    tagListInstance.keydown(LEFT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should focus next item when press RIGHT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const firstNativeChip = nativeTags[0] as HTMLElement;

                    const RIGHT_EVENT: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
                    const array = tags.toArray();
                    const firstItem = array[0];

                    // Focus the last item in the array
                    firstItem.focus();
                    tick();
                    expect(manager.activeItemIndex).toEqual(0);

                    // Press the RIGHT arrow
                    tagListInstance.keydown(RIGHT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(1);
                }));

                it('should not handle arrow key events from non-chip elements', () => {
                    const event: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, tagListNativeElement);
                    const initialActiveIndex = manager.activeItemIndex;

                    tagListInstance.keydown(event);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex).toBe(initialActiveIndex);
                });

                it('should focus the first item when pressing HOME', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;
                    const HOME_EVENT = createKeyboardEvent('keydown', HOME, lastNativeChip);
                    const array = tags.toArray();
                    const lastItem = array[array.length - 1];

                    lastItem.focus();
                    tick();
                    expect(manager.activeItemIndex).toBe(array.length - 1);

                    tagListInstance.keydown(HOME_EVENT);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex).toBe(0);
                    expect(HOME_EVENT.defaultPrevented).toBe(true);
                }));

                it('should focus the last item when pressing END', () => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const END_EVENT = createKeyboardEvent('keydown', END, nativeTags[0]);

                    expect(manager.activeItemIndex).toBe(-1);

                    tagListInstance.keydown(END_EVENT);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex).toBe(tags.length - 1);
                    expect(END_EVENT.defaultPrevented).toBe(true);
                });
            });

            describe('RTL', () => {
                beforeEach(() => {
                    setupStandardList('rtl');
                    manager = tagListInstance.keyManager;
                });

                it('should focus previous item when press RIGHT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;

                    const RIGHT_EVENT: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, lastNativeChip);
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item in the array
                    lastItem.focus();
                    tick();
                    expect(manager.activeItemIndex).toEqual(lastIndex);

                    // Press the RIGHT arrow
                    tagListInstance.keydown(RIGHT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should focus next item when press LEFT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                    const firstNativeChip = nativeTags[0] as HTMLElement;

                    const LEFT_EVENT: KeyboardEvent = createKeyboardEvent('keydown', LEFT_ARROW, firstNativeChip);
                    const array = tags.toArray();
                    const firstItem = array[0];

                    // Focus the last item in the array
                    firstItem.focus();
                    tick();
                    expect(manager.activeItemIndex).toEqual(0);

                    // Press the LEFT arrow
                    tagListInstance.keydown(LEFT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(1);
                }));

                it('should allow focus to escape when tabbing away', fakeAsync(() => {
                    tagListInstance.keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

                    expect(tagListInstance.tabIndex).toBe(-1);

                    tick();

                    expect(tagListInstance.tabIndex).toBe(0);
                }));

                it(`should use user defined tabIndex`, fakeAsync(() => {
                    tagListInstance.tabIndex = 4;

                    fixture.detectChanges();

                    expect(tagListInstance.tabIndex).toBe(4);

                    tagListInstance.keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

                    expect(tagListInstance.tabIndex).toBe(-1);

                    tick();

                    expect(tagListInstance.tabIndex).toBe(4);
                }));
            });

            it('should account for the direction changing', fakeAsync(() => {
                setupStandardList();
                manager = tagListInstance.keyManager;

                const nativeTags = tagListNativeElement.querySelectorAll('kbq-tag');
                const firstNativeChip = nativeTags[0] as HTMLElement;

                const RIGHT_EVENT: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
                const array = tags.toArray();
                const firstItem = array[0];

                firstItem.focus();
                tick();
                expect(manager.activeItemIndex).toBe(0);

                tagListInstance.keydown(RIGHT_EVENT);
                tagListInstance.blur();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(1);

                dirChange.next('rtl');
                fixture.detectChanges();

                tagListInstance.keydown(RIGHT_EVENT);
                tagListInstance.blur();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(0);
            }));
        });
    });

    describe('FormFieldTagList', () => {
        beforeEach(setupInputList);

        describe('keyboard behavior', () => {
            beforeEach(() => {
                manager = tagListInstance.keyManager;
            });

            it('should maintain focus if the active tag is deleted', fakeAsync(() => {
                const secondTag = fixture.nativeElement.querySelectorAll('.kbq-tag')[1];

                secondTag.focus();
                tick();

                expect(tagListInstance.tags.toArray().findIndex((tag) => tag.hasFocus)).toBe(1);

                dispatchKeyboardEvent(secondTag, 'keydown', DELETE);

                expect(tagListInstance.tags.toArray().findIndex((tag) => tag.hasFocus)).toBe(1);
            }));

            describe('when the input has focus', () => {
                it('should not focus the last tag when press DELETE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const DELETE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DELETE, nativeInput);

                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    tagListInstance.keydown(DELETE_EVENT);
                    fixture.detectChanges();

                    // It doesn't focus the last tag
                    expect(manager.activeItemIndex).toEqual(-1);
                });

                it('should focus the last tag when press BACKSPACE', fakeAsync(() => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const BACKSPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', BACKSPACE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    tick();

                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the BACKSPACE key
                    tagListInstance.keydown(BACKSPACE_EVENT);
                    tick();

                    // It focuses the last chip
                    expect(manager.activeItemIndex).toEqual(tags.length - 1);
                }));
            });
        });

        // TODO Expected pixels
        xit('height should be 32px', () => {
            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

            expect(formFieldElement.getBoundingClientRect().height).toBe(32);
        });

        it('should complete the stateChanges stream on destroy', () => {
            const spy = jest.fn();
            const subscription = tagListInstance.stateChanges.subscribe({ complete: spy });

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        xit('should point the label id to the tag input', () => {
            const label = fixture.nativeElement.querySelector('label');
            const input = fixture.nativeElement.querySelector('input');

            fixture.detectChanges();

            expect(label.getAttribute('for')).toBeTruthy();
            expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
            expect(label.getAttribute('aria-owns')).toBe(input.getAttribute('id'));
        });
    });

    describe('forms integration', () => {
        let nativeTags: HTMLElement[];

        describe('single selection', () => {
            beforeEach(() => {
                fixture = createComponent(BasicTagList);
                fixture.detectChanges();

                nativeTags = fixture.debugElement.queryAll(By.css('kbq-tag')).map((tag) => tag.nativeElement);
                tags = fixture.componentInstance.tags;
            });

            // todo need rethink this selection logic
            xit('should set the view value from the form', () => {
                const tagList = fixture.componentInstance.tagList;
                const array = tags.toArray();

                expect(tagList.value).toBeFalsy();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(array[1].selected).toBeTruthy();
            });

            // todo need rethink this selection logic
            xit('should update the form value when the view changes', () => {
                expect(fixture.componentInstance.control.value).toEqual(null);

                dispatchKeyboardEvent(nativeTags[0], 'keydown', SPACE);
                fixture.detectChanges();

                expect(fixture.componentInstance.control.value).toEqual('steak-0');
            });

            it('should clear the selection when the control is reset', () => {
                const array = tags.toArray();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                expect(array[1].selected).toBeFalsy();
            });

            it('should set the control to touched when the tag list is touched', () => {
                expect(fixture.componentInstance.control.touched).toBe(false);

                const nativeTagList = fixture.debugElement.query(By.css('.kbq-tag-list')).nativeElement;

                dispatchFakeEvent(nativeTagList, 'blur');

                expect(fixture.componentInstance.control.touched).toBe(true);
            });

            it('should mark as pristine on init', () => {
                fixture.componentInstance.control = new UntypedFormControl('pizza-1');
                fixture.detectChanges();

                expect(fixture.componentInstance.control.pristine).toBeTruthy();
            });

            it('should not set touched when a disabled tag list is touched', () => {
                expect(fixture.componentInstance.control.touched).toBe(false);

                fixture.componentInstance.control.disable();
                const nativeTagList = fixture.debugElement.query(By.css('.kbq-tag-list')).nativeElement;

                dispatchFakeEvent(nativeTagList, 'blur');

                expect(fixture.componentInstance.control.touched).toBe(false);
            });

            // todo need rethink this selection logic
            xit("should set the control to dirty when the tag list's value changes in the DOM", () => {
                expect(fixture.componentInstance.control.dirty).toEqual(false);

                dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
                fixture.detectChanges();

                expect(fixture.componentInstance.control.dirty).toEqual(true);
            });

            // todo need rethink this selection logic
            xit('should not set the control to dirty when the value changes programmatically', () => {
                expect(fixture.componentInstance.control.dirty).toEqual(false);

                fixture.componentInstance.control.setValue('pizza-1');

                expect(fixture.componentInstance.control.dirty).toEqual(false);
            });

            xit('should set an asterisk after the placeholder if the control is required', () => {
                let requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));

                expect(requiredMarker).toBeNull();

                fixture.componentInstance.isRequired = true;
                fixture.detectChanges();

                requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));
                expect(requiredMarker).not.toBeNull();
            });

            it('should not focus the active tag when the value is set programmatically', () => {
                const chipArray = fixture.componentInstance.tags.toArray();

                const focusSpyFn = jest.spyOn(chipArray[4], 'focus');

                fixture.componentInstance.control.setValue('tags-4');
                fixture.detectChanges();

                expect(focusSpyFn).not.toHaveBeenCalled();
            });

            it('should blur the form field when the active tag is blurred', () => {
                const formField: HTMLElement = fixture.nativeElement.querySelector('.kbq-form-field');

                fixture.componentInstance.formField.runFocusMonitor();

                nativeTags[0].focus();
                fixture.detectChanges();

                expect(formField.classList).toContain('cdk-focused');

                nativeTags[0].blur();
                fixture.detectChanges();
                zone.simulateZoneExit();
                fixture.detectChanges();

                expect(formField.classList).not.toContain('cdk-focused');
            });
        });
    });

    describe('tag list with tag input', () => {
        beforeEach(() => {
            fixture = createComponent(InputTagList);
            fixture.detectChanges();
        });

        it('should clear the selection when the control is reset', () => {
            const array = fixture.componentInstance.tags.toArray();

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(array[1].selected).toBeFalsy();
        });

        it('should set the control to touched when the tag list is touched', fakeAsync(() => {
            expect(fixture.componentInstance.control.touched).toBe(false);

            const nativeTagList = fixture.debugElement.query(By.css('.kbq-tag-list')).nativeElement;

            dispatchFakeEvent(nativeTagList, 'blur');
            tick();

            expect(fixture.componentInstance.control.touched).toBe(true);
        }));

        it('should not set touched when a disabled tag list is touched', () => {
            expect(fixture.componentInstance.control.touched).toBe(false);

            fixture.componentInstance.control.disable();
            const nativeTagList = fixture.debugElement.query(By.css('.kbq-tag-list')).nativeElement;

            dispatchFakeEvent(nativeTagList, 'blur');

            expect(fixture.componentInstance.control.touched).toBe(false);
        });

        // todo need rethink this selection logic
        xit('should not set the control to dirty when the value changes programmatically', () => {
            expect(fixture.componentInstance.control.dirty).toEqual(false);

            fixture.componentInstance.control.setValue(['pizza-1']);

            expect(fixture.componentInstance.control.dirty).toEqual(false);
        });

        xit('should set an asterisk after the placeholder if the control is required', () => {
            let requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));

            expect(requiredMarker).toBeNull();

            fixture.componentInstance.isRequired = true;
            fixture.detectChanges();

            requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));
            expect(requiredMarker).not.toBeNull();
        });

        it('should keep focus on the input after adding the first chip', fakeAsync(() => {
            const nativeInput = fixture.nativeElement.querySelector('input');

            fixture.componentInstance.foods = [];
            fixture.detectChanges();

            nativeInput.focus();
            expect(fixture.componentInstance.foods).toEqual([]);
            expect(document.activeElement).toBe(nativeInput);

            typeInElement('123', nativeInput);
            fixture.detectChanges();
            dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(nativeInput);
        }));

        describe('keyboard behavior', () => {
            beforeEach(() => {
                tagListDebugElement = fixture.debugElement.query(By.directive(KbqTagList));
                tagListInstance = tagListDebugElement.componentInstance;
                tags = tagListInstance.tags;
                manager = fixture.componentInstance.tagList.keyManager;
            });

            describe('when the input has focus', () => {
                it('should not focus the last tag when press DELETE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const DELETE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DELETE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the DELETE key
                    tagListInstance.keydown(DELETE_EVENT);
                    fixture.detectChanges();

                    // It doesn't focus the last chip
                    expect(manager.activeItemIndex).toEqual(-1);
                });

                it('should focus the last tag when press BACKSPACE', fakeAsync(() => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const BACKSPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', BACKSPACE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the BACKSPACE key
                    tagListInstance.keydown(BACKSPACE_EVENT);
                    tick();

                    // It focuses the last chip
                    expect(manager.activeItemIndex).toEqual(tags.length - 1);
                }));
            });
        });
    });

    xdescribe('error messages', () => {
        let errorTestComponent: TagListWithFormErrorMessages;
        let containerEl: HTMLElement;
        let tagListEl: HTMLElement;

        beforeEach(() => {
            fixture = createComponent(TagListWithFormErrorMessages);
            fixture.detectChanges();
            errorTestComponent = fixture.componentInstance;
            containerEl = fixture.debugElement.query(By.css('kbq-form-field')).nativeElement;
            tagListEl = fixture.debugElement.query(By.css('kbq-tag-list')).nativeElement;
        });

        it('should not show any errors if the user has not interacted', () => {
            expect(errorTestComponent.formControl.untouched).toBe(true);
            expect(containerEl.querySelectorAll('kbq-error').length).toBe(0);
            expect(tagListEl.getAttribute('aria-invalid')).toBe('false');
        });

        it('should display an error message when the list is touched and invalid', fakeAsync(() => {
            expect(errorTestComponent.formControl.invalid).toBe(true);
            expect(containerEl.querySelectorAll('kbq-error').length).toBe(0);

            errorTestComponent.formControl.markAsTouched();
            fixture.detectChanges();
            tick();

            expect(containerEl.classList).toContain('kbq-form-field-invalid');
            expect(containerEl.querySelectorAll('kbq-error').length).toBe(1);
            expect(tagListEl.getAttribute('aria-invalid')).toBe('true');
        }));

        it('should display an error message when the parent form is submitted', fakeAsync(() => {
            expect(errorTestComponent.form.submitted).toBe(false);
            expect(errorTestComponent.formControl.invalid).toBe(true);
            expect(containerEl.querySelectorAll('kbq-error').length).toBe(0);

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(errorTestComponent.form.submitted).toBe(true);
                expect(containerEl.classList).toContain('kbq-form-field-invalid');
                expect(containerEl.querySelectorAll('kbq-error').length).toBe(1);
                expect(tagListEl.getAttribute('aria-invalid')).toBe('true');
            });
        }));

        it('should hide the errors and show the hints once the tag list becomes valid', fakeAsync(() => {
            errorTestComponent.formControl.markAsTouched();
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(containerEl.classList).toContain('kbq-form-field-invalid');

                expect(containerEl.querySelectorAll('kbq-error').length).toBe(1);

                expect(containerEl.querySelectorAll('kbq-hint').length).toBe(0);

                errorTestComponent.formControl.setValue('something');
                fixture.detectChanges();

                // eslint-disable-next-line promise/no-nesting
                fixture.whenStable().then(() => {
                    expect(containerEl.classList).not.toContain('kbq-form-field-invalid');

                    expect(containerEl.querySelectorAll('kbq-error').length).toBe(0);

                    expect(containerEl.querySelectorAll('kbq-hint').length).toBe(1);
                });
            });
        }));

        it('should set the proper role on the error messages', () => {
            errorTestComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(containerEl.querySelector('kbq-error')!.getAttribute('role')).toBe('alert');
        });

        it('sets the aria-describedby to reference errors when in error state', () => {
            const hintId = fixture.debugElement.query(By.css('.kbq-hint')).nativeElement.getAttribute('id');
            let describedBy = tagListEl.getAttribute('aria-describedby');

            expect(hintId).toBeTruthy();
            expect(describedBy).toBe(hintId);

            fixture.componentInstance.formControl.markAsTouched();
            fixture.detectChanges();

            const errorIds = fixture.debugElement
                .queryAll(By.css('.kbq-error'))
                .map((el) => el.nativeElement.getAttribute('id'))
                .join(' ');

            describedBy = tagListEl.getAttribute('aria-describedby');

            expect(errorIds).toBeTruthy();
            expect(describedBy).toBe(errorIds);
        });
    });

    /** @deprecated Use `createStandaloneComponent` instead. */
    function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                KbqTagsModule,
                KbqFormFieldModule,
                KbqInputModule,
                NoopAnimationsModule,
                component
            ],
            providers: [
                { provide: NgZone, useFactory: () => (zone = new MockNgZone()) },
                ...providers
            ]
        }).compileComponents();

        return TestBed.createComponent<T>(component);
    }

    function setupStandardList(direction: Direction = 'ltr') {
        dirChange = new Subject();
        fixture = createComponent(StandardTagList, [
            {
                provide: Directionality,
                useFactory: () => ({
                    value: direction.toLowerCase(),
                    change: dirChange
                })
            }
        ]);
        fixture.detectChanges();

        tagListDebugElement = fixture.debugElement.query(By.directive(KbqTagList));
        tagListNativeElement = tagListDebugElement.nativeElement;
        tagListInstance = tagListDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        tags = tagListInstance.tags;
    }

    function setupInputList() {
        fixture = createComponent(FormFieldTagList);
        fixture.detectChanges();

        tagListDebugElement = fixture.debugElement.query(By.directive(KbqTagList));
        tagListNativeElement = tagListDebugElement.nativeElement;
        tagListInstance = tagListDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        tags = tagListInstance.tags;
    }

    it('should select all on Ctrl + A', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        const event = new KeyboardEvent('keydown', { ctrlKey: true, keyCode: A });

        Object.defineProperty(event, 'target', { get: () => getLastTagElement(debugElement) });
        getTagListElement(debugElement).dispatchEvent(event);

        expect(getSelectedTags(debugElement).length).toBe(componentInstance.tags().length);
    });

    it('should focus previous tag if last tag is removed', fakeAsync(() => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        expect(getTagElements(debugElement).length).toBe(3);

        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(-1);

        getLastTagElement(debugElement).focus();
        tick();

        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(2);

        componentInstance.tags.set(componentInstance.tags().slice(0, 2));
        fixture.detectChanges();

        expect(getTagElements(debugElement).length).toBe(2);
        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(1);
    }));

    it('should focus next tag if first tag is removed', fakeAsync(() => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        expect(getTagElements(debugElement).length).toBe(3);

        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(-1);

        getFirstTagElement(debugElement).focus();
        tick();

        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(0);

        componentInstance.tags.set(componentInstance.tags().slice(1, 3));
        fixture.detectChanges();

        expect(getTagElements(debugElement).length).toBe(2);
        expect(componentInstance.tagList().keyManager.activeItemIndex).toBe(0);
    }));

    it('should NOT select tag on focus', fakeAsync(() => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement } = fixture;

        expect(getSelectedTags(debugElement).length).toBe(0);

        getLastTagElement(debugElement).focus();
        tick();

        expect(getSelectedTags(debugElement).length).toBe(0);
    }));

    it('should NOT select all on Ctrl + A when not selectable', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(false);
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { ctrlKey: true, keyCode: A });

        Object.defineProperty(event, 'target', { get: () => getLastTagElement(debugElement) });
        getTagListElement(debugElement).dispatchEvent(event);

        expect(getSelectedTags(debugElement).length).toBe(0);
    });

    it('should emit KbqTagSelectionChange event on Ctrl + A', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        const event = new KeyboardEvent('keydown', { ctrlKey: true, keyCode: A });

        Object.defineProperty(event, 'target', { get: () => getLastTagElement(debugElement) });
        getTagListElement(debugElement).dispatchEvent(event);

        expect(componentInstance.selectionChange).toHaveBeenCalledTimes(componentInstance.tags().length);
    });

    it('should NOT emit KbqTagSelectionChange event on Ctrl + A when not selectable', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(false);
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { ctrlKey: true, keyCode: A });

        Object.defineProperty(event, 'target', { get: () => getLastTagElement(debugElement) });
        getTagListElement(debugElement).dispatchEvent(event);

        expect(componentInstance.selectionChange).toHaveBeenCalledTimes(0);
    });

    it('should remove all on DELETE keydown', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) =>
            tags.map((tag) => {
                tag.selected = true;

                return tag;
            })
        );
        fixture.detectChanges();

        expect(getSelectedTags(debugElement).length).toBe(componentInstance.tags().length);

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(componentInstance.tags().length);
    });

    it('should remove all on BACKSPACE keydown', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) =>
            tags.map((tag) => {
                tag.selected = true;

                return tag;
            })
        );
        fixture.detectChanges();

        expect(getSelectedTags(debugElement).length).toBe(componentInstance.tags().length);

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(componentInstance.tags().length);
    });

    it('should ignore DELETE/BACKSPACE keydown when not removable', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) =>
            tags.map((tag) => {
                tag.selected = true;

                return tag;
            })
        );
        componentInstance.removable.set(false);
        fixture.detectChanges();

        expect(getSelectedTags(debugElement).length).toBe(componentInstance.tags().length);

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));
        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(0);
    });

    it('should remove focused tag when not selected tags', () => {
        const { debugElement, componentInstance } = createStandaloneComponent(TestTagList);

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));

        expect(componentInstance.removedChange).toHaveBeenCalledWith(
            expect.objectContaining({
                tag: expect.objectContaining({ value: expect.objectContaining({ value: 'tag2' }) })
            })
        );
    });

    it('should NOT remove focused tag when has selected tags', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) =>
            tags.map((tag, index) => {
                tag.selected = index === 0;

                return tag;
            })
        );
        fixture.detectChanges();

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));

        expect(componentInstance.removedChange).toHaveBeenCalledWith(
            expect.objectContaining({
                tag: expect.objectContaining({ value: expect.objectContaining({ value: 'tag0' }) })
            })
        );
    });

    it('should be draggable when draggable is enabled', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        expect(getTagListElement(debugElement).classList.contains('kbq-tag-list_draggable')).toBeFalsy();
        expect(getTagElements(debugElement).every((tag) => tag.classList.contains('kbq-tag_draggable'))).toBeFalsy();

        componentInstance.draggable.set(true);
        fixture.detectChanges();

        expect(getTagListElement(debugElement).classList.contains('kbq-tag-list_draggable')).toBeTruthy();
        expect(getTagElements(debugElement).every((tag) => tag.classList.contains('kbq-tag_draggable'))).toBeTruthy();
    });

    it('should NOT be draggable when disabled', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.draggable.set(true);
        fixture.detectChanges();

        expect(getTagListElement(debugElement).classList.contains('kbq-tag-list_draggable')).toBeTruthy();
        expect(getTagElements(debugElement).every((tag) => tag.classList.contains('kbq-tag_draggable'))).toBeTruthy();

        componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect(getTagListElement(debugElement).classList.contains('kbq-tag-list_draggable')).toBeFalsy();
        expect(getTagElements(debugElement).every((tag) => tag.classList.contains('kbq-tag_draggable'))).toBeFalsy();
    });

    it('should unselect tags when focus move to tag input', () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) => {
            tags[0].selected = true;
            tags[1].selected = true;

            return tags;
        });
        fixture.detectChanges();

        expect(getSelectedTags(debugElement).length).toBe(2);

        getFocusMonitor().focusVia(getTagInputElement(debugElement), 'mouse');

        expect(getSelectedTags(debugElement).length).toBe(0);
    });

    it('should unselect tags on blur', () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement, componentInstance } = fixture;

        componentInstance.tags.update((tags) => {
            tags[0].selected = true;
            tags[1].selected = true;

            return tags;
        });
        fixture.detectChanges();

        expect(getSelectedTags(debugElement).length).toBe(2);

        getTagListElement(debugElement).dispatchEvent(new Event('blur'));

        expect(getSelectedTags(debugElement).length).toBe(0);
    });

    it('should select tags on SPACE keydown', () => {
        const fixture = createStandaloneComponent(TestTagList);
        const { debugElement } = fixture;

        expect(getSelectedTags(debugElement).length).toBe(0);

        getLastTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(getSelectedTags(debugElement).length).toBe(1);

        getFirstTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(getSelectedTags(debugElement).length).toBe(2);

        getFirstTagElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(getSelectedTags(debugElement).length).toBe(1);
    });

    it('should emit KbqTagSelectionChange event on SPACE keydown', () => {
        const { debugElement, componentInstance } = createStandaloneComponent(TestTagList);
        const tag = getLastTagElement(debugElement);

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(expect.objectContaining({ selected: true }));

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(expect.objectContaining({ selected: false }));
    });

    it('should focus tag input on container click', () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement } = fixture;
        const input = getTagInputElement(debugElement);

        expect(input.classList).not.toContain('cdk-focused');

        getTagListElement(debugElement).click();

        expect(input.classList).toContain('cdk-focused');
    });

    it('should focus tag input on tag click', async () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement } = fixture;
        const input = getTagInputElement(debugElement);

        expect(input.classList).not.toContain('cdk-focused');

        getFirstTagElement(debugElement).click();

        expect(input.classList).toContain('cdk-focused');
    });

    it('should NOT focus tag input on tag click with ctrl/meta/shift key', async () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement } = fixture;
        const input = getTagInputElement(debugElement);
        const tag = getFirstTagElement(debugElement);

        expect(input.classList).not.toContain('cdk-focused');

        tag.dispatchEvent(new MouseEvent('click', { ctrlKey: true }));

        expect(input.classList).not.toContain('cdk-focused');

        tag.dispatchEvent(new MouseEvent('click', { metaKey: true }));

        expect(input.classList).not.toContain('cdk-focused');

        tag.dispatchEvent(new MouseEvent('click', { shiftKey: true }));

        expect(input.classList).not.toContain('cdk-focused');
    });

    it('should focus tag input on focus', () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement, componentInstance } = fixture;
        const input = getTagInputElement(debugElement);

        expect(input.classList).not.toContain('cdk-focused');

        componentInstance.tagList().focus();

        expect(input.classList).toContain('cdk-focused');
    });

    it('should focus last tag on LEFT_ARROW keydown when input is empty', () => {
        const { debugElement } = createStandaloneComponent(TestFormFieldTagList);
        const tag = getLastTagElement(debugElement);

        expect(tag.classList).not.toContain('cdk-focused');

        getTagInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: LEFT_ARROW }));

        expect(tag.classList).toContain('cdk-focused');
    });

    it('should NOT focus last tag on LEFT_ARROW keydown when input is NOT empty', () => {
        const { debugElement } = createStandaloneComponent(TestFormFieldTagList);
        const input = getTagInputElement(debugElement);
        const tag = getLastTagElement(debugElement);

        expect(tag.classList).not.toContain('cdk-focused');

        input.value = 'not empty';

        getTagInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: LEFT_ARROW }));

        expect(tag.classList).not.toContain('cdk-focused');
    });

    it('should focus last tag on TAB+SHIFT keydown when input is empty', () => {
        const { debugElement } = createStandaloneComponent(TestFormFieldTagList);
        const tag = getLastTagElement(debugElement);

        expect(tag.classList).not.toContain('cdk-focused');

        getTagInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: TAB, shiftKey: true }));

        expect(tag.classList).toContain('cdk-focused');
    });

    it('should NOT focus last tag on TAB+SHIFT keydown when input is NOT empty', () => {
        const { debugElement } = createStandaloneComponent(TestFormFieldTagList);
        const tag = getLastTagElement(debugElement);
        const input = getTagInputElement(debugElement);

        expect(tag.classList).not.toContain('cdk-focused');

        input.value = 'not empty';

        getTagInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: TAB, shiftKey: true }));

        expect(tag.classList).not.toContain('cdk-focused');
    });

    it('should NOT have tabindex attribute when tag list contains input', () => {
        const fixture = createStandaloneComponent(TestFormFieldTagList);
        const { debugElement } = fixture;

        expect(getTagListElement(debugElement).hasAttribute('tabindex')).toBe(false);
    });
});

@Component({
    imports: [
        KbqTagsModule
    ],
    template: `
        <kbq-tag-list [tabIndex]="tabIndex" [selectable]="selectable">
            @for (i of tags; track i) {
                <kbq-tag (select)="chipSelect(i)" (deselect)="chipDeselect(i)">{{ name }} {{ i + 1 }}</kbq-tag>
            }
        </kbq-tag-list>
    `
})
class StandardTagList {
    name: string = 'Test';
    selectable: boolean = true;
    tabIndex: number = 0;
    tags = [0, 1, 2, 3, 4];

    chipSelect: (index?: number) => void = () => {};
    chipDeselect: (index?: number) => void = () => {};
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTagsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags; track tag) {
                    <kbq-tag (removed)="remove(tag)">
                        {{ tag }}
                    </kbq-tag>
                }
                <input name="test" [kbqTagInputFor]="tagList" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class FormFieldTagList {
    tags = ['Chip 0', 'Chip 1', 'Chip 2'];

    remove(chip: string) {
        const index = this.tags.indexOf(chip);

        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }
}

@Component({
    selector: 'basic-tag-list',
    imports: [
        KbqFormFieldModule,
        KbqTagsModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list
                placeholder="Food"
                [formControl]="control"
                [required]="isRequired"
                [tabIndex]="tabIndexOverride"
                [selectable]="selectable"
            >
                @for (food of foods; track food) {
                    <kbq-tag [value]="food.value" [disabled]="food.disabled">
                        {{ food.viewValue }}
                    </kbq-tag>
                }
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class BasicTagList {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'tags-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl();
    isRequired: boolean;
    tabIndexOverride: number;
    selectable: boolean = true;

    @ViewChild(KbqFormField, { static: false }) formField: KbqFormField;
    @ViewChild(KbqTagList, { static: false }) tagList: KbqTagList;
    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;
}

@Component({
    selector: 'input-tag-list',
    imports: [
        KbqFormFieldModule,
        KbqTagsModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList1 placeholder="Food" [formControl]="control" [required]="isRequired">
                @for (food of foods; track food) {
                    <kbq-tag [value]="food.value" (removed)="remove(food)">
                        {{ food.viewValue }}
                    </kbq-tag>
                }
            </kbq-tag-list>
            <input
                placeholder="New food..."
                [kbqTagInputFor]="tagList1"
                [kbqTagInputSeparatorKeyCodes]="separatorKeyCodes"
                [kbqTagInputAddOnBlur]="addOnBlur"
                (kbqTagInputTokenEnd)="add($event)"
            />
        </kbq-form-field>
    `
})
class InputTagList {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'tags-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl();

    separatorKeyCodes = [ENTER, SPACE];
    addOnBlur: boolean = true;
    isRequired: boolean;

    @ViewChild(KbqTagList, { static: false }) tagList: KbqTagList;
    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    add(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our foods
        if ((value || '').trim()) {
            this.foods.push({
                value: `${value.trim().toLowerCase()}-${this.foods.length}`,
                viewValue: value.trim()
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(food: any): void {
        const index = this.foods.indexOf(food);

        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }
}

@Component({
    imports: [
        KbqTagsModule
    ],
    template: `
        <kbq-tag-list>
            @for (food of foods; track food) {
                <kbq-tag [value]="food.value" [selected]="food.selected">
                    {{ food.viewValue }}
                </kbq-tag>
            }
        </kbq-tag-list>
    `
})
class SelectedTagList {
    foods: any[] = [
        { value: 0, viewValue: 'Steak', selected: true },
        { value: 1, viewValue: 'Pizza', selected: false },
        { value: 2, viewValue: 'Pasta', selected: true }
    ];
    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTagsModule,
        ReactiveFormsModule
    ],
    template: `
        <form #form="ngForm" novalidate>
            <kbq-form-field>
                <kbq-tag-list [formControl]="formControl">
                    @for (food of foods; track food) {
                        <kbq-tag [value]="food.value" [selected]="food.selected">
                            {{ food.viewValue }}
                        </kbq-tag>
                    }
                </kbq-tag-list>
                <kbq-hint>Please select a chip, or type to add a new chip</kbq-hint>
                <!--                <kbq-error>Should have value</kbq-error>-->
            </kbq-form-field>
        </form>
    `
})
class TagListWithFormErrorMessages {
    foods: any[] = [
        { value: 0, viewValue: 'Steak', selected: true },
        { value: 1, viewValue: 'Pizza', selected: false },
        { value: 2, viewValue: 'Pasta', selected: true }
    ];

    formControl = new UntypedFormControl('', Validators.required);

    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    @ViewChild('form', { static: false }) form: NgForm;
}

@Component({
    imports: [
        KbqTagsModule
    ],
    template: `
        <kbq-tag-list>
            @for (i of numbers; track i) {
                <kbq-tag (removed)="remove(i)">
                    {{ i }}
                </kbq-tag>
            }
        </kbq-tag-list>
    `,
    animations: [
        // For the case we're testing this animation doesn't
        // have to be used anywhere, it just has to be defined.
        trigger('dummyAnimation', [
            transition(':leave', [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 }))
            ])
        ])
    ]
})
class StandardTagListWithAnimations {
    numbers = [0, 1, 2, 3, 4];

    remove(item: number): void {
        const index = this.numbers.indexOf(item);

        if (index > -1) {
            this.numbers.splice(index, 1);
        }
    }
}
