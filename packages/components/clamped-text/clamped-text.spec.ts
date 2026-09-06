import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Injectable, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent } from '@koobiq/components/core';
import { axe } from 'jest-axe';
import { Observable, Subject } from 'rxjs';
import { KbqClampedText } from './clamped-text';

const AXE_TIMEOUT = 15000;
const text = Array.from({ length: 100 }, (_, index) => `Text ${index}`).join(' ');

/**
 * Delivers resize entries only when the test asks for one, so the window between first paint and
 * the first measurement stays observable.
 */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    private readonly changes = new Subject<ResizeObserverEntry[]>();

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }

    emit(): void {
        this.changes.next([]);
    }
}

/** jsdom performs no layout, so the row count the component measures has to be supplied. */
const mockRenderedRows = (rows: number): void => {
    const rects = Object.assign(
        Array.from({ length: rows }, (_, index) => ({ top: index * 20 })),
        { item: () => null }
    ) as unknown as DOMRectList;

    jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(rects);
};

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

/** Delivers one resize entry — the only thing that makes the component measure — and lets it land. */
const measure = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    (TestBed.inject(SharedResizeObserver) as unknown as MockResizeObserver).emit();

    // The measurement is debounced through a timer scheduled outside the Angular zone, so
    // `whenStable()` on its own does not wait for it.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
};

/** Renders the component, delivers one measurement and waits for it to land. */
const createMeasuredComponent = async <T>(component: Type<T>): Promise<ComponentFixture<T>> => {
    const fixture = createComponent(component);

    await fixture.whenStable();
    await measure(fixture);

    return fixture;
};

const getContent = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('.kbq-clamped-text__content');

const getToggle = (fixture: ComponentFixture<unknown>): HTMLElement | null =>
    fixture.nativeElement.querySelector('.kbq-clamped-text__toggle');

/** The toggle, for the cases that have already established it is rendered. */
const requireToggle = (fixture: ComponentFixture<unknown>): HTMLElement => {
    const toggle = getToggle(fixture);

    if (!toggle) throw new Error('the toggle is not rendered');

    return toggle;
};

const isCollapsed = (fixture: ComponentFixture<unknown>): boolean =>
    getContent(fixture).classList.contains('kbq-clamped-text__content_collapsed');

