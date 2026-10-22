import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KBQ_SCROLLBAR_OPTIONS, KbqScrollbar, KbqScrollbarMode } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-undefined-mode',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar [kbqScrollbarMode]="mode">content</kbq-scrollbar>
    `
})
class TestApp {
    mode: KbqScrollbarMode = 'hover';
}

const render = async (mode: unknown): Promise<ComponentFixture<TestApp>> => {
    TestBed.configureTestingModule({ imports: [TestApp] });
    const fixture = TestBed.createComponent(TestApp);

    fixture.componentInstance.mode = mode as KbqScrollbarMode;
    fixture.autoDetectChanges();
    await fixture.whenStable();

    return fixture;
};

const getTrack = (fixture: ComponentFixture<TestApp>): HTMLElement =>
    fixture.nativeElement.querySelector('kbq-scrollbar-track');

describe('triage: kbqScrollbarMode bound to undefined or null', () => {
    it('control: an explicit "hover" binding gives the track the hover class', async () => {
        const fixture = await render('hover');

        expect(getTrack(fixture).classList).toContain('kbq-scrollbar-track_hover');
    });

    it.each([undefined, null])(
        'DEFECT: [kbqScrollbarMode]="%s" draws a track without the hover class, like "always", instead of the default "hover"',
        async (value) => {
            const fixture = await render(value);
            const host: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar');

            expect(TestBed.inject(KBQ_SCROLLBAR_OPTIONS).mode).toBe('hover');
            expect(getTrack(fixture)).not.toBeNull();
            expect(getTrack(fixture).classList).not.toContain('kbq-scrollbar-track_hover');
            expect(host.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
        }
    );
});
