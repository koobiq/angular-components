import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

            fixture.componentInstance.headerSelectors = '.docs-header-link';
            fixture.componentInstance.anchors = [];

            // No <docs-component-viewer> exists in the test DOM, so the scroll-container query
            // returns null. Before the guard this threw "Cannot read properties of null".
            expect(() => fixture.componentInstance.setScrollPosition()).not.toThrow();
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
