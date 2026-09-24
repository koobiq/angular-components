import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeMultiSelectComponent } from './pipe-multi-select';
import { KbqPipeSelectComponent } from './pipe-select';

const SELECT_VALUES: KbqSelectValue[] = [
    { id: 1, name: 'Option 1', value: 'value1' },
    { id: 2, name: 'Option 2', value: 'value2' },
    { id: 3, name: 'Option 3', value: 'value3' }
];

const SELECT_ID = 'TestSelect';
const MULTI_SELECT_ID = 'TestMultiSelect';

const selectTemplate = (overrides: Partial<KbqPipeTemplate> = {}): KbqPipeTemplate => ({
    name: 'Select',
    id: SELECT_ID,
    type: KbqPipeTypes.Select,
    values: SELECT_VALUES,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const multiSelectTemplate = (overrides: Partial<KbqPipeTemplate> = {}): KbqPipeTemplate => ({
    name: 'MultiSelect',
    id: MULTI_SELECT_ID,
    type: KbqPipeTypes.MultiSelect,
    values: SELECT_VALUES,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const selectPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'Select',
    id: SELECT_ID,
    type: KbqPipeTypes.Select,
    value: null,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const multiSelectPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'MultiSelect',
    id: MULTI_SELECT_ID,
    type: KbqPipeTypes.MultiSelect,
    value: null,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates">
            @for (pipe of pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
class TestApp {
    // No `[filter]` binding on purpose: with nothing bound `KbqFilterBar.filter()` stays null and never
    // moves, so no signal reacts when a pipe gains or loses its value. That is the shape of the cleanable
    // documentation example, and the configuration the two halves used to disagree in.
    pipes: KbqPipe[] = [];
    pipeTemplates: KbqPipeTemplate[] = [selectTemplate(), multiSelectTemplate()];
}

describe('KbqPipeState', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        // The pipe components alias themselves to `KbqBasePipe` with `useExisting: this`, which does not
        // resolve here. Every `[kbqPipeState]` injects that alias, so the specs restore it.
        TestBed.configureTestingModule({ imports: [NoopAnimationsModule, KbqFilterBarModule, TestApp] })
            .overrideComponent(KbqPipeSelectComponent, {
                set: { providers: [{ provide: KbqBasePipe, useExisting: KbqPipeSelectComponent }] }
            })
            .overrideComponent(KbqPipeMultiSelectComponent, {
                set: { providers: [{ provide: KbqBasePipe, useExisting: KbqPipeMultiSelectComponent }] }
            });
    });

    const render = (pipes: KbqPipe[], pipeTemplates?: KbqPipeTemplate[]) => {
        fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.pipes = pipes;

        if (pipeTemplates) {
            fixture.componentInstance.pipeTemplates = pipeTemplates;
        }

        fixture.detectChanges();
    };

    /** Typed per pipe kind: `.kbq-pipe` matches every kind, so a shared accessor could not narrow safely. */
    const selectPipeComponent = (index: number = 0): KbqPipeSelectComponent =>
        fixture.debugElement.queryAll(By.css('kbq-pipe-select'))[index].componentInstance;

    const multiSelectPipeComponent = (index: number = 0): KbqPipeMultiSelectComponent =>
        fixture.debugElement.queryAll(By.css('kbq-pipe-multi-select'))[index].componentInstance;

    const pipeElement = (index: number = 0): HTMLElement =>
        fixture.debugElement.queryAll(By.css('.kbq-pipe'))[index].nativeElement;

    /** Both halves of a pipe: its trigger and, while it is rendered, the remove button. */
    const halvesOf = (index: number = 0): HTMLElement[] => {
        const pipe = pipeElement(index);

        return [
            pipe.querySelector<HTMLElement>('button:not(.kbq-pipe__remove-button)'),
            pipe.querySelector<HTMLElement>('.kbq-pipe__remove-button')
        ].filter((half): half is HTMLElement => !!half);
    };

    const clickRemoveButton = (index: number = 0) => {
        pipeElement(index).querySelector<HTMLElement>('.kbq-pipe__remove-button')!.click();
        fixture.detectChanges();
    };

    /** Asserts the style of every half, and how many there were — `forEach` over an empty array asserts nothing. */
    const expectPipeStyle = (style: 'filled' | 'outline', halves: HTMLElement[], count: number) => {
        expect(halves.length).toBe(count);
        halves.forEach((half) => {
            expect(Array.from(half.classList)).toContain(`kbq-button_${style}`);
            expect(Array.from(half.classList)).not.toContain(`kbq-button_${style === 'filled' ? 'outline' : 'filled'}`);
        });
    };

    it('should fill both halves once an empty cleanable pipe receives a value', fakeAsync(() => {
        render([selectPipe({ value: null, cleanable: true })]);

        expectPipeStyle('outline', halvesOf(), 1);

        selectPipeComponent().onSelect(SELECT_VALUES[0]);
        flush();
        fixture.detectChanges();

        expectPipeStyle('filled', halvesOf(), 2);
    }));

    it('should outline both halves once a pipe is cleared by its own clear button', () => {
        // Cleanable AND removable: the clear button routes to `onClear()` because the pipe is cleanable
        // (`pipe-button.ts`), and `removable` keeps it mounted through the transition, so both halves stay
        // visible while the value goes away.
        render([selectPipe({ value: SELECT_VALUES[0], cleanable: true, removable: true })]);

        expectPipeStyle('filled', halvesOf(), 2);

        clickRemoveButton();

        expectPipeStyle('outline', halvesOf(), 2);
    });

    it('should outline the trigger left behind by a cleared cleanable pipe', () => {
        render([selectPipe({ value: SELECT_VALUES[0], cleanable: true })]);

        clickRemoveButton();

        expectPipeStyle('outline', halvesOf(), 1);
    });

    it('should outline a pipe the templates turn empty', () => {
        render([multiSelectPipe({ value: [SELECT_VALUES[0]], cleanable: true, removable: true })]);

        expectPipeStyle('filled', halvesOf(), 2);

        // Locking the only selected option makes the pipe read as empty without touching `data.value`.
        fixture.componentInstance.pipeTemplates = [
            selectTemplate(),
            multiSelectTemplate({ lockedValues: [SELECT_VALUES[0]] })
        ];
        fixture.detectChanges();

        expect(multiSelectPipeComponent().isEmpty).toBe(true);
        expectPipeStyle('outline', halvesOf(), 2);
    });

    it('should fill a pipe the templates turn non-empty', () => {
        render(
            [multiSelectPipe({ value: [SELECT_VALUES[0]], cleanable: true, removable: true })],
            [selectTemplate(), multiSelectTemplate({ lockedValues: [SELECT_VALUES[0]] })]
        );

        expectPipeStyle('outline', halvesOf(), 2);

        // Releasing the lock leaves the same `data.value` holding a freely chosen option.
        fixture.componentInstance.pipeTemplates = [selectTemplate(), multiSelectTemplate()];
        fixture.detectChanges();

        expect(multiSelectPipeComponent().isEmpty).toBe(false);
        expectPipeStyle('filled', halvesOf(), 2);
    });

    it('should follow a value mutated outside the pipe once the change is announced', () => {
        render([selectPipe({ value: null, cleanable: true })]);

        const pipe = selectPipeComponent();

        pipe.data.value = SELECT_VALUES[0];
        pipe.stateChanges.next();
        fixture.detectChanges();

        expectPipeStyle('filled', halvesOf(), 2);
    });
});
