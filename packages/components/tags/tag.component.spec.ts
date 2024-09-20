import { Directionality } from '@angular/cdk/bidi';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BACKSPACE, DELETE, SPACE } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { Subject } from 'rxjs';
import { KbqTag, KbqTagEvent, KbqTagList, KbqTagSelectionChange, KbqTagsModule } from './index';

describe('Tags', () => {
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
