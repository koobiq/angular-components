import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-selector-matches-track',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar kbqScrollbarMode="always" style="overflow-x: auto; overflow-y: auto">
            <div class="consumer-target">target</div>
        </kbq-scrollbar>
    `
})
class TestApp {
    readonly scrollbar = viewChild.required(KbqScrollbar);
    readonly host = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
}

const setOffset = (el: Element, offsetTop: number): void => {
    Object.defineProperty(el, 'offsetTop', { configurable: true, value: offsetTop });
    Object.defineProperty(el, 'offsetLeft', { configurable: true, value: 0 });
    Object.defineProperty(el, 'offsetParent', { configurable: true, value: null });
};

describe('triage: a selector passed to scrollToElement is matched inside the track', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const setup = async (): Promise<{ fixture: ComponentFixture<TestApp>; scrollTo: ReturnType<typeof vi.fn> }> => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.autoDetectChanges();

        const host = fixture.componentInstance.host().nativeElement;

        for (const [key, value] of Object.entries({
            clientHeight: 100,
            scrollHeight: 500,
            clientWidth: 100,
            scrollWidth: 100
        })) {
            Object.defineProperty(host, key, { configurable: true, value });
        }

        await vi.advanceTimersByTimeAsync(16);
        fixture.detectChanges();

        const scrollable = fixture.debugElement.query(By.directive(KbqScrollbar)).injector.get(CdkScrollable);
        const scrollTo = vi.spyOn(scrollable, 'scrollTo').mockImplementation(() => {});

        return { fixture, scrollTo: scrollTo as unknown as ReturnType<typeof vi.fn> };
    };

    it('DEFECT: scrollToElement("div") resolves to the drawn vertical bar, not to the consumer content', async () => {
        const { fixture, scrollTo } = await setup();
        const root: HTMLElement = fixture.nativeElement;
        const bar = root.querySelector('.kbq-scrollbar-track__bar_vertical')!;
        const wrapper = root.querySelector('.kbq-scrollbar__content')!;
        const consumer = root.querySelector('.consumer-target')!;

        expect(bar).not.toBeNull();

        setOffset(bar, 11);
        setOffset(wrapper, 22);
        setOffset(consumer, 200);

        fixture.componentInstance.scrollbar().scrollToElement('div');

        expect(scrollTo).toHaveBeenCalledWith({ top: 11, left: 0, behavior: undefined });
    });
});
