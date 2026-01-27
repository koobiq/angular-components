import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BACKSPACE, DELETE, ENTER, ESCAPE, F2, SPACE } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    model,
    Provider,
    Type,
    viewChild,
    ViewChild
} from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createKeyboardEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { Subject } from 'rxjs';
import { KbqTagList } from './tag-list.component';
import {
    KbqTag,
    KbqTagEditInput,
    KbqTagEditSubmit,
    KbqTagEvent,
    KbqTagRemove,
    KbqTagSelectionChange
} from './tag.component';
import { KbqTagsModule } from './tag.module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTagElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTag)).nativeElement;
};

const isTagSelected = (debugElement: DebugElement): boolean => {
    return getTagElement(debugElement).classList.contains('kbq-selected');
};

const isTagFocused = (debugElement: DebugElement): boolean => {
    return getTagElement(debugElement).classList.contains('cdk-focused');
};

const isTagSelectable = (debugElement: DebugElement): boolean => {
    return getTagElement(debugElement).classList.contains('kbq-tag_selectable');
};

const isTagEditing = (debugElement: DebugElement): boolean => {
    return getTagElement(debugElement).classList.contains('kbq-tag_editing');
};

const getTagEditInputElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.directive(KbqTagEditInput)).nativeElement;
};

const getTagEditSubmitElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTagEditSubmit)).nativeElement;
};

const getFocusMonitor = () => TestBed.inject(FocusMonitor);

const getTagRemoveElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTagRemove))?.nativeElement;
};

