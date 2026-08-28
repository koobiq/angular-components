import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EXAMPLE_COMPONENTS, LiveExample } from '@koobiq/docs-examples';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsLiveExampleViewerComponent } from './docs-live-example-viewer';

const EXAMPLE_ID = 'basic-select-example';
const EXAMPLE_SOURCE_PATH = 'docs-content/examples-source/select';

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru))
        }
    };
};

describe(DocsLiveExampleViewerComponent.name, () => {
    let fixture: ComponentFixture<DocsLiveExampleViewerComponent>;
    let httpMock: HttpTestingController;
    let requestFullscreen: jest.Mock<Promise<void>>;
    let exitFullscreen: jest.Mock<Promise<void>>;

    const fullscreenEnabledDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenEnabled');
    const fullscreenElementDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
    const exitFullscreenDescriptor = Object.getOwnPropertyDescriptor(document, 'exitFullscreen');
    const requestFullscreenDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'requestFullscreen');

    const toggle = (): HTMLElement => fixture.nativeElement.querySelector('.docs-live-example__footer [kbq-link]');
    const fullscreenButton = (): HTMLButtonElement =>
        fixture.nativeElement.querySelector('[aria-label="Enter fullscreen"]');
    const setFullscreenElement = (element: Element | null): void => {
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
    };

    beforeEach(async () => {
        requestFullscreen = jest.fn().mockResolvedValue(undefined);
        exitFullscreen = jest.fn().mockResolvedValue(undefined);

        Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
        setFullscreenElement(null);
        Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen });
        Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
            configurable: true,
            value: requestFullscreen
        });

        TestBed.configureTestingModule({
            imports: [DocsLiveExampleViewerComponent],
            providers: [provideDocsLocale(DocsLocale.En), provideHttpClient(), provideHttpClientTesting()]
        });

        fixture = TestBed.createComponent(DocsLiveExampleViewerComponent);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();

        for (const [target, property, descriptor] of [
            [document, 'fullscreenEnabled', fullscreenEnabledDescriptor],
            [document, 'fullscreenElement', fullscreenElementDescriptor],
            [document, 'exitFullscreen', exitFullscreenDescriptor],
            [HTMLElement.prototype, 'requestFullscreen', requestFullscreenDescriptor]
        ] as const) {
            if (descriptor) {
                Object.defineProperty(target, property, descriptor);
            } else {
                Reflect.deleteProperty(target, property);
            }
        }
    });

    it('has no axe violations', async () => {
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    // The toggle used to be announced as a link with no state and no Space activation (A11Y-02).
    it('announces the source-view toggle as a button with its expanded state', () => {
        expect(toggle().getAttribute('role')).toBe('button');
        expect(toggle().getAttribute('tabindex')).toBe('0');
        expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it.each([
        ['click', () => new MouseEvent('click', { bubbles: true })],
        ['Enter', () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })],
        ['Space', () => new KeyboardEvent('keydown', { key: ' ', bubbles: true })]
    ])('toggles the source view on %s', (_name, createEvent) => {
        toggle().dispatchEvent(createEvent());
        fixture.detectChanges();

        expect(toggle().getAttribute('aria-expanded')).toBe('true');
        expect(toggle().textContent?.trim()).toBe('Hide example code');
    });

    it('enters fullscreen mode for the whole viewer', async () => {
        fullscreenButton().click();
        await fixture.whenStable();

        expect(requestFullscreen).toHaveBeenCalledWith({ navigationUI: 'auto' });
    });

    it('updates the fullscreen action when the browser enters or exits fullscreen mode', () => {
        setFullscreenElement(fixture.nativeElement);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        const exitButton: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Exit fullscreen"]');

        expect(exitButton.getAttribute('aria-pressed')).toBe('true');

        setFullscreenElement(null);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        expect(fullscreenButton().getAttribute('aria-pressed')).toBe('false');
    });

    it('exits fullscreen mode from the action button', async () => {
        setFullscreenElement(fixture.nativeElement);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        fixture.nativeElement.querySelector('[aria-label="Exit fullscreen"]').click();
        await fixture.whenStable();

        expect(exitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('does not resolve an example for an unknown key', () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});

        fixture.componentRef.setInput('example', 'not-a-registered-example');
        fixture.detectChanges();

        expect(error).toHaveBeenCalledWith('Could not find example: not-a-registered-example');
        expect(fixture.componentInstance.exampleData).toBeUndefined();
    });

    describe('with a registered example', () => {
        beforeEach(() => {
            EXAMPLE_COMPONENTS[EXAMPLE_ID] = {
                componentName: 'BasicSelectExample',
                selector: 'basic-select-example',
                packagePath: 'select',
                files: ['basic-select-example.ts', 'basic-select-example.html']
            } as LiveExample;

            fixture.componentRef.setInput('example', EXAMPLE_ID);
            fixture.detectChanges();

            httpMock.expectOne(`${EXAMPLE_SOURCE_PATH}/basic-select-example.ts`).flush('export class X {}');
            httpMock.expectOne(`${EXAMPLE_SOURCE_PATH}/basic-select-example.html`).flush('<p></p>');
        });

        afterEach(() => delete EXAMPLE_COMPONENTS[EXAMPLE_ID]);

        it('loads the example source when the key is set through the input', () => {
            expect(fixture.componentInstance.exampleData).toBeDefined();
            expect(fixture.componentInstance.files).toHaveLength(2);
        });

        // `reload()` re-runs the loader for the same key, which used to append to `files` and
        // duplicate every source tab.
        it('reloads the same example without duplicating its source tabs', () => {
            (fixture.componentInstance as unknown as { reload(): void }).reload();
            fixture.detectChanges();

            // The document loader replays its cached responses, so no new request is issued.
            expect(fixture.componentInstance.files).toHaveLength(2);
            expect(fixture.componentInstance.exampleData).toBeDefined();
        });
    });
});
