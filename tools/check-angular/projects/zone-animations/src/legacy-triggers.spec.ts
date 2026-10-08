import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DOWN_ARROW, ENTER, ESCAPE } from '@koobiq/components/core';
import { renderScenario } from '../../../shared/testing';
import { config } from './config';
import { LegacyTriggersScenario } from './legacy-triggers';

/** What `Element.animate()` returns in this suite: it runs until the test finishes it. */
class HeldAnimation extends EventTarget {
    playState: AnimationPlayState = 'running';
    currentTime: number | null = 0;

    constructor(
        readonly element: Element,
        readonly keyframes: Keyframe[]
    ) {
        super();
    }

    play(): void {
        if (this.playState === 'paused') this.playState = 'running';
    }

    pause(): void {
        if (this.playState === 'running') this.playState = 'paused';
    }

    cancel(): void {
        this.playState = 'idle';
    }

    finish(): void {
        if (this.playState === 'finished') return;

        this.playState = 'finished';
        this.dispatchEvent(new Event('finish'));
    }
}

let held: HeldAnimation[] = [];

function holdAnimations(): void {
    held = [];
    Element.prototype.animate = function (this: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes | null) {
        const animation = new HeldAnimation(this, keyframes as Keyframe[]);

        held.push(animation);

        return animation as unknown as Animation;
    };
}

/**
 * jsdom has no `Element.scrollTo`, which the scrollbar viewport of the select and dropdown panels calls.
 * Returns the restore function.
 */
function stubScrollTo(): () => void {
    if ('scrollTo' in Element.prototype) return () => undefined;

    Object.defineProperty(Element.prototype, 'scrollTo', {
        configurable: true,
        writable: true,
        value(this: Element, options?: ScrollToOptions) {
            if (options?.top !== undefined) this.scrollTop = options.top;
            if (options?.left !== undefined) this.scrollLeft = options.left;
        }
    });

    return () => delete (Element.prototype as Partial<Element>).scrollTo;
}

const isRunning = ({ playState }: HeldAnimation) => playState === 'running' || playState === 'paused';

const runningOn = (element: Element) =>
    held.filter((animation) => animation.element === element && isRunning(animation));

async function finishAnimations(fixture: ComponentFixture<unknown>): Promise<void> {
    held.filter(isRunning).forEach((animation) => animation.finish());
    await fixture.whenStable();
}

/** The phases an application trigger reported, as `<phase> <from> -> <to>`. */
const phases = (fixture: ComponentFixture<LegacyTriggersScenario>, trigger: string) =>
    fixture.componentInstance
        .animations()
        .filter((record) => record.trigger === trigger)
        .map(({ phase, from, to }) => `${phase} ${from} -> ${to}`);

const query = (selector: string) => document.querySelector<HTMLElement>(selector);

const queryAll = (selector: string) => Array.from(document.querySelectorAll<HTMLElement>(selector));

const overlayPanes = () => document.querySelectorAll('.cdk-overlay-pane').length;

const dropdownItems = () => queryAll('.kbq-dropdown-item');

const keydown = (target: Element, key: string, keyCode: number) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }));

async function click(fixture: ComponentFixture<unknown>, element: HTMLElement): Promise<void> {
    element.click();
    await fixture.whenStable();
}

async function showFilters(fixture: ComponentFixture<LegacyTriggersScenario>): Promise<HTMLElement> {
    await click(fixture, query('.check-legacy-toggle')!);
    await finishAnimations(fixture);

    return query('.check-legacy-filters')!;
}

