import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Directive, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import {
    KBQ_OVERFLOW_SHADOW_SOURCE,
    KbqOverflowShadowBottom,
    KbqOverflowShadowContainer,
    KbqOverflowShadowSource,
    KbqOverflowShadowTop
} from './overflow-shadow';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const setScrollMetrics = (
    el: HTMLElement,
    metrics: { scrollTop?: number; clientHeight?: number; scrollHeight?: number }
): void => {
    if (metrics.scrollTop !== undefined) {
        Object.defineProperty(el, 'scrollTop', { configurable: true, value: metrics.scrollTop });
    }

    if (metrics.clientHeight !== undefined) {
        Object.defineProperty(el, 'clientHeight', { configurable: true, value: metrics.clientHeight });
    }

    if (metrics.scrollHeight !== undefined) {
        Object.defineProperty(el, 'scrollHeight', { configurable: true, value: metrics.scrollHeight });
    }
};

/**
 * Minimal `SharedResizeObserver` stand-in: records observed elements and lets a test emit a
 * resize for a specific element to trigger the directive's `checkOverflow()`.
 */
class MockSharedResizeObserver {
    readonly observed: Element[] = [];
    private readonly subjects = new Map<Element, Subject<ResizeObserverEntry[]>>();

    observe(target: Element): Observable<ResizeObserverEntry[]> {
        this.observed.push(target);

        let subject = this.subjects.get(target);

        if (!subject) {
            subject = new Subject<ResizeObserverEntry[]>();
            this.subjects.set(target, subject);
        }

        return subject.asObservable();
    }

    emit(target: Element): void {
        this.subjects.get(target)?.next([]);
    }
}

