import { Directionality } from '@angular/cdk/bidi';
import { ENTER, ESCAPE, F2 } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, DebugElement, model, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BACKSPACE, DELETE, SPACE } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { Subject } from 'rxjs';
import { KbqTagList } from './tag-list.component';
import { KbqTag, KbqTagEditInput, KbqTagEditSubmit, KbqTagEvent, KbqTagSelectionChange } from './tag.component';
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

const getTagEditInputElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.directive(KbqTagEditInput)).nativeElement;
};

const getTagEditSubmitElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTagEditSubmit)).nativeElement;
};

@Component({
    standalone: true,
    selector: 'test-editable-tag',
    imports: [KbqTagsModule, FormsModule],
    template: `
        <kbq-tag [editable]="editable()" [preventEditSubmit]="preventEditSubmit()" (editChange)="editChange($event)">
            {{ tag() }}
            <input kbqTagEditInput [(ngModel)]="tag" />
            <i kbqTagEditSubmit></i>
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEditableTag {
    readonly tag = model('Editable tag');
    readonly editable = model(true);
    readonly preventEditSubmit = model(false);

    readonly editChange = jest.fn();
}

@Component({
    standalone: true,
    selector: 'test-selectable-tag',
    imports: [KbqTagsModule, FormsModule],
    template: `
        <kbq-tag [selectable]="selectable()" (selectionChange)="selectionChange($event)">
            {{ tag() }}
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestSelectableTag {
    readonly tag = model('Selectable tag');
    readonly selectable = model(true);

    readonly selectionChange = jest.fn();
}

describe(KbqTag.name, () => {
    let fixture: ComponentFixture<any>;
    let tagDebugElement: DebugElement;
    let tagNativeElement: HTMLElement;
    let tagInstance: KbqTag;

    const dir = 'ltr';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqTagsModule],
            declarations: [BasicTag, SingleTag],
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

            it('emits focus only once for multiple clicks', () => {
                let counter = 0;

                tagInstance.onFocus.subscribe(() => {
                    counter++;
                });

                tagNativeElement.focus();
                tagNativeElement.focus();
                fixture.detectChanges();

                expect(counter).toBe(1);
            });

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

                const event = dispatchFakeEvent(tagNativeElement, 'mousedown');

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
            describe('when selectable is true', () => {
                beforeEach(() => {
                    testComponent.selectable = true;
                    fixture.detectChanges();
                });

                it('should selects/deselects the currently focused tag on SPACE', () => {
                    const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;
                    const CHIP_SELECTED_EVENT: KbqTagSelectionChange = {
                        source: tagInstance,
                        isUserInput: true,
                        selected: true
                    };

                    const CHIP_DESELECTED_EVENT: KbqTagSelectionChange = {
                        source: tagInstance,
                        isUserInput: true,
                        selected: false
                    };

                    const tagSelectionChangeSpyFn = jest.spyOn(testComponent, 'tagSelectionChange');

                    // Use the spacebar to select the chip
                    tagInstance.handleKeydown(SPACE_EVENT);
                    fixture.detectChanges();

                    expect(tagInstance.selected).toBeTruthy();
                    expect(tagSelectionChangeSpyFn).toHaveBeenCalledTimes(1);
                    expect(tagSelectionChangeSpyFn).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

                    // Use the spacebar to deselect the chip
                    tagInstance.handleKeydown(SPACE_EVENT);
                    fixture.detectChanges();

                    expect(tagInstance.selected).toBeFalsy();
                    expect(tagSelectionChangeSpyFn).toHaveBeenCalledTimes(2);
                    expect(tagSelectionChangeSpyFn).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
                });
            });

            describe('when selectable is false', () => {
                beforeEach(() => {
                    testComponent.selectable = false;
                    fixture.detectChanges();
                });

                it('SPACE ignores selection', () => {
                    const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;

                    const tagSelectionChangeSpyFn = jest.spyOn(testComponent, 'tagSelectionChange');

                    // Use the spacebar to attempt to select the chip
                    tagInstance.handleKeydown(SPACE_EVENT);
                    fixture.detectChanges();

                    expect(tagInstance.selected).toBeFalsy();
                    expect(tagSelectionChangeSpyFn).not.toHaveBeenCalled();
                });

                it('should not have the aria-selected attribute', () => {
                    expect(tagNativeElement.hasAttribute('aria-selected')).toBe(false);
                });
            });

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
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();
    });

    it('should start editing on ENTER press', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();

        tag.focus();
        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();
    });

    it('should start editing on F2 press', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();

        tag.focus();
        tag.dispatchEvent(new KeyboardEvent('keydown', { keyCode: F2 }));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();
    });

    it('should emit KbqTagEditChange event when editing starts', () => {
        const { debugElement, componentInstance } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'start', reason: 'dblclick' })
        );
    });

    it('should cancel editing on ESCAPE press', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ESCAPE }));

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();
    });

    it('should cancel editing on focusout', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new Event('blur'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();
    });

    it('should emit KbqTagEditChange event when editing cancelled', () => {
        const { debugElement, componentInstance } = createComponent(TestEditableTag);

        getTagElement(debugElement).dispatchEvent(new MouseEvent('dblclick'));

        getTagEditInputElement(debugElement).dispatchEvent(new Event('blur'));

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cancel', reason: 'focusout' })
        );
    });

    it('should submit editing on ENTER press', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();
    });

    it('should submit editing on kbqEditSubmit click', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        getTagEditSubmitElement(debugElement).dispatchEvent(new MouseEvent('click'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();
    });

    it('should prevent submit editing by preventEditSubmit property', () => {
        const fixture = createComponent(TestEditableTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        expect(tag.classList.contains('kbq-tag_editing')).toBeFalsy();

        componentInstance.preventEditSubmit.set(true);
        fixture.detectChanges();

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();
    });

    it('should emit KbqTagEditChange event when editing submitted', () => {
        const { debugElement, componentInstance } = createComponent(TestEditableTag);

        getTagElement(debugElement).dispatchEvent(new MouseEvent('dblclick'));

        getTagEditInputElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER }));

        expect(componentInstance.editChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'submit', reason: 'enter' })
        );
    });

    it('should stay editable when pressing BACKSPACE and SPACE keys', () => {
        const { debugElement } = createComponent(TestEditableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('dblclick'));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();

        const input = getTagEditInputElement(debugElement);

        input.dispatchEvent(createKeyboardEvent('keydown', BACKSPACE));
        input.dispatchEvent(createKeyboardEvent('keydown', SPACE));

        expect(tag.classList.contains('kbq-tag_editing')).toBeTruthy();
    });

    it('should select tag on Ctrl + click', () => {
        const { debugElement } = createComponent(TestSelectableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('mousedown', { ctrlKey: true }));

        expect(tag.classList.contains('kbq-selected')).toBeTruthy();
    });

    it('should select tag on Cmd + click', () => {
        const { debugElement } = createComponent(TestSelectableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('mousedown', { metaKey: true }));

        expect(tag.classList.contains('kbq-selected')).toBeTruthy();
    });

    it('should select tag on Shift + click', () => {
        const { debugElement } = createComponent(TestSelectableTag);
        const tag = getTagElement(debugElement);

        tag.dispatchEvent(new MouseEvent('mousedown', { shiftKey: true }));

        expect(tag.classList.contains('kbq-selected')).toBeTruthy();
    });

    it('should NOT select tag on Ctrl + click', () => {
        const fixture = createComponent(TestSelectableTag);
        const { debugElement, componentInstance } = fixture;
        const tag = getTagElement(debugElement);

        componentInstance.selectable.set(false);
        fixture.detectChanges();

        tag.dispatchEvent(new MouseEvent('mousedown', { ctrlKey: true }));

        expect(tag.classList.contains('kbq-selected')).toBeFalsy();
    });

    it('should emit KbqTagSelectionChange event on Ctrl + click', () => {
        const { debugElement, componentInstance } = createComponent(TestSelectableTag);

        getTagElement(debugElement).dispatchEvent(new MouseEvent('mousedown', { ctrlKey: true }));

        expect(componentInstance.selectionChange).toHaveBeenCalledWith(
            expect.objectContaining({ selected: true, isUserInput: true })
        );
    });
});

@Component({
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
    template: `
        <kbq-basic-tag>{{ name }}</kbq-basic-tag>
    `
})
class BasicTag {}
