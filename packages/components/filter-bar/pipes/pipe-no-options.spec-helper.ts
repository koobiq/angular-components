import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, ESCAPE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_CONFIGURATION,
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KbqFilter,
    KbqPipe,
    KbqPipeTemplate
} from '@koobiq/components/filter-bar';
import { axe } from 'jest-axe';
import { BehaviorSubject } from 'rxjs';
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
    const localizedMessage = KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.pipe.noOptions;

    let fixture: ComponentFixture<PipeNoOptionsHost>;
    let overlayContainerElement: HTMLElement;

    const createFixture = () => {
        fixture = config.createFixture();
        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    };

    const render = (template: Partial<KbqPipeTemplate>) => {
        fixture.componentInstance.pipeTemplates = [config.createTemplate(template)];
        fixture.componentInstance.activeFilter = config.createFilter([config.createPipe({ search: true })]);
        fixture.detectChanges();
    };

    const getPipe = () => fixture.debugElement.query(By.css(config.pipeSelector));

    /** Opens the pipe the way `openOnAdd` does, then lets the deferred opening run out. */
    const open = () => {
        (getPipe().componentInstance as KbqBasePipe<unknown>).open();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();
    };

    const getMessage = (): string | undefined =>
        overlayContainerElement.querySelector('.kbq-select-no-options')?.textContent?.trim();

    const getSearch = () => overlayContainerElement.querySelector('.kbq-select__search-container');

    describe('no options', () => {
        beforeEach(createFixture);

        it('should show the localized message when the template has no values', fakeAsync(() => {
            render({ values: [] });
            open();

            expect(getMessage()).toBe(localizedMessage);
        }));

        it('should show the message when the template omits values', fakeAsync(() => {
            render({ values: undefined });
            open();

            expect(getMessage()).toBe(localizedMessage);
        }));

        it('should show noOptionsText from the pipe template', fakeAsync(() => {
            render({ values: [], noOptionsText: 'No tenants available' });
            open();

            expect(getMessage()).toBe('No tenants available');
        }));

        it('should fall back to the locale message when noOptionsText is an empty string', fakeAsync(() => {
            render({ values: [], noOptionsText: '' });
            open();

            expect(getMessage()).toBe(localizedMessage);
        }));

        it('should hide the search field', fakeAsync(() => {
            render({ values: [] });
            open();

            expect(getMessage()).toBe(localizedMessage);
            expect(getSearch()).toBeNull();
        }));

        it('should move the focus to the trigger', fakeAsync(() => {
            const document = TestBed.inject(DOCUMENT);

            render({ values: [] });
            open();

            expect(document.activeElement).toBe(getPipe().nativeElement.querySelector('[kbq-select-matcher]'));
        }));

        it('should close on Escape', fakeAsync(() => {
            const document = TestBed.inject(DOCUMENT);

            render({ values: undefined });
            open();

            expect(getMessage()).toBe(localizedMessage);

            dispatchKeyboardEvent(document.activeElement!, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getMessage()).toBeUndefined();
        }));

        it('should show the options and the search once the template supplies values', fakeAsync(() => {
            render({ values: [] });

            fixture.componentInstance.pipeTemplates = [config.createTemplate({ values: config.values })];
            fixture.detectChanges();
            open();

            expect(getMessage()).toBeUndefined();
            expect(getSearch()).not.toBeNull();
            expect(overlayContainerElement.querySelector('.kbq-option, .kbq-tree-option')).not.toBeNull();
        }));

        it('should replace the message with options when values arrive while the panel is open', fakeAsync(() => {
            render({ values: [] });
            open();

            expect(getMessage()).toBe(localizedMessage);

            fixture.componentInstance.pipeTemplates = [config.createTemplate({ values: config.values })];
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(getMessage()).toBeUndefined();
            expect(overlayContainerElement.querySelector('.kbq-option, .kbq-tree-option')).not.toBeNull();
        }));

        it('should have no axe violations when the no-options message is shown', async () => {
            render({ values: [] });
            (getPipe().componentInstance as KbqBasePipe<unknown>).open();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });
    });

    describe('no options with a custom configuration', () => {
        const customMessage = 'Custom message';

        beforeEach(() => {
            TestBed.overrideProvider(KBQ_FILTER_BAR_CONFIGURATION, {
                useValue: {
                    ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
                    pipe: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.pipe, noOptions: customMessage }
                }
            });
            // Without a locale service `KbqFilterBar` resets its configuration to the default in the
            // constructor, so the supplied configuration would never be read.
            TestBed.overrideProvider(KBQ_LOCALE_SERVICE, {
                useValue: {
                    changes: new BehaviorSubject<string>('custom'),
                    getParams: () => KBQ_FILTER_BAR_DEFAULT_CONFIGURATION
                }
            });

            createFixture();
        });

        it('should take the message from the custom configuration', fakeAsync(() => {
            render({ values: [] });
            open();

            expect(getMessage()).toBe(customMessage);
        }));
    });

    describe('no options with a configuration that omits pipe.noOptions', () => {
        // Simulates a runtime configuration that predates the `noOptions` key — the third fallback
        // operand in `noOptionsMessage` must cover this.
        const configWithoutNoOptions = {
            ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
            pipe: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.pipe, noOptions: undefined }
        } as unknown as typeof KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;

        beforeEach(() => {
            TestBed.overrideProvider(KBQ_FILTER_BAR_CONFIGURATION, { useValue: configWithoutNoOptions });
            TestBed.overrideProvider(KBQ_LOCALE_SERVICE, {
                useValue: {
                    changes: new BehaviorSubject<string>('custom'),
                    getParams: () => configWithoutNoOptions
                }
            });

            createFixture();
        });

        it('should fall back to the default configuration message', fakeAsync(() => {
            render({ values: [] });
            open();

            expect(getMessage()).toBe(localizedMessage);
        }));
    });
};
