import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, ESCAPE } from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
    KbqFilter,
    KbqPipe,
    KbqPipeTemplate
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';

/** Host contract shared by the `TestComponent` of every select-family pipe spec. */
export interface PipeNoOptionsHost {
    activeFilter: KbqFilter | null;
    pipeTemplates: KbqPipeTemplate[];
}

/** Configuration passed by a select-family pipe spec to register the shared "no options" suite. */
export interface PipeNoOptionsConfig {
    /** Tag of the pipe component, e.g. `'kbq-pipe-select'`. */
    pipeSelector: string;
    /** Spec factory that stamps the correct pipe `type`/`id` onto the given overrides. */
    createPipe: (overrides: Partial<KbqPipe>) => KbqPipe;
    /** Spec factory that wraps pipes into a filter. */
    createFilter: (pipes: KbqPipe[]) => KbqFilter;
    /** Template the pipes of `createPipe` resolve to, with the given overrides. */
    createTemplate: (overrides: Partial<KbqPipeTemplate>) => KbqPipeTemplate;
    /** Non-empty `values` for this pipe type. */
    values: unknown[];
    /** Creates the fixture, after the spec's own `TestBed.configureTestingModule` has run. */
    createFixture: () => ComponentFixture<PipeNoOptionsHost>;
}

/**
 * Registers the shared "no options" describe block: a select-family pipe whose template has no values shows
 * a message in place of the list, hides its search field and takes the focus onto its trigger.
 */
export const registerNoOptionsTests = (config: PipeNoOptionsConfig): void => {
    describe('no options', () => {
        const localizedMessage = KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.pipe.noOptions;

        let fixture: ComponentFixture<PipeNoOptionsHost>;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            fixture = config.createFixture();
            overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        });

        afterEach(() => vi.useRealTimers());

        const render = (template: Partial<KbqPipeTemplate>) => {
            fixture.componentInstance.pipeTemplates = [config.createTemplate(template)];
            fixture.componentInstance.activeFilter = config.createFilter([config.createPipe({ search: true })]);
            fixture.detectChanges();
        };

        const getPipe = () => fixture.debugElement.query(By.css(config.pipeSelector));

        /** Opens the pipe the way `openOnAdd` does, then lets the deferred opening run out. */
        const open = async () => {
            (getPipe().componentInstance as KbqBasePipe<unknown>).open();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();
        };

        const getMessage = (): string | undefined =>
            overlayContainerElement.querySelector('.kbq-select-no-options')?.textContent?.trim();

        const getSearch = () => overlayContainerElement.querySelector('.kbq-select__search-container');

        it('should show the localized message when the template has no values', async () => {
            vi.useFakeTimers();

            render({ values: [] });
            await open();

            expect(getMessage()).toBe(localizedMessage);
        });

        it('should show the message when the template omits values', async () => {
            vi.useFakeTimers();

            render({ values: undefined });
            await open();

            expect(getMessage()).toBe(localizedMessage);
        });

        it('should show noOptionsText from the pipe template', async () => {
            vi.useFakeTimers();

            render({ values: [], noOptionsText: 'No tenants available' });
            await open();

            expect(getMessage()).toBe('No tenants available');
        });

        it('should hide the search field', async () => {
            vi.useFakeTimers();

            render({ values: [] });
            await open();

            expect(getMessage()).toBe(localizedMessage);
            expect(getSearch()).toBeNull();
        });

        it('should move the focus to the trigger', async () => {
            vi.useFakeTimers();

            render({ values: [] });
            await open();

            expect(document.activeElement).toBe(getPipe().nativeElement.querySelector('[kbq-select-matcher]'));
        });

        it('should close on Escape', async () => {
            vi.useFakeTimers();

            render({ values: undefined });
            await open();

            expect(getMessage()).toBe(localizedMessage);

            dispatchKeyboardEvent(document.activeElement!, 'keydown', ESCAPE);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(getMessage()).toBeUndefined();
        });

        it('should show the options and the search once the template supplies values', async () => {
            vi.useFakeTimers();

            render({ values: [] });

            fixture.componentInstance.pipeTemplates = [config.createTemplate({ values: config.values })];
            fixture.detectChanges();
            await open();

            expect(getMessage()).toBeUndefined();
            expect(getSearch()).not.toBeNull();
            expect(overlayContainerElement.querySelector('.kbq-option, .kbq-tree-option')).not.toBeNull();
        });
    });
};
