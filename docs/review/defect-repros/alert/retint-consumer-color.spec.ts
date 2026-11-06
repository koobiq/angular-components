import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAlert, KbqAlertColors } from '@koobiq/components/alert';
import { KbqComponentColors, KbqEnumValues } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

const createComponent = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getIcon = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.css('.kbq-alert__icon i')).nativeElement;

describe('triage: alert re-tint overwrites a consumer color', () => {
    it('DEFECT: a consumer [color] set later on the tinted icon, equal to the tint, is overwritten on the next alertColor change', async () => {
        const fixture = createComponent(LateColorOnSameIcon);

        expect(getIcon(fixture).classList).toContain('kbq-error');

        fixture.componentInstance.iconColor.set(KbqComponentColors.Error);
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.alertColor.set(KbqAlertColors.Warning);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getIcon(fixture).classList).toContain('kbq-warning');
        expect(getIcon(fixture).classList).not.toContain('kbq-error');
    });

    it('DEFECT: a new icon with an explicit [color] equal to the last tint is overwritten on the next alertColor change', async () => {
        const fixture = createComponent(ReplacedIcon);

        expect(getIcon(fixture).classList).toContain('kbq-error');

        fixture.componentInstance.explicit.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getIcon(fixture).getAttribute('data-explicit')).toBe('true');
        expect(getIcon(fixture).classList).toContain('kbq-error');

        fixture.componentInstance.alertColor.set(KbqAlertColors.Warning);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getIcon(fixture).getAttribute('data-explicit')).toBe('true');
        expect(getIcon(fixture).classList).toContain('kbq-warning');
        expect(getIcon(fixture).classList).not.toContain('kbq-error');
    });

    it('control: an explicit [color] present from the start is kept on alertColor change', async () => {
        const fixture = createComponent(ExplicitFromStart);

        fixture.componentInstance.alertColor.set(KbqAlertColors.Warning);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getIcon(fixture).classList).toContain('kbq-error');
        expect(getIcon(fixture).classList).not.toContain('kbq-warning');
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIcon],
    template: `
        <kbq-alert [alertColor]="alertColor()">
            <i kbq-icon="kbq-circle-info_16" [color]="iconColor()"></i>
            Alert text
        </kbq-alert>
    `
})
class LateColorOnSameIcon {
    readonly alertColor = signal<KbqEnumValues<KbqAlertColors>>(KbqAlertColors.Error);
    readonly iconColor = signal<KbqComponentColors | undefined>(undefined);
}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIcon],
    template: `
        <kbq-alert [alertColor]="alertColor()">
            @if (explicit()) {
                <i data-explicit="true" kbq-icon="kbq-circle-info_16" [color]="'error'"></i>
            } @else {
                <i kbq-icon="kbq-circle-info_16"></i>
            }
            Alert text
        </kbq-alert>
    `
})
class ReplacedIcon {
    readonly alertColor = signal<KbqEnumValues<KbqAlertColors>>(KbqAlertColors.Error);
    readonly explicit = signal(false);
}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIcon],
    template: `
        <kbq-alert [alertColor]="alertColor()">
            <i kbq-icon="kbq-circle-info_16" [color]="'error'"></i>
            Alert text
        </kbq-alert>
    `
})
class ExplicitFromStart {
    readonly alertColor = signal<KbqEnumValues<KbqAlertColors>>(KbqAlertColors.Error);
}
