import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DOCS_MARKDOWN_HEADING_CLASSES } from '../live-example/markdown-content';
import { DocsAnchorsComponent } from './anchors.component';

describe('DocsAnchorsComponent', () => {
    const createComponent = () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [DocsAnchorsComponent],
            providers: [provideRouter([])]
        });

        return TestBed.createComponent(DocsAnchorsComponent);
    };

    describe('scroll-container guard (BUG-07)', () => {
        it('does not throw from setScrollPosition when docs-component-viewer is absent', () => {
            const fixture = createComponent();

            fixture.componentRef.setInput('headerSelectors', '.docs-header-link');

            // No <docs-component-viewer> exists in the test DOM, so the scroll-container query
            // returns null. Before the guard this threw "Cannot read properties of null".
            expect(() => fixture.componentInstance.setScrollPosition()).not.toThrow();
        });
    });

    // Taken as a path, a query in it would be encoded into the last segment and lead nowhere.
    describe('links', () => {
        // A kept member would take a reload of the page back to it rather than to the heading.
        it('lead to the heading on the current path, keeping the query but the member it selects', async () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [DocsAnchorsComponent],
                providers: [provideRouter([{ path: '**', children: [] }])]
            });

            await TestBed.inject(Router).navigateByUrl('/en/components/alert/api?filter=inputs&member=KbqAlert-title');

            const heading = document.createElement('h3');

            heading.id = 'KbqAlert';
            heading.className = 'docs-header-link kbq-markdown__h3';
            // jsdom lays nothing out and so implements no `innerText`, which the anchors name a heading by.
            heading.innerText = 'KbqAlert';
            document.body.appendChild(heading);

            try {
                const fixture = TestBed.createComponent(DocsAnchorsComponent);

                fixture.componentRef.setInput('headerSelectors', '.docs-header-link');
                fixture.componentInstance.setScrollPosition();

                expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe(
                    '/en/components/alert/api?filter=inputs#KbqAlert'
                );
            } finally {
                heading.remove();
            }
        });
    });

    describe('heading level mapping', () => {
        it('derives the anchor level from the shared markdown heading classes', () => {
            const component = createComponent().componentInstance as unknown as {
                getLevel(classList: DOMTokenList): number;
            };

            DOCS_MARKDOWN_HEADING_CLASSES.forEach((className, level) => {
                const element = document.createElement('div');

                element.className = className;

                expect(component.getLevel(element.classList)).toBe(level);
            });
        });
    });
});
