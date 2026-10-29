import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqBasePipe,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeSelectComponent,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';

const SELECT_VALUES: KbqSelectValue[] = [
    { name: 'Option 1', value: 'value1' },
    { name: 'Option 2', value: 'value2' }
];

const PIPE_ID = 'TestSelect';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'test',
    id: PIPE_ID,
    type: KbqPipeTypes.Select,
    value: null,
    search: false,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const createFilter = (name: string, pipes: KbqPipe[]): KbqFilter => ({
    name,
    readonly: false,
    disabled: false,
    changed: false,
    saved: false,
    pipes
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
            <kbq-filter-reset (onResetFilter)="onReset()" />
        </kbq-filter-bar>
    `
})
class TestApp {
    activeFilter: KbqFilter | null = createFilter('Initial', []);

    resets = 0;

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            id: PIPE_ID,
            type: KbqPipeTypes.Select,
            values: SELECT_VALUES,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];

    // As in the docs examples: the reset builds the default filter, whose pipe is meant to open on reset.
    onReset(): void {
        this.resets++;
        this.activeFilter = createFilter('', [createPipe({ openOnReset: true })]);
    }
}

describe('filter-bar triage: reset stream stays latched', () => {
    let fixture: ComponentFixture<TestApp>;
    let filterBarDebugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] })
            .overrideComponent(KbqPipeSelectComponent, {
                set: { providers: [{ provide: KbqBasePipe, useExisting: KbqPipeSelectComponent }] }
            })
            .compileComponents();

        vi.useFakeTimers();
    });

    afterEach(() => vi.useRealTimers());

    const getPipe = (): KbqPipeSelectComponent =>
        fixture.debugElement.query(By.css('kbq-pipe-select')).componentInstance;

    const settle = async () => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    it('control: a pipe with openOnReset rendered before any reset stays closed', async () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.activeFilter = createFilter('Saved', [createPipe({ openOnReset: true })]);
        await settle();

        expect(getPipe().select().panelOpen).toBe(false);
    });

    it('DEFECT: after one reset, a pipe with openOnReset rendered later opens its panel on its own', async () => {
        fixture = TestBed.createComponent(TestApp);
        filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        await settle();

        const filterBar: KbqFilterBar = filterBarDebugElement.componentInstance;

        // The one and only reset: the default filter it builds opens its pipe, as intended.
        fixture.debugElement.query(By.css('kbq-filter-reset button')).nativeElement.click();
        await settle();

        expect(fixture.componentInstance.resets).toBe(1);
        expect(getPipe().select().panelOpen).toBe(true);

        getPipe().select().close();
        await settle();

        expect(getPipe().select().panelOpen).toBe(false);
        expect(filterBar.onResetFilter.value).toBe(true);

        // Later the user selects a saved filter — e.g. the reset filter saved as new, whose pipe copies keep
        // `openOnReset`. No reset happens, yet the freshly rendered pipe replays the latched `true` and opens.
        const current = fixture.componentInstance.activeFilter!;

        fixture.componentInstance.activeFilter = {
            ...current,
            name: 'Saved',
            saved: true,
            pipes: current.pipes.map((pipe) => ({ ...pipe }))
        };
        await settle();

        expect(fixture.componentInstance.resets).toBe(1);
        expect(getPipe().select().panelOpen).toBe(true);
    });
});
