import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFilter, KbqPipe } from '@koobiq/components/filter-bar';

/** Minimal host contract shared by every pipe spec's `TestComponent`. */
export interface KbqPipeStatesHost {
    activeFilter: KbqFilter | null;
}

/** Live, per-test context created by each spec inside the shared `beforeEach`. */
export interface KbqPipeStatesContext {
    /** Freshly created fixture whose host exposes `activeFilter`. */
    fixture: ComponentFixture<KbqPipeStatesHost>;
    /** Debug element of the `KbqFilterBar` rendered by the host. */
    filterBar: DebugElement;
}

/** Configuration passed by a pipe spec to register the shared "Pipe states" suite. */
export interface KbqPipeStatesConfig {
    /** Human-readable pipe label, used only in the "should render all X pipes" test name. */
    label: string;
    /** Type modifier class every rendered pipe of this kind carries, e.g. `'kbq-pipe__text'`. */
    pipeClass: string;
    /** Spec factory that stamps the correct pipe `type`/`id` onto the given overrides. */
    createPipe: (overrides: Partial<KbqPipe>) => KbqPipe;
    /** Spec factory that wraps pipes into a filter. */
    createFilter: (pipes: KbqPipe[]) => KbqFilter;
    /**
     * Produces a fresh, non-empty value valid for this pipe type. Used for the
     * required/cleanable/removable/disabled fixtures; the empty fixture always uses `null`.
     */
    nonEmptyValue: () => unknown;
    /**
     * Creates the fixture and resolves the filter-bar debug element. Invoked inside the shared
     * `beforeEach`, i.e. after the spec's own `TestBed.configureTestingModule` has run.
     */
    createContext: () => KbqPipeStatesContext;
}

/**
 * The five pipe states exercised by the shared suite, in the order they render inside the filter
 * bar. Looking pipes up by name (see `pipeElementAt`) replaces the previous magic `[0..4]` indices.
 */
const PIPE_STATE_DESCRIPTORS = [
    { name: 'required', empty: false, cleanable: false, removable: false, disabled: false },
    { name: 'empty', empty: true, cleanable: true, removable: false, disabled: false },
    { name: 'cleanable', empty: false, cleanable: true, removable: false, disabled: false },
    { name: 'removable', empty: false, cleanable: false, removable: true, disabled: false },
    { name: 'disabled', empty: false, cleanable: false, removable: false, disabled: true }
] as const;

type PipeStateName = (typeof PIPE_STATE_DESCRIPTORS)[number]['name'];

/**
 * Registers the shared "Pipe states" describe block for a single pipe spec. Every pipe renders the
 * same five state fixtures and asserts the CSS modifier classes `KbqBasePipe` applies to the host
 * `.kbq-pipe` element, so the block is identical modulo the per-type value and modifier class.
 */
export const registerPipeStatesTests = (config: KbqPipeStatesConfig): void => {
    describe('Pipe states', () => {
        let filterBar: DebugElement;

        beforeEach(() => {
            const context = config.createContext();
            const pipes = PIPE_STATE_DESCRIPTORS.map((descriptor) =>
                config.createPipe({
                    name: descriptor.name,
                    value: descriptor.empty ? null : config.nonEmptyValue(),
                    cleanable: descriptor.cleanable,
                    removable: descriptor.removable,
                    disabled: descriptor.disabled
                })
            );

            context.fixture.componentInstance.activeFilter = config.createFilter(pipes);
            context.fixture.detectChanges();

            filterBar = context.filterBar;
        });

        /** Native `.kbq-pipe` element of the fixture registered under the given state name. */
        const pipeElementAt = (name: PipeStateName): HTMLElement => {
            const index = PIPE_STATE_DESCRIPTORS.findIndex((descriptor) => descriptor.name === name);

            return filterBar.queryAll(By.css('.kbq-pipe'))[index].nativeElement;
        };

        it(`should render all ${config.label} pipes`, () => {
            const pipes = filterBar.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(PIPE_STATE_DESCRIPTORS.length);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain(config.pipeClass);
            });
        });

        it('should apply required state (no special classes)', () => {
            const required = pipeElementAt('required');

            expect(required.classList).not.toContain('kbq-pipe_cleanable');
            expect(required.classList).not.toContain('kbq-pipe_removable');
            expect(required.classList).not.toContain('kbq-pipe_disabled');
            expect(required.classList).not.toContain('kbq-pipe_empty');
        });

        it('should apply empty state', () => {
            expect(pipeElementAt('empty').classList).toContain('kbq-pipe_empty');
        });

        it('should apply cleanable state', () => {
            const cleanable = pipeElementAt('cleanable');

            expect(cleanable.classList).toContain('kbq-pipe_cleanable');
            expect(cleanable.classList).not.toContain('kbq-pipe_removable');
        });

        it('should apply removable state', () => {
            const removable = pipeElementAt('removable');

            expect(removable.classList).toContain('kbq-pipe_removable');
            expect(removable.classList).not.toContain('kbq-pipe_cleanable');
        });

        it('should apply disabled state', () => {
            expect(pipeElementAt('disabled').classList).toContain('kbq-pipe_disabled');
        });
    });
};