@Component({
    selector: 'clamped-text-test',
    imports: [KbqClampedText],
    template: `
        <div style="max-width: 1000px; width: 1000px; overflow: auto; min-width: 150px;">
            <kbq-clamped-text
                [rows]="rows()"
                [scrollOnCollapse]="scrollOnCollapse()"
                [isCollapsed]="isCollapsed()"
                (isCollapsedChange)="onCollapseChanged($event)"
            >
                {{ text }}
            </kbq-clamped-text>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ClampedTextTest {
    protected readonly text = text;

    readonly isCollapsed = signal<boolean | undefined>(undefined);
    readonly rows = signal(5);
    readonly scrollOnCollapse = signal(true);

    onCollapseChanged(collapsed: boolean | undefined): void {
        this.isCollapsed.set(collapsed);
    }
}

@Component({
    selector: 'clamped-text-initially-expanded',
    imports: [KbqClampedText],
    template: `
        <kbq-clamped-text [isCollapsed]="false">
            {{ text }}
        </kbq-clamped-text>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ClampedTextInitiallyExpanded {
    protected readonly text = text;
}

describe('KbqClampedText', () => {
    afterEach(() => jest.restoreAllMocks());

    describe('when the content fits', () => {
        beforeEach(() => mockRenderedRows(3));

        it('should stay expanded when content does not exceed rows', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            expect(isCollapsed(fixture)).toBe(false);
        });

        it('should not render the toggle', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            expect(getToggle(fixture)).toBeNull();
        });
    });

    describe('when the content exceeds rows', () => {
        beforeEach(() => mockRenderedRows(20));

        it('should collapse and render the toggle', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            expect(isCollapsed(fixture)).toBe(true);
            expect(getToggle(fixture)).not.toBeNull();
        });

        it('should keep the content clamped and the toggle hidden before the first measurement', async () => {
            const fixture = createComponent(ClampedTextTest);

            await fixture.whenStable();

            expect(isCollapsed(fixture)).toBe(true);
            expect(getToggle(fixture)).toBeNull();
        });

        it('should carry the row count as a custom property the collapsed class consumes', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            expect(getContent(fixture).style.getPropertyValue('--kbq-clamped-text-line-clamp')).toBe('5');
            expect(getContent(fixture).style.getPropertyValue('-webkit-line-clamp')).toBe('');
        });

        it('should remain expanded when isCollapsed=false is set initially', async () => {
            const fixture = await createMeasuredComponent(ClampedTextInitiallyExpanded);

            expect(isCollapsed(fixture)).toBe(false);
            expect(requireToggle(fixture).getAttribute('aria-expanded')).toBe('true');
        });

        it('should treat rows as the clamping threshold', async () => {
            const fixture = createComponent(ClampedTextTest);

            fixture.componentInstance.rows.set(19);
            await fixture.whenStable();
            await measure(fixture);

            expect(getToggle(fixture)).toBeNull();
            expect(isCollapsed(fixture)).toBe(false);
        });

        it('should flip the class and aria-expanded when the toggle is clicked', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            expect(requireToggle(fixture).getAttribute('aria-expanded')).toBe('false');

            requireToggle(fixture).click();
            await fixture.whenStable();

            expect(isCollapsed(fixture)).toBe(false);
            expect(requireToggle(fixture).getAttribute('aria-expanded')).toBe('true');
        });

        it('should keep the expanded state when a resize arrives right after a toggle', async () => {
            const fixture = await createMeasuredComponent(ClampedTextTest);

            requireToggle(fixture).click();
            await fixture.whenStable();

            await measure(fixture);

            expect(isCollapsed(fixture)).toBe(false);
        });

        describe('disclosure semantics', () => {
            it('should own role, tabindex and an aria-controls that resolves', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);
                const toggle = requireToggle(fixture);

                expect(toggle.getAttribute('role')).toBe('button');
                expect(toggle.getAttribute('tabindex')).toBe('0');
                expect(fixture.nativeElement.querySelector(`#${toggle.getAttribute('aria-controls')}`)).toBe(
                    getContent(fixture)
                );
            });

            it('should not publish aria-expanded on the role-less host', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);

                expect(fixture.nativeElement.querySelector('kbq-clamped-text').hasAttribute('aria-expanded')).toBe(
                    false
                );
            });

            it.each<[string, number, string]>([
                ['space', SPACE, ' '],
                ['enter', ENTER, 'Enter']
            ])('should toggle on %s and prevent the default action', async (_key, keyCode, key) => {
                const fixture = await createMeasuredComponent(ClampedTextTest);
                const event = dispatchKeyboardEvent(requireToggle(fixture), 'keydown', keyCode, undefined, key);

                await fixture.whenStable();

                expect(isCollapsed(fixture)).toBe(false);
                expect(event.defaultPrevented).toBe(true);
            });

            it(
                'should have no axe violations in both states',
                async () => {
                    const fixture = await createMeasuredComponent(ClampedTextTest);

                    expect(await axe(fixture.nativeElement)).toHaveNoViolations();

                    requireToggle(fixture).click();
                    await fixture.whenStable();

                    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
                },
                AXE_TIMEOUT
            );
        });

        describe('isCollapsedChange', () => {
            it('should not emit for the initial measurement', async () => {
                const fixture = createComponent(ClampedTextTest);
                const spy = jest.spyOn(fixture.componentInstance, 'onCollapseChanged');

                await fixture.whenStable();
                await measure(fixture);

                expect(spy).not.toHaveBeenCalled();
            });

            it('should emit when the user operates the toggle', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);
                const spy = jest.spyOn(fixture.componentInstance, 'onCollapseChanged');

                requireToggle(fixture).click();
                await fixture.whenStable();

                expect(spy).toHaveBeenCalledWith(false);
            });

            it('should not echo a value the parent wrote itself', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);
                const spy = jest.spyOn(fixture.componentInstance, 'onCollapseChanged');

                fixture.componentInstance.isCollapsed.set(false);
                await fixture.whenStable();

                expect(spy).not.toHaveBeenCalled();
                expect(isCollapsed(fixture)).toBe(false);
            });
        });

        describe('scrollOnCollapse', () => {
            const collapseThroughToggle = async (fixture: ComponentFixture<ClampedTextTest>) => {
                requireToggle(fixture).click();
                await fixture.whenStable();
                requireToggle(fixture).click();
                await fixture.whenStable();
            };

            it('should scroll the component into view when collapsing', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);
                const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation();

                await collapseThroughToggle(fixture);

                expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
            });

            it('should stay put when disabled', async () => {
                const fixture = await createMeasuredComponent(ClampedTextTest);

                fixture.componentInstance.scrollOnCollapse.set(false);
                await fixture.whenStable();

                const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation();

                await collapseThroughToggle(fixture);

                expect(scrollIntoView).not.toHaveBeenCalled();
            });
        });
    });
});
