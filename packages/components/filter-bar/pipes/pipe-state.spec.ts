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

    const render = (pipes: KbqPipe[]) => {
        fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.pipes = pipes;
        fixture.detectChanges();
    };

    const pipeDebugElement = (index: number = 0) => fixture.debugElement.queryAll(By.css('.kbq-pipe'))[index];

    const pipeComponent = (index: number = 0): KbqBasePipe<unknown> => pipeDebugElement(index).componentInstance;

    /** Both halves of a pipe: its trigger and, while it is rendered, the remove button. */
    const halvesOf = (index: number = 0): HTMLElement[] => {
        const pipe: HTMLElement = pipeDebugElement(index).nativeElement;

        return [
            pipe.querySelector<HTMLElement>('button:not(.kbq-pipe__remove-button)'),
            pipe.querySelector<HTMLElement>('.kbq-pipe__remove-button')
        ].filter((half): half is HTMLElement => !!half);
    };

    const expectStyle = (style: 'filled' | 'outline', halves: HTMLElement[]) => {
        halves.forEach((half) => expect(Array.from(half.classList)).toContain(`kbq-button_${style}`));
    };

    it('should fill both halves once an empty cleanable pipe receives a value', fakeAsync(() => {
        render([selectPipe({ value: null, cleanable: true })]);

        expectStyle('outline', halvesOf());

        (pipeComponent() as KbqPipeSelectComponent).onSelect(SELECT_VALUES[0]);
        flush();
        fixture.detectChanges();

        const halves = halvesOf();

        expect(halves.length).toBe(2);
        expectStyle('filled', halves);
    }));

    it('should outline both halves once a removable pipe is emptied', () => {
        render([selectPipe({ value: SELECT_VALUES[0], removable: true })]);

        expectStyle('filled', halvesOf());

        pipeComponent().onClear();
        fixture.detectChanges();

        const halves = halvesOf();

        expect(halves.length).toBe(2);
        expectStyle('outline', halves);
    });

    it('should outline the trigger left behind by a cleared cleanable pipe', () => {
        render([selectPipe({ value: SELECT_VALUES[0], cleanable: true })]);

        pipeComponent().onClear();
        fixture.detectChanges();

        const halves = halvesOf();

        expect(halves.length).toBe(1);
        expectStyle('outline', halves);
    });

    it('should follow an emptiness change that comes from the pipe templates', () => {
        render([multiSelectPipe({ value: [SELECT_VALUES[0]], cleanable: true })]);

        expectStyle('filled', halvesOf());

        // Locking the only selected option makes the pipe read as empty without touching `data.value`.
        fixture.componentInstance.pipeTemplates = [
            selectTemplate(),
            multiSelectTemplate({ lockedValues: [SELECT_VALUES[0]] })
        ];
        fixture.detectChanges();

        const halves = halvesOf();

        expect(halves.length).toBe(1);
        expectStyle('outline', halves);
    });

    it('should follow a value mutated outside the pipe once the change is announced', () => {
        render([selectPipe({ value: null, cleanable: true })]);

        const pipe = pipeComponent();

        pipe.data.value = SELECT_VALUES[0];
        pipe.stateChanges.next();
        fixture.detectChanges();

        expectStyle('filled', halvesOf());
    });
});
