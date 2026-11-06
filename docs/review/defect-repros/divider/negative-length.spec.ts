import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDivider } from '@koobiq/components/divider';

const createFixture = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const dividerDebugOf = (fixture: ComponentFixture<unknown>) => fixture.debugElement.query(By.css('kbq-divider'));

describe('KbqDivider triage: negative length', () => {
    it('DEFECT: a negative length passes the parser and is silently dropped by CSSOM, so the divider falls back to its layout length', () => {
        const debug = dividerDebugOf(createFixture(NegativeHorizontalDivider));
        const divider: HTMLElement = debug.nativeElement;

        expect((debug.componentInstance as KbqDivider).length()).toBe(-5);
        expect(divider.style.width).toBe('');
        expect(divider.style.height).toBe('');
    });

    it('DEFECT: a negative vertical length is dropped the same way', () => {
        const debug = dividerDebugOf(createFixture(NegativeVerticalDivider));

        expect((debug.componentInstance as KbqDivider).length()).toBe(-5);
        expect((debug.nativeElement as HTMLElement).style.height).toBe('');
    });

    it('DEFECT: switching length from 16 to a negative value keeps the stale 16px width', () => {
        const fixture = createFixture(SwitchableLengthDivider);
        const debug = dividerDebugOf(fixture);
        const divider: HTMLElement = debug.nativeElement;

        expect(divider.style.width).toBe('16px');

        fixture.componentInstance.length.set(-5);
        fixture.detectChanges();

        expect((debug.componentInstance as KbqDivider).length()).toBe(-5);
        expect(divider.style.width).toBe('16px');

        // An unparsable value, by contrast, clears the inline width.
        fixture.componentInstance.length.set('tall');
        fixture.detectChanges();

        expect(divider.style.width).toBe('');
    });
});

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider length="-5" />
    `
})
class NegativeHorizontalDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider length="-5" vertical />
    `
})
class NegativeVerticalDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider [length]="length()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SwitchableLengthDivider {
    readonly length = signal<number | string>(16);
}
