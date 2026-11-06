import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-one-percent-threshold',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar kbqScrollbarMode="always" style="overflow-x: auto; overflow-y: auto">content</kbq-scrollbar>
    `
})
class TestApp {
    readonly host = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
}

describe('triage: the 99 % threshold for drawing a bar', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const render = async (scrollHeight: number): Promise<ComponentFixture<TestApp>> => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.autoDetectChanges();

        const host = fixture.componentInstance.host().nativeElement;

        for (const [key, value] of Object.entries({
            clientHeight: 1000,
            scrollHeight,
            clientWidth: 100,
            scrollWidth: 100
        })) {
            Object.defineProperty(host, key, { configurable: true, value });
        }

        await vi.advanceTimersByTimeAsync(16);
        fixture.detectChanges();

        return fixture;
    };

    it('control: an overflow of 11 px on a 1000 px viewport draws the vertical bar', async () => {
        const fixture = await render(1011);

        expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_vertical')).not.toBeNull();
    });

    it('DEFECT: an overflow of 10 px on a 1000 px viewport draws no bar while the native scrollbar is hidden', async () => {
        const fixture = await render(1010);
        const host = fixture.componentInstance.host().nativeElement;

        expect(fixture.nativeElement.querySelector('kbq-scrollbar-track')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_vertical')).toBeNull();
        expect(host.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
    });
});