@Component({
    selector: 'test-tag',
    imports: [KbqTagsModule, FormsModule],
    template: `
        <kbq-tag
            [value]="value()"
            [selectable]="selectable()"
            [selected]="selected()"
            [disabled]="disabled()"
            [removable]="removable()"
            [editable]="editable()"
            [preventEditSubmit]="preventEditSubmit()"
            (selectionChange)="selectionChange($event)"
            (removed)="removedChange($event)"
            (editChange)="editChange($event)"
        >
            {{ value() }}
            <i kbqTagRemove></i>
            <input kbqTagEditInput [(ngModel)]="value" />
            <i kbqTagEditSubmit></i>
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestTag {
    readonly tag = viewChild.required(KbqTag);
    readonly value = model('Tag');
    readonly selectable = model(false);
    readonly disabled = model(false);
    readonly selected = model(false);
    readonly removable = model(true);
    readonly editable = model(true);
    readonly preventEditSubmit = model(false);

    readonly selectionChange = jest.fn();
    readonly removedChange = jest.fn();
    readonly editChange = jest.fn();
}

@Component({
    selector: 'test-tag',
    imports: [KbqTagsModule, FormsModule],
    template: `
        <kbq-tag-list>
            <kbq-tag
                [value]="value()"
                [selected]="selected()"
                [disabled]="disabled()"
                [removable]="removable()"
                [editable]="editable()"
                [preventEditSubmit]="preventEditSubmit()"
                (selectionChange)="selectionChange($event)"
                (removed)="removedChange($event)"
                (editChange)="editChange($event)"
            >
                {{ value() }}
                <i kbqTagRemove></i>
                <input kbqTagEditInput [(ngModel)]="value" />
                <i kbqTagEditSubmit></i>
            </kbq-tag>
        </kbq-tag-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestTagInsideTagList {
    readonly tag = viewChild.required(KbqTag);
    readonly value = model('Tag');
    readonly disabled = model(false);
    readonly selected = model(false);
    readonly removable = model(true);
    readonly editable = model(true);
    readonly preventEditSubmit = model(false);

    readonly selectionChange = jest.fn();
    readonly removedChange = jest.fn();
    readonly editChange = jest.fn();
}

describe(KbqTag.name, () => {
    let fixture: ComponentFixture<any>;
    let tagDebugElement: DebugElement;
    let tagNativeElement: HTMLElement;
    let tagInstance: KbqTag;

    const dir = 'ltr';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqTagsModule, BasicTag, SingleTag],
            providers: [
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: new Subject()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('KbqBasicTag', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BasicTag);
            fixture.detectChanges();

            tagDebugElement = fixture.debugElement.query(By.directive(KbqTag));
            tagNativeElement = tagDebugElement.nativeElement;
            tagInstance = tagDebugElement.injector.get<KbqTag>(KbqTag);

            document.body.appendChild(tagNativeElement);
        });

        afterEach(() => {
            document.body.removeChild(tagNativeElement);
        });

        it('adds the `kbq-basic-tag` class', () => {
            expect(tagNativeElement.classList).toContain('kbq-tag');
            expect(tagNativeElement.classList).toContain('kbq-basic-tag');
        });
    });

    describe('KbqTag', () => {
        let testComponent: SingleTag;

        beforeEach(() => {
            fixture = TestBed.createComponent(SingleTag);
            fixture.detectChanges();

            tagDebugElement = fixture.debugElement.query(By.directive(KbqTag));
            tagNativeElement = tagDebugElement.nativeElement;
            tagInstance = tagDebugElement.injector.get<KbqTag>(KbqTag);
            testComponent = fixture.debugElement.componentInstance;

            document.body.appendChild(tagNativeElement);
        });

        afterEach(() => {
            document.body.removeChild(tagNativeElement);
        });

        describe('basic behaviors', () => {
            it('adds the `kbq-tag` class', () => {
                expect(tagNativeElement.classList).toContain('kbq-tag');
            });

            it('does not add the `kbq-basic-tag` class', () => {
                expect(tagNativeElement.classList).not.toContain('kbq-basic-tag');
            });

            it('emits focus only once for multiple clicks', fakeAsync(() => {
                let counter = 0;

                tagInstance.onFocus.subscribe(() => {
                    counter++;
                });

                tagNativeElement.focus();
                tagNativeElement.focus();
                tick();

                expect(counter).toBe(1);
            }));

            it('emits destroy on destruction', () => {
                const tagDestroySpyFn = jest.spyOn(testComponent, 'tagDestroy');

                // Force a destroy callback
                testComponent.shouldShow = false;
                fixture.detectChanges();

                expect(tagDestroySpyFn).toHaveBeenCalledTimes(1);
            });

            it('allows color customization', () => {
                expect(tagNativeElement.classList).toContain('kbq-primary');

                testComponent.color = 'error';
                fixture.detectChanges();

                expect(tagNativeElement.classList).not.toContain('kbq-primary');
                expect(tagNativeElement.classList).toContain('kbq-error');
            });

            it('allows selection', () => {
                const tagSelectionChangeSpyFn = jest.spyOn(testComponent, 'tagSelectionChange');

                expect(tagNativeElement.classList).not.toContain('kbq-selected');

                testComponent.selected = true;
                fixture.detectChanges();

                expect(tagNativeElement.classList).toContain('kbq-selected');
                expect(tagSelectionChangeSpyFn).toHaveBeenCalledWith({
                    source: tagInstance,
                    isUserInput: false,
                    selected: true
                });
            });

            it('allows removal', () => {
                const tagRemoveSpyFn = jest.spyOn(testComponent, 'tagRemove');

                tagInstance.remove();
                fixture.detectChanges();

                expect(tagRemoveSpyFn).toHaveBeenCalledWith({ tag: tagInstance });
            });

            it('should not prevent the default click action', () => {
                const event = dispatchFakeEvent(tagNativeElement, 'click');

                fixture.detectChanges();

                expect(event.defaultPrevented).toBe(false);
            });

            it('should prevent the default click action when the tag is disabled', () => {
                tagInstance.disabled = true;
                fixture.detectChanges();

                const event = dispatchFakeEvent(tagNativeElement, 'click');

                fixture.detectChanges();

                expect(event.defaultPrevented).toBe(true);
            });

            it('should not dispatch `selectionChange` event when deselecting a non-selected chip', () => {
                tagInstance.deselect();

                const spy = jest.fn();
                const subscription = tagInstance.selectionChange.subscribe(spy);

                tagInstance.deselect();

                expect(spy).not.toHaveBeenCalled();
                subscription.unsubscribe();
            });

            it('should not dispatch `selectionChange` event when selecting a selected chip', () => {
                tagInstance.select();

                const spy = jest.fn();
                const subscription = tagInstance.selectionChange.subscribe(spy);

                tagInstance.select();

                expect(spy).not.toHaveBeenCalled();
                subscription.unsubscribe();
            });

            it('should not dispatch `selectionChange` event when selecting a selected tag via user interaction', () => {
                tagInstance.select();

                const spy = jest.fn();
                const subscription = tagInstance.selectionChange.subscribe(spy);

                tagInstance.selectViaInteraction();

                expect(spy).not.toHaveBeenCalled();
                subscription.unsubscribe();
            });

            it('should not dispatch `selectionChange` through setter if the value did not change', () => {
                tagInstance.selected = false;

                const spy = jest.fn();
                const subscription = tagInstance.selectionChange.subscribe(spy);

                tagInstance.selected = false;

                expect(spy).not.toHaveBeenCalled();
                subscription.unsubscribe();
            });
        });

        describe('keyboard behavior', () => {
            describe('when removable is true', () => {
                beforeEach(() => {
                    testComponent.removable = true;
                    fixture.detectChanges();
                });

                it('DELETE emits the (removed) event', () => {
                    const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

                    const tagRemoveSpyFn = jest.spyOn(testComponent, 'tagRemove');

                    // Use the delete to remove the chip
                    tagInstance.handleKeydown(DELETE_EVENT);
                    fixture.detectChanges();

                    expect(tagRemoveSpyFn).toHaveBeenCalled();
                });

                it('BACKSPACE emits the (removed) event', () => {
                    const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

                    const tagRemoveSpyFn = jest.spyOn(testComponent, 'tagRemove');

                    // Use the delete to remove the chip
                    tagInstance.handleKeydown(BACKSPACE_EVENT);
                    fixture.detectChanges();

                    expect(tagRemoveSpyFn).toHaveBeenCalled();
                });
            });

            describe('when removable is false', () => {
                beforeEach(() => {
                    testComponent.removable = false;
                    fixture.detectChanges();
                });

                it('DELETE does not emit the (removed) event', () => {
                    const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

                    const tagRemoveSpyFn = jest.spyOn(testComponent, 'tagRemove');

                    // Use the delete to remove the chip
                    tagInstance.handleKeydown(DELETE_EVENT);
                    fixture.detectChanges();

                    expect(tagRemoveSpyFn).not.toHaveBeenCalled();
                });

                it('BACKSPACE does not emit the (removed) event', () => {
                    const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

                    const tagRemoveSpyFn = jest.spyOn(testComponent, 'tagRemove');

                    // Use the delete to remove the chip
                    tagInstance.handleKeydown(BACKSPACE_EVENT);
                    fixture.detectChanges();

                    expect(tagRemoveSpyFn).not.toHaveBeenCalled();
                });
            });

            it('should make disabled chips non-focusable', () => {
                expect(tagNativeElement.getAttribute('tabindex')).toBe('-1');

                testComponent.disabled = true;
                fixture.detectChanges();

                expect(tagNativeElement.getAttribute('tabindex')).toBeFalsy();
            });
        });
    });

    it('should start editing on double click', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagEditing(debugElement)).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();
    });

    it('should start editing on ENTER press', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagEditing(debugElement)).toBeFalsy();

        tag.focus();
        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(isTagEditing(debugElement)).toBeTruthy();
    });

    it('should start editing on F2 press', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagEditing(debugElement)).toBeFalsy();

        tag.focus();
        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: F2 }));

        expect(isTagEditing(debugElement)).toBeTruthy();
    });

    it('should emit KbqTagEditChange event when editing starts', () => {
        const { debugElement, componentInstance } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'start', reason: 'dblclick' })
        );
    });

    it('should cancel editing on ESCAPE press', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ESCAPE }));

        expect(isTagEditing(debugElement)).toBeFalsy();
    });

    it('should cancel editing on blur', fakeAsync(() => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));
        // dblclick in tests does not focus the tag, so we need to use FocusMonitor to simulate real user behavior
        getFocusMonitor().focusVia(tag, 'mouse');
        tick();

        expect(isTagEditing(debugElement)).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new Event('blur'));
        tick();

        expect(isTagEditing(debugElement)).toBeFalsy();
    }));

    it('should emit KbqTagEditChange event when editing cancelled', fakeAsync(() => {
        const { debugElement, componentInstance } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));
        // dblclick in tests does not focus the tag, so we need to use FocusMonitor to simulate real user behavior
        getFocusMonitor().focusVia(tag, 'mouse');
        tick();

        getTagEditInputElement(debugElement).dispatchEvent(new Event('blur'));
        tick();

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cancel', reason: 'blur' })
        );
    }));

    it('should submit editing on ENTER press', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(isTagEditing(debugElement)).toBeFalsy();
    });

    it('should submit editing on kbqEditSubmit click', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();

        getTagEditSubmitElement(debugElement).dispatchEvent(new MouseEvent('click'));

        expect(isTagEditing(debugElement)).toBeFalsy();
    });

    it('should prevent submit editing by preventEditSubmit property', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        expect(isTagEditing(debugElement)).toBeFalsy();

        componentInstance.preventEditSubmit.set(true);
        fixture.detectChanges();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(isTagEditing(debugElement)).toBeTruthy();
    });

    it('should emit KbqTagEditChange event when editing submitted', () => {
        const { debugElement, componentInstance } = createComponent(TestTag);

        getTagElement(debugElement).dispatchEvent(new MouseEvent('dblclick'));

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'submit', reason: 'enter' })
        );
    });

    it('should stay editable when pressing BACKSPACE/SPACE/DELETE keys', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagEditing(debugElement)).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(isTagEditing(debugElement)).toBeTruthy();

        const input = getTagEditInputElement(debugElement);

        input.dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));
        input.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));
        input.dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));

        expect(isTagEditing(debugElement)).toBeTruthy();
    });

    it('should add "cdk-keyboard-focused" class when editing', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(tag.classList.contains('cdk-keyboard-focused')).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('cdk-keyboard-focused')).toBeFalsy();
    });

    it('should select tag in tag-list on Ctrl + click', () => {
        const { debugElement } = createComponent(TestTagInsideTagList);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('click', { ctrlKey: true }));

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should select tag by selected attribute', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        expect(isTagSelected(debugElement)).toBeFalsy();

        componentInstance.selected.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should NOT select tag when it is disabled', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        expect(isTagSelected(debugElement)).toBeFalsy();

        componentInstance.disabled.set(true);
        fixture.detectChanges();

        componentInstance.tag().select();
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();
    });

    it('should select tag by select() method', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();

        componentInstance.tag().select();
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should DEselect tag by deselect() method', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();

        componentInstance.selected.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeTruthy();

        componentInstance.tag().deselect();
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();
    });

    it('should toggle tag selection by toggleSelected() method', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();

        componentInstance.tag().toggleSelected();
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should select tag in tag-list on Cmd + click', () => {
        const { debugElement } = createComponent(TestTagInsideTagList);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('click', { metaKey: true }));

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should select tag in tag-list on Shift + click', () => {
        const { debugElement } = createComponent(TestTagInsideTagList);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('click', { shiftKey: true }));

        expect(isTagSelected(debugElement)).toBeTruthy();
    });

    it('should NOT select tag on Shift/Cmd/Ctrl + click', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagSelected(debugElement)).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('click', { shiftKey: true }));

        expect(isTagSelected(debugElement)).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('click', { metaKey: true }));

        expect(isTagSelected(debugElement)).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('click', { ctrlKey: true }));

        expect(isTagSelected(debugElement)).toBeFalsy();
    });

    it('should emit KbqTagSelectionChange event on Ctrl + click', () => {
        const { debugElement, componentInstance } = createComponent(TestTagInsideTagList);

        getTagElement(debugElement).dispatchEvent(new MouseEvent('click', { ctrlKey: true }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(
            expect.objectContaining({ selected: true, isUserInput: true })
        );
    });

    it('should be focused by focus() method', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagFocused(debugElement)).toBeFalsy();

        tag.focus();

        expect(isTagFocused(debugElement)).toBeTruthy();

        tag.blur();

        expect(isTagFocused(debugElement)).toBeFalsy();
    });

    it('should NOT be focused when disabled', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        expect(isTagFocused(debugElement)).toBeFalsy();

        componentInstance.disabled.set(true);
        fixture.detectChanges();

        getTagElement(debugElement).focus();

        expect(isTagFocused(debugElement)).toBeFalsy();
    });

    it('should focus by mouse', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagFocused(debugElement)).toBeFalsy();

        getFocusMonitor().focusVia(tag, 'mouse');

        expect(isTagFocused(debugElement)).toBeTruthy();

        tag.blur();

        expect(isTagFocused(debugElement)).toBeFalsy();
    });

    it('should focus by keyboard', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagFocused(debugElement)).toBeFalsy();

        getFocusMonitor().focusVia(tag, 'keyboard');

        expect(isTagFocused(debugElement)).toBeTruthy();

        tag.blur();

        expect(isTagFocused(debugElement)).toBeFalsy();
    });

    it('should remove on DELETE keydown', () => {
        const { debugElement, componentInstance } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(1);
    });

    it('should remove on BACKSPACE keydown', () => {
        const { debugElement, componentInstance } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(1);
    });

    it('should NOT remove on DELETE/BACKSPACE keydown', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        componentInstance.removable.set(false);
        fixture.detectChanges();

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));
        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(0);
    });

    it('should NOT remove unfocused on DELETE/BACKSPACE keydown', () => {
        const { componentInstance } = createComponent(TestTag);

        document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: DELETE }));
        document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: BACKSPACE }));

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(0);
    });

    it('should remove on KbqTagRemove click', () => {
        const { debugElement, componentInstance } = createComponent(TestTag);

        getTagRemoveElement(debugElement).click();

        expect(componentInstance.removedChange).toHaveBeenCalledTimes(1);
    });

    it('should hide KbqTagRemove when removable attribute is false', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        expect(getTagRemoveElement(debugElement)).toBeInstanceOf(HTMLElement);

        componentInstance.removable.set(false);
        fixture.detectChanges();

        expect(getTagRemoveElement(debugElement)).toBeUndefined();
    });

    it('should toggle tag selection tag on focus/blur', fakeAsync(() => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(isTagFocused(debugElement)).toBeFalsy();
        expect(isTagSelected(debugElement)).toBeFalsy();

        getTagElement(debugElement).focus();
        tick();

        expect(isTagFocused(debugElement)).toBeTruthy();
        expect(isTagSelected(debugElement)).toBeTruthy();

        getTagElement(debugElement).blur();
        tick();

        expect(isTagFocused(debugElement)).toBeFalsy();
        expect(isTagSelected(debugElement)).toBeFalsy();
    }));

    it('should toggle tag selection on SPACE keydown', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        expect(isTagSelected(debugElement)).toBeFalsy();

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(isTagSelected(debugElement)).toBeTruthy();

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(isTagSelected(debugElement)).toBeFalsy();
    });

    it('should emit KbqTagSelectionChange event on SPACE keydown', () => {
        const fixture = createComponent(TestTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        componentInstance.selectable.set(true);
        fixture.detectChanges();

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(expect.objectContaining({ selected: true }));

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(expect.objectContaining({ selected: false }));
    });

    it('should focus tag on SPACE keydown', () => {
        const { debugElement } = createComponent(TestTag);
        const tag = getTagElement(debugElement);

        expect(isTagFocused(debugElement)).toBeFalsy();

        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE }));

        expect(isTagFocused(debugElement)).toBeTruthy();
    });

    it('should NOT be selectable by default', () => {
        const { debugElement } = createComponent(TestTag);

        expect(isTagSelectable(debugElement)).toBeFalsy();
    });

    it('should be selectable by default in tag-list', () => {
        const { debugElement } = createComponent(TestTagInsideTagList);

        expect(isTagSelectable(debugElement)).toBeTruthy();
    });
});

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list>
            @if (shouldShow) {
                <div>
                    <kbq-tag
                        [selectable]="selectable"
                        [removable]="removable"
                        [color]="color"
                        [selected]="selected"
                        [disabled]="disabled"
                        (focus)="tagFocus($event)"
                        (destroyed)="tagDestroy($event)"
                        (selectionChange)="tagSelectionChange($event)"
                        (removed)="tagRemove($event)"
                    >
                        {{ name }}
                    </kbq-tag>
                </div>
            }
        </kbq-tag-list>
    `
})
class SingleTag {
    disabled: boolean = false;
    name: string = 'Test';
    color: string = 'primary';
    selected: boolean = false;
    selectable: boolean = true;
    removable: boolean = true;
    shouldShow: boolean = true;

    @ViewChild(KbqTagList, { static: false }) tagList: KbqTagList;

    tagFocus: (event?: KbqTagEvent) => void = () => {};
    tagDestroy: (event?: KbqTagEvent) => void = () => {};
    tagSelectionChange: (event?: KbqTagSelectionChange) => void = () => {};
    tagRemove: (event?: KbqTagEvent) => void = () => {};
}

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-basic-tag>{{ name }}</kbq-basic-tag>
    `
})
class BasicTag {}