@Component({
    selector: 'test-overflow-shadow-host',
    imports: [KbqOverflowShadowContainer, KbqOverflowShadowTop, KbqOverflowShadowBottom],
    template: `
        <header data-testid="header" [kbqOverflowShadowTop]="container">header</header>
        <div #container="kbqOverflowShadowContainer" data-testid="body" kbqOverflowShadowContainer>body</div>
        <footer data-testid="footer" [kbqOverflowShadowBottom]="container">footer</footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

@Component({
    selector: 'test-overflow-shadow-custom-shadow-host',
    imports: [KbqOverflowShadowContainer, KbqOverflowShadowTop, KbqOverflowShadowBottom],
    template: `
        <header data-testid="header" [kbqOverflowShadowTop]="container" [shadow]="'10px 10px red'">header</header>
        <div #container="kbqOverflowShadowContainer" data-testid="body" kbqOverflowShadowContainer>body</div>
        <footer data-testid="footer" [kbqOverflowShadowBottom]="container" [shadow]="'20px 20px blue'">footer</footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostCustomShadowComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

@Component({
    selector: 'test-overflow-shadow-debounce-host',
    imports: [KbqOverflowShadowContainer],
    template: `
        <div #container="kbqOverflowShadowContainer" data-testid="body" kbqOverflowShadowContainer [debounce]="50">
            body
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostDebounceComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

@Component({
    selector: 'test-overflow-shadow-undefined-ref-host',
    imports: [KbqOverflowShadowContainer, KbqOverflowShadowTop],
    template: `
        <header data-testid="bound" [kbqOverflowShadowTop]="container">bound</header>
        <header data-testid="unbound" [kbqOverflowShadowTop]="undefined">unbound</header>
        <div #container="kbqOverflowShadowContainer" data-testid="body" kbqOverflowShadowContainer>body</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostUndefinedRefComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

class MockOverflowShadowSource implements KbqOverflowShadowSource {
    readonly onScroll = new Subject<unknown>();
    readonly element: HTMLDivElement = document.createElement('div');

    getScrollElement(): HTMLElement {
        return this.element;
    }
}

const externalSource = new MockOverflowShadowSource();

@Directive({
    selector: '[testProvideExternalSource]',
    providers: [{ provide: KBQ_OVERFLOW_SHADOW_SOURCE, useFactory: () => externalSource }]
})
class TestProvideExternalSourceDirective {}

@Component({
    selector: 'test-overflow-shadow-external-source-host',
    imports: [KbqOverflowShadowContainer, TestProvideExternalSourceDirective],
    template: `
        <div testProvideExternalSource kbqOverflowShadowContainer>body</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostExternalSourceComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

class MockNullSource implements KbqOverflowShadowSource {
    readonly onScroll = new Subject<unknown>();

    getScrollElement(): HTMLElement | null {
        return null;
    }
}

const nullSource = new MockNullSource();

@Directive({
    selector: '[testProvideNullSource]',
    providers: [{ provide: KBQ_OVERFLOW_SHADOW_SOURCE, useFactory: () => nullSource }]
})
class TestProvideNullSourceDirective {}

@Component({
    selector: 'test-overflow-shadow-null-source-host',
    imports: [KbqOverflowShadowContainer, TestProvideNullSourceDirective],
    template: `
        <div testProvideNullSource kbqOverflowShadowContainer>body</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostNullSourceComponent {
    readonly container = viewChild.required(KbqOverflowShadowContainer);
}

describe(KbqOverflowShadowContainer.name, () => {
    describe('native scroll source', () => {
        it('should set top=true when scrollTop > 0', () => {
            const fixture = createComponent(TestHostComponent);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            setScrollMetrics(body, { scrollTop: 10, clientHeight: 100, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: true, bottom: true });
        });

        it('should set bottom=false when scrolled to the very bottom', () => {
            const fixture = createComponent(TestHostComponent);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            setScrollMetrics(body, { scrollTop: 400, clientHeight: 100, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: true, bottom: false });
        });

        it('should set both false when content fits without overflow', () => {
            const fixture = createComponent(TestHostComponent);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            setScrollMetrics(body, { scrollTop: 0, clientHeight: 500, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: false, bottom: false });
        });

        it('should not set bottom=true for a sub-pixel gap at the very bottom (rounded)', () => {
            const fixture = createComponent(TestHostComponent);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            // Fractional scroll metrics (HiDPI / browser zoom) at the very bottom: scrollTop + clientHeight
            // is a hair below scrollHeight. Without rounding the bottom shadow would stay stuck on.
            setScrollMetrics(body, { scrollTop: 399.6, clientHeight: 100, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: true, bottom: false });
        });
    });

    describe('debounce', () => {
        it('should delay overflow updates by the [debounce] window', fakeAsync(() => {
            TestBed.configureTestingModule({ imports: [TestHostDebounceComponent] });
            const fixture = TestBed.createComponent(TestHostDebounceComponent);

            fixture.detectChanges();
            flush();

            const container = fixture.componentInstance.container();
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            // Settle a known baseline (content overflows below, not scrolled yet).
            setScrollMetrics(body, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            tick(50);
            expect(container.overflow()).toEqual({ top: false, bottom: true });

            // Scroll down: the change must not be visible before the debounce window elapses.
            setScrollMetrics(body, { scrollTop: 10, clientHeight: 100, scrollHeight: 500 });
            body.dispatchEvent(new Event('scroll'));
            tick(20);
            expect(container.overflow()).toEqual({ top: false, bottom: true });

            tick(40);
            expect(container.overflow()).toEqual({ top: true, bottom: true });

            flush();
        }));
    });

    describe('checkOverflow()', () => {
        it('should be callable without a scroll event', () => {
            const fixture = createComponent(TestHostComponent);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            setScrollMetrics(body, { scrollTop: 50, clientHeight: 100, scrollHeight: 500 });
            fixture.componentInstance.container().checkOverflow();
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: true, bottom: true });
        });
    });

    describe('SharedResizeObserver', () => {
        it('should re-check overflow when the scroll source is resized', () => {
            const resizeObserver = new MockSharedResizeObserver();
            const fixture = createComponent(TestHostComponent, [
                { provide: SharedResizeObserver, useValue: resizeObserver }
            ]);
            const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

            expect(resizeObserver.observed).toContain(body);

            setScrollMetrics(body, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            resizeObserver.emit(body);
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: false, bottom: true });
        });
    });

    describe('external KBQ_OVERFLOW_SHADOW_SOURCE', () => {
        beforeEach(() => {
            setScrollMetrics(externalSource.element, { scrollTop: 0, clientHeight: 0, scrollHeight: 0 });
        });

        it('should use the external source instead of native scroll', () => {
            const fixture = createComponent(TestHostExternalSourceComponent);

            setScrollMetrics(externalSource.element, { scrollTop: 25, clientHeight: 100, scrollHeight: 500 });
            externalSource.onScroll.next(undefined);
            fixture.detectChanges();

            expect(fixture.componentInstance.container().overflow()).toEqual({ top: true, bottom: true });
        });

        it('should observe the external source element for resize', () => {
            const resizeObserver = new MockSharedResizeObserver();

            createComponent(TestHostExternalSourceComponent, [
                { provide: SharedResizeObserver, useValue: resizeObserver }
            ]);

            expect(resizeObserver.observed).toContain(externalSource.element);
        });
    });

    describe('source without a scroll element', () => {
        it('should leave overflow untouched when getScrollElement() returns null', () => {
            const fixture = createComponent(TestHostNullSourceComponent);
            const container = fixture.componentInstance.container();

            expect(() => container.checkOverflow()).not.toThrow();
            expect(container.overflow()).toEqual({ top: false, bottom: false });
        });
    });
});

describe(KbqOverflowShadowTop.name, () => {
    it('should set box-shadow to the default token when top=true', () => {
        const fixture = createComponent(TestHostComponent);
        const header = fixture.debugElement.nativeElement.querySelector('[data-testid="header"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: true, bottom: false });
        fixture.detectChanges();

        expect(header.style.boxShadow).toBe('var(--kbq-shadow-overflow-normal-bottom)');
    });

    it('should clear box-shadow when top=false', () => {
        const fixture = createComponent(TestHostComponent);
        const header = fixture.debugElement.nativeElement.querySelector('[data-testid="header"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: true, bottom: false });
        fixture.detectChanges();
        fixture.componentInstance.container().overflow.set({ top: false, bottom: false });
        fixture.detectChanges();

        expect(header.style.boxShadow).toBe('');
    });

    it('should use a custom [shadow] value', () => {
        const fixture = createComponent(TestHostCustomShadowComponent);
        const header = fixture.debugElement.nativeElement.querySelector('[data-testid="header"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: true, bottom: false });
        fixture.detectChanges();

        expect(header.style.boxShadow).toBe('10px 10px red');
    });

    it('should not set box-shadow when the container ref is undefined', () => {
        // Mirrors the notification-center case where only the first sub-header passes the container
        // ref (`$first ? nc : undefined`); the rest must stay shadowless even when top=true.
        const fixture = createComponent(TestHostUndefinedRefComponent);
        const bound = fixture.debugElement.nativeElement.querySelector('[data-testid="bound"]') as HTMLElement;
        const unbound = fixture.debugElement.nativeElement.querySelector('[data-testid="unbound"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: true, bottom: false });
        fixture.detectChanges();

        expect(bound.style.boxShadow).toBe('var(--kbq-shadow-overflow-normal-bottom)');
        expect(unbound.style.boxShadow).toBe('');
    });
});

describe(KbqOverflowShadowBottom.name, () => {
    it('should set box-shadow to the default token when bottom=true', () => {
        const fixture = createComponent(TestHostComponent);
        const footer = fixture.debugElement.nativeElement.querySelector('[data-testid="footer"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: false, bottom: true });
        fixture.detectChanges();

        expect(footer.style.boxShadow).toBe('var(--kbq-shadow-overflow-normal-top)');
    });

    it('should use a custom [shadow] value', () => {
        const fixture = createComponent(TestHostCustomShadowComponent);
        const footer = fixture.debugElement.nativeElement.querySelector('[data-testid="footer"]') as HTMLElement;

        fixture.componentInstance.container().overflow.set({ top: false, bottom: true });
        fixture.detectChanges();

        expect(footer.style.boxShadow).toBe('20px 20px blue');
    });
});
