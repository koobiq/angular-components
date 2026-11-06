import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAlert } from '@koobiq/components/alert';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

const createComponent = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getSlotIcons = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    fixture.debugElement.queryAll(By.css('.kbq-alert__icon > i')).map((el) => el.nativeElement);

describe('triage: alert double icon of the same kind', () => {
    it('DEFECT: two kbq-icon elements both render in the icon slot, only the first is tinted, and nothing warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const fixture = createComponent(TwoIcons);
            const icons = getSlotIcons(fixture);

            expect(icons.length).toBe(2);
            expect(icons[0].classList).toContain('kbq-error');
            expect(icons[1].classList).not.toContain('kbq-error');
            expect(icons[1].classList).toContain('kbq-empty');
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });

    it('DEFECT: two kbq-icon-item elements both render in the icon slot, only the first is tinted, and nothing warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const fixture = createComponent(TwoIconItems);
            const icons = getSlotIcons(fixture);

            expect(icons.length).toBe(2);
            expect(icons[0].classList).toContain('kbq-error');
            expect(icons[1].classList).not.toContain('kbq-error');
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIcon],
    template: `
        <kbq-alert [alertColor]="'error'">
            <i kbq-icon="kbq-circle-info_16"></i>
            <i kbq-icon="kbq-circle-info_16"></i>
            Alert text
        </kbq-alert>
    `
})
class TwoIcons {}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIconItem],
    template: `
        <kbq-alert [alertColor]="'error'">
            <i kbq-icon-item="kbq-circle-info_16"></i>
            <i kbq-icon-item="kbq-circle-info_16"></i>
            Alert text
        </kbq-alert>
    `
})
class TwoIconItems {}
