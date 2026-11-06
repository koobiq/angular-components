import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    ENTER,
    ShowOnControlDirtyErrorStateMatcher,
    typeInElement
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTagInputEvent, KbqTagList, KbqTagsModule } from '@koobiq/components/tags';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getInput = (fixture: ComponentFixture<unknown>): HTMLInputElement => fixture.nativeElement.querySelector('input');

const typeTagAndPressEnter = async (fixture: ComponentFixture<unknown>, value: string): Promise<void> => {
    const input = getInput(fixture);

    typeInElement(value, input);
    input.dispatchEvent(createKeyboardEvent('keydown', ENTER, undefined, 'Enter'));
    fixture.detectChanges();
    await fixture.whenStable();
};

const maxTwoTags = ({ value }: AbstractControl<string[]>): ValidationErrors | null =>
    value.length > 2 ? { maxTags: true } : null;

/** The handler writes the form control, as the `*-with-form-control-validators` examples do. */
@Component({
    imports: [KbqFormFieldModule, KbqTagsModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list
                #tagList
                [formControl]="control"
                [errorStateMatcher]="matcher"
                (change)="change($event)"
                (valueChange)="valueChange($event)"
            >
                @for (tag of control.value; track $index) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
                <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class ControlWritingTagList {
    readonly tagList = viewChild.required(KbqTagList);
    readonly control = new FormControl<string[]>(['a', 'b'], { nonNullable: true, validators: [maxTwoTags] });
    readonly matcher = new ShowOnControlDirtyErrorStateMatcher();
    readonly change = vi.fn();
    readonly valueChange = vi.fn();

    add({ value, input }: KbqTagInputEvent): void {
        if (value) {
            this.control.setValue([...this.control.value, value]);
        }

        input.value = '';
    }
}

/** The handler keeps its own array and rejects every typed value. */
@Component({
    imports: [KbqFormFieldModule, KbqTagsModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList [formControl]="control" (change)="change($event)">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
                <input [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="reject($event)" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class RejectingTagList {
    readonly tags = signal(['a', 'b']);
    readonly control = new FormControl<string[]>(['a', 'b'], { nonNullable: true });
    readonly change = vi.fn();

    reject({ input }: KbqTagInputEvent): void {
        input.value = '';
    }
}

/** The handlers keep their own array, the way the autocomplete examples without a form control do. */
@Component({
    imports: [KbqFormFieldModule, KbqTagsModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList [formControl]="control" (change)="change($event)">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
                <input
                    #input
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="add($event)"
                />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="select($event, input)">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
class AutocompleteTagList {
    readonly options = ['x', 'y'];
    readonly tags = signal(['a']);
    readonly control = new FormControl<string[]>(['a'], { nonNullable: true });
    readonly change = vi.fn();

    add({ value, input }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => [...tags, value]);
        }

        input.value = '';
    }

    select({ option }: KbqAutocompleteSelectedEvent, input: HTMLInputElement): void {
        this.tags.update((tags) => [...tags, option.value]);
        input.value = '';
        option.deselect();
    }
}

describe('triage: tags user-change detection', () => {
    let overlayContainer: OverlayContainer | undefined;

    afterEach(() => {
        overlayContainer?.ngOnDestroy();
        overlayContainer = undefined;
    });

    it('DEFECT: a tag the handler writes into the form control leaves it pristine, emits no change and shows no dirty error', async () => {
        const fixture = createComponent(ControlWritingTagList);
        const { componentInstance } = fixture;

        await typeTagAndPressEnter(fixture, 'c');

        expect(componentInstance.control.value).toEqual(['a', 'b', 'c']);
        expect(fixture.nativeElement.querySelectorAll('kbq-tag').length).toBe(3);
        expect(componentInstance.control.invalid).toBe(true);

        expect(componentInstance.control.dirty).toBe(false);
        expect(componentInstance.change).not.toHaveBeenCalled();
        expect(componentInstance.valueChange).not.toHaveBeenCalled();
        expect(componentInstance.tagList().errorState()).toBe(false);
    });

    it('DEFECT: after a rejected tag, a later change of the consumer data made in code marks the control dirty and emits change', async () => {
        const fixture = createComponent(RejectingTagList);
        const { componentInstance } = fixture;

        await typeTagAndPressEnter(fixture, 'rejected');

        expect(fixture.nativeElement.querySelectorAll('kbq-tag').length).toBe(2);
        expect(componentInstance.control.dirty).toBe(false);
        expect(componentInstance.change).not.toHaveBeenCalled();

        componentInstance.tags.set(['a', 'b', 'loaded']);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(componentInstance.control.dirty).toBe(true);
        expect(componentInstance.change).toHaveBeenCalledTimes(1);
        expect(componentInstance.control.value).toEqual(['a', 'b', 'loaded']);
    });

    it('treats the same change made in code as programmatic when no tag was rejected before', async () => {
        const fixture = createComponent(RejectingTagList);
        const { componentInstance } = fixture;

        componentInstance.tags.set(['a', 'b', 'loaded']);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(componentInstance.control.dirty).toBe(false);
        expect(componentInstance.change).not.toHaveBeenCalled();
    });

    it('DEFECT: a tag added from an autocomplete option is not reported, so the form control keeps the old value', async () => {
        const fixture = createComponent(AutocompleteTagList);
        const { componentInstance } = fixture;
        const input = getInput(fixture);

        overlayContainer = TestBed.inject(OverlayContainer);

        dispatchFakeEvent(input, 'focusin');
        fixture.detectChanges();
        await fixture.whenStable();

        const option = overlayContainer.getContainerElement().querySelector('kbq-option') as HTMLElement;

        option.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(componentInstance.tags()).toEqual(['a', 'x']);
        expect(fixture.nativeElement.querySelectorAll('kbq-tag').length).toBe(2);

        expect(componentInstance.control.value).toEqual(['a']);
        expect(componentInstance.control.dirty).toBe(false);
        expect(componentInstance.change).not.toHaveBeenCalled();
    });

    it('reports a typed tag of the same list, which goes through notifyPendingTagChange()', async () => {
        const fixture = createComponent(AutocompleteTagList);
        const { componentInstance } = fixture;

        const input = getInput(fixture);

        overlayContainer = TestBed.inject(OverlayContainer);

        // Without focus and an `input` event the panel stays closed, so Enter reaches the tag input.
        input.value = 'typed';
        input.dispatchEvent(createKeyboardEvent('keydown', ENTER, undefined, 'Enter'));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(overlayContainer.getContainerElement().querySelector('.kbq-autocomplete-panel')).toBeNull();
        expect(componentInstance.tags()).toEqual(['a', 'typed']);
        expect(componentInstance.control.value).toEqual(['a', 'typed']);
        expect(componentInstance.control.dirty).toBe(true);
        expect(componentInstance.change).toHaveBeenCalledTimes(1);
    });
});
