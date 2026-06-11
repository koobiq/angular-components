import { ChangeDetectionStrategy, Component, Directive, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
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

    describe('ResizeObserver', () => {
        it('should re-check overflow when the scroll source is resized', () => {
            const observed: Element[] = [];
            const callbacks: ResizeObserverCallback[] = [];

            class MockResizeObserver {
                constructor(callback: ResizeObserverCallback) {
                    callbacks.push(callback);
                }
                observe(target: Element): void {
                    observed.push(target);
                }
                unobserve(): void {}
                disconnect(): void {}
            }

            const original = (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;

            (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
                MockResizeObserver as unknown as typeof ResizeObserver;

            try {
                const fixture = createComponent(TestHostComponent);
                const body = fixture.debugElement.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

                expect(observed).toContain(body);

                setScrollMetrics(body, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
                callbacks[callbacks.length - 1]([], {} as ResizeObserver);
                fixture.detectChanges();

                expect(fixture.componentInstance.container().overflow()).toEqual({ top: false, bottom: true });
            } finally {
                (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = original;
            }
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