describe('legacy @angular/animations triggers around Koobiq (zone-animations)', () => {
    let restoreScrollTo: () => void;

    beforeEach(() => {
        restoreScrollTo = stubScrollTo();
        vi.spyOn(console, 'error');
        vi.spyOn(console, 'warn');
    });

    afterEach(() => {
        // Torn down here rather than by TestBed later, so what the teardown logs is caught as well.
        TestBed.resetTestingModule();

        const logged = [...vi.mocked(console.error).mock.calls, ...vi.mocked(console.warn).mock.calls];

        vi.restoreAllMocks();
        restoreScrollTo();
        expect(logged).toEqual([]);
    });

    it('ends each transition at once where jsdom has no Element.animate', async () => {
        // The Web Animations driver of `provideAnimations()` then has nothing to play, and reports `done` as soon
        // as it builds a transition: no test below could see one running without the stub.
        expect(Element.prototype.animate).toBeUndefined();

        const fixture = await renderScenario(LegacyTriggersScenario, config);

        await click(fixture, query('.check-legacy-toggle')!);

        expect(query('.check-legacy-filters .kbq-select')).not.toBeNull();
        expect(phases(fixture, 'fade')).toContain('done void -> null');

        await click(fixture, query('.check-legacy-toggle')!);

        expect(query('.check-legacy-filters')).toBeNull();
        expect(phases(fixture, 'fade')).toContain('done null -> void');
    });

    describe('with Element.animate running until the test finishes it', () => {
        beforeEach(holdAnimations);

        afterEach(() => {
            delete (Element.prototype as Partial<Element>).animate;
        });

        it('fades the filter bar in and out around a kbq-select and a dropdown trigger', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);

            await click(fixture, query('.check-legacy-toggle')!);

            const filters = query('.check-legacy-filters')!;

            expect(filters.querySelector('.kbq-select')).not.toBeNull();
            expect(filters.querySelector('.check-legacy-actions')).not.toBeNull();
            expect(runningOn(filters).map(({ keyframes }) => keyframes.map(({ opacity }) => opacity))).toEqual([
                ['0', '1']
            ]);
            expect(phases(fixture, 'fade')).toEqual(['start void -> null']);

            await finishAnimations(fixture);

            expect(phases(fixture, 'fade')).toEqual(['start void -> null', 'done void -> null']);

            await click(fixture, query('.check-legacy-toggle')!);

            expect(filters.isConnected).toBe(true);
            expect(runningOn(filters)).toHaveLength(1);
            expect(phases(fixture, 'fade').at(-1)).toBe('start null -> void');

            await finishAnimations(fixture);

            expect(filters.isConnected).toBe(false);
            expect(phases(fixture, 'fade').at(-1)).toBe('done null -> void');
        });

        it('opens the kbq-select of the animated bar with the keyboard, selects and detaches its panel', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);
            const filters = await showFilters(fixture);
            const select = filters.querySelector<HTMLElement>('.kbq-select')!;

            select.focus();
            keydown(select, 'Enter', ENTER);
            await fixture.whenStable();

            expect(query('.kbq-select__panel')).not.toBeNull();
            expect(queryAll('.kbq-select__panel kbq-option').map((option) => option.textContent?.trim())).toEqual(
                fixture.componentInstance.statuses
            );
            expect(fixture.componentInstance.selectOpenedChanges()).toEqual([true]);

            keydown(document.activeElement!, 'ArrowDown', DOWN_ARROW);
            await fixture.whenStable();
            keydown(document.activeElement!, 'Enter', ENTER);
            await fixture.whenStable();

            expect(fixture.componentInstance.status.value).toBe('In progress');
            expect(fixture.componentInstance.selectOpenedChanges()).toEqual([true, false]);
            expect(query('.kbq-select__panel')).toBeNull();
            expect(overlayPanes()).toBe(0);
            expect(document.activeElement).toBe(select);
        });

        it('runs a trigger inside a dropdown item, and the dropdown still opens, closes and detaches', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);

            await click(fixture, query('.check-legacy-toggle')!);

            const filters = query('.check-legacy-filters')!;
            const actions = filters.querySelector<HTMLElement>('.check-legacy-actions')!;

            // Opened while the bar is still fading in.
            await click(fixture, actions);

            expect(runningOn(filters)).toHaveLength(1);
            expect(dropdownItems().map((item) => item.textContent?.trim())).toEqual(['Export', 'Archive']);
            expect(fixture.componentInstance.dropdownEvents()).toEqual(['opened']);

            await finishAnimations(fixture);

            expect(phases(fixture, 'fade')).toEqual(['start void -> null', 'done void -> null']);
            expect(dropdownItems()).toHaveLength(2);

            await click(fixture, dropdownItems()[0]);

            expect(fixture.componentInstance.lastAction()).toBe('Export');
            expect(dropdownItems()).toEqual([]);
            expect(overlayPanes()).toBe(0);
            expect(fixture.componentInstance.dropdownEvents()).toEqual(['opened', 'closed']);

            actions.focus();
            keydown(actions, 'Enter', ENTER);
            await fixture.whenStable();

            const badge = query('.check-legacy-badge')!;

            expect(badge.closest('.cdk-overlay-container')).not.toBeNull();
            expect(document.activeElement).toBe(dropdownItems()[0]);
            expect(runningOn(badge)).toHaveLength(1);
            expect(phases(fixture, 'pop')).toEqual(['start void -> null']);

            await finishAnimations(fixture);

            expect(phases(fixture, 'pop')).toEqual(['start void -> null', 'done void -> null']);

            keydown(document.activeElement!, 'Escape', ESCAPE);
            await fixture.whenStable();

            expect(dropdownItems()).toEqual([]);
            expect(badge.isConnected).toBe(false);
            expect(overlayPanes()).toBe(0);
            expect(document.activeElement).toBe(actions);
            expect(fixture.componentInstance.dropdownEvents()).toEqual(['opened', 'closed', 'opened', 'closed']);
        });

        it('closes the open dropdown when the animated bar leaves, and removes the bar once it has faded', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);
            const filters = await showFilters(fixture);

            await click(fixture, filters.querySelector<HTMLElement>('.check-legacy-actions')!);

            expect(dropdownItems()).toHaveLength(2);

            fixture.componentInstance.filtersShown.set(false);
            await fixture.whenStable();

            expect(filters.isConnected).toBe(true);
            expect(dropdownItems()).toEqual([]);
            expect(overlayPanes()).toBe(0);

            await finishAnimations(fixture);

            expect(filters.isConnected).toBe(false);
            expect(phases(fixture, 'fade').at(-1)).toBe('done null -> void');
        });

        it('closes the open kbq-select panel when the animated bar leaves, and ignores clicks while it fades', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);
            const filters = await showFilters(fixture);
            const select = filters.querySelector<HTMLElement>('.kbq-select')!;

            await click(fixture, select);

            expect(query('.kbq-select__panel')).not.toBeNull();

            fixture.componentInstance.filtersShown.set(false);
            await fixture.whenStable();

            expect(filters.isConnected).toBe(true);
            expect(query('.kbq-select__panel')).toBeNull();
            expect(overlayPanes()).toBe(0);

            const openedChanges = fixture.componentInstance.selectOpenedChanges();

            await click(fixture, select);

            expect(query('.kbq-select__panel')).toBeNull();
            expect(fixture.componentInstance.selectOpenedChanges()).toBe(openedChanges);

            await finishAnimations(fixture);

            expect(filters.isConnected).toBe(false);
        });

        it('runs a trigger in the content of a sidepanel, which opens, closes and detaches', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);
            const openDetails = query('.check-legacy-open-details')!;

            openDetails.focus();
            await click(fixture, openDetails);

            const note = query('.check-legacy-note')!;

            expect(note.closest('.kbq-sidepanel-container')).not.toBeNull();
            expect(fixture.componentInstance.detailsOpened()).toBe(1);
            expect(runningOn(note)).toHaveLength(1);
            expect(phases(fixture, 'fade')).toEqual(['start void -> null']);

            await finishAnimations(fixture);

            expect(phases(fixture, 'fade')).toEqual(['start void -> null', 'done void -> null']);

            await click(fixture, query('.check-legacy-close-details')!);

            expect(fixture.componentInstance.detailsClosed()).toBe(1);
            expect(query('.kbq-sidepanel-container')).toBeNull();
            expect(note.isConnected).toBe(false);
            expect(overlayPanes()).toBe(0);
            expect(document.activeElement).toBe(openDetails);
        });

        it('ends the transitions under [@.disabled] at once, and the Koobiq overlays there still work', async () => {
            const fixture = await renderScenario(LegacyTriggersScenario, config);

            fixture.componentInstance.motionOff.set(true);
            await click(fixture, query('.check-legacy-toggle')!);

            const filters = query('.check-legacy-filters')!;

            expect(held.filter(({ element }) => element === filters)).toEqual([]);
            expect(phases(fixture, 'fade')).toEqual(['start void -> null', 'done void -> null']);

            await click(fixture, filters.querySelector<HTMLElement>('.kbq-select')!);
            await click(fixture, queryAll('.kbq-select__panel kbq-option')[2]);

            expect(fixture.componentInstance.status.value).toBe('Closed');
            expect(query('.kbq-select__panel')).toBeNull();
            expect(overlayPanes()).toBe(0);

            const actions = filters.querySelector<HTMLElement>('.check-legacy-actions')!;

            await click(fixture, actions);
            await click(fixture, dropdownItems()[1]);

            expect(fixture.componentInstance.lastAction()).toBe('Archive');
            expect(dropdownItems()).toEqual([]);
            expect(overlayPanes()).toBe(0);

            actions.focus();
            keydown(actions, 'Enter', ENTER);
            await fixture.whenStable();

            // Angular scopes [@.disabled] to the DOM subtree, and the panel renders in the overlay container.
            expect(runningOn(query('.check-legacy-badge')!)).toHaveLength(1);

            keydown(document.activeElement!, 'Escape', ESCAPE);
            await fixture.whenStable();

            expect(dropdownItems()).toEqual([]);
            expect(overlayPanes()).toBe(0);
            expect(document.activeElement).toBe(actions);

            await click(fixture, query('.check-legacy-toggle')!);

            expect(filters.isConnected).toBe(false);
            expect(phases(fixture, 'fade').slice(-2)).toEqual(['start null -> void', 'done null -> void']);
        });
    });
});
