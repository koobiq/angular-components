import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqComponentColors, KbqEnumValues } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';
import { KbqAlert, KbqAlertCloseButton, KbqAlertColors, KbqAlertControl, KbqAlertStyles, KbqAlertTitle } from './index';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.detectChanges();

    return fixture;
};

const getAlert = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.directive(KbqAlert)).nativeElement;

const getAlertInstance = (fixture: ComponentFixture<unknown>): KbqAlert =>
    fixture.debugElement.query(By.directive(KbqAlert)).componentInstance;

const getIcon = (fixture: ComponentFixture<unknown>): HTMLElement | null =>
    fixture.debugElement.query(By.css('.kbq-alert__icon i'))?.nativeElement ?? null;

describe(KbqAlert.name, () => {
    it('should add the base host class', () => {
        const fixture = createComponent(BareTestApp);

        expect(getAlert(fixture).classList).toContain('kbq-alert');
    });

    describe('host classes', () => {
        it('should apply the color class for alertColor', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set(KbqAlertColors.Error);
            fixture.detectChanges();

            expect(getAlert(fixture).classList).toContain('kbq-alert_error');
        });

        it('should round-trip alertColor (get returns the raw value that was set)', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set(KbqAlertColors.Error);
            fixture.detectChanges();

            expect(getAlertInstance(fixture).alertColor()).toBe(KbqAlertColors.Error);
        });

        it('should fall back to info for a falsy alertColor', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set('' as KbqEnumValues<KbqAlertColors>);
            fixture.detectChanges();

            expect(getAlertInstance(fixture).alertColor()).toBe(KbqAlertColors.Info);
            expect(getAlert(fixture).classList).toContain('kbq-alert_info');
        });

        it('should default to the default style', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(getAlert(fixture).classList).toContain('kbq-alert_default');
            expect(getAlert(fixture).classList).not.toContain('kbq-alert_colored');
        });

        it('should apply the colored style class', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertStyle.set(KbqAlertStyles.Colored);
            fixture.detectChanges();

            expect(getAlert(fixture).classList).toContain('kbq-alert_colored');
            expect(getAlert(fixture).classList).not.toContain('kbq-alert_default');
        });

        it('should be normal by default and compact when requested', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(getAlert(fixture).classList).toContain('kbq-alert_normal');

            fixture.componentInstance.compact.set(true);
            fixture.detectChanges();

            expect(getAlert(fixture).classList).toContain('kbq-alert_compact');
            expect(getAlert(fixture).classList).not.toContain('kbq-alert_normal');
        });

        it('should apply the dismissible class only when a close button is projected', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(getAlert(fixture).classList).not.toContain('kbq-alert_dismissible');

            fixture.componentInstance.showClose.set(true);
            fixture.detectChanges();

            expect(getAlert(fixture).classList).toContain('kbq-alert_dismissible');
        });
    });

    describe('icon auto-coloring', () => {
        it('should tint an uncolored icon to the alert color', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set(KbqAlertColors.Warning);
            fixture.componentInstance.showIcon.set(true);
            fixture.detectChanges();

            expect(getIcon(fixture)!.classList).toContain('kbq-warning');
        });

        it('should tint an uncolored icon in an info alert to contrast', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set(KbqAlertColors.Info);
            fixture.componentInstance.showIcon.set(true);
            fixture.detectChanges();

            expect(getIcon(fixture)!.classList).toContain('kbq-contrast');
        });

        it('should leave an explicitly colored icon untouched', () => {
            const fixture = createComponent(ExplicitIconTestApp);

            expect(getIcon(fixture)!.classList).toContain('kbq-error');
            expect(getIcon(fixture)!.classList).not.toContain('kbq-success');
        });

        it('should re-tint an auto-colored icon when the alert color changes', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.alertColor.set(KbqAlertColors.Error);
            fixture.componentInstance.showIcon.set(true);
            fixture.detectChanges();
            expect(getIcon(fixture)!.classList).toContain('kbq-error');

            fixture.componentInstance.alertColor.set(KbqAlertColors.Success);
            fixture.detectChanges();

            expect(getIcon(fixture)!.classList).toContain('kbq-success');
            expect(getIcon(fixture)!.classList).not.toContain('kbq-error');
        });
    });

    describe('template', () => {
        it('should render the icon wrapper only when an icon is projected', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(fixture.debugElement.query(By.css('.kbq-alert__icon'))).toBeNull();

            fixture.componentInstance.showIcon.set(true);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.kbq-alert__icon'))).not.toBeNull();
        });

        it('should render the button stack only when a control is projected', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(fixture.debugElement.query(By.css('.kbq-alert__button-stack'))).toBeNull();

            fixture.componentInstance.showControl.set(true);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.kbq-alert__button-stack'))).not.toBeNull();
        });

        it('should toggle the has-button modifier when the control is a button', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.showControl.set(true);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.kbq-alert__button-stack_has-button'))).not.toBeNull();
        });

        it('should toggle the title modifiers when a title is projected', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(fixture.debugElement.query(By.css('.kbq-alert__content_title'))).toBeNull();

            fixture.componentInstance.showTitle.set(true);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.kbq-alert__content_title'))).not.toBeNull();
        });

        it('should render the close-button wrapper only when a close button is projected', () => {
            const fixture = createComponent(ConfigurableTestApp);

            expect(fixture.debugElement.query(By.css('.kbq-alert__close-button'))).toBeNull();

            fixture.componentInstance.showClose.set(true);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.kbq-alert__close-button'))).not.toBeNull();
        });
    });

    describe('closed output', () => {
        it('should emit when the projected close control is activated', () => {
            const fixture = createComponent(ConfigurableTestApp);

            fixture.componentInstance.showClose.set(true);
            fixture.detectChanges();

            fixture.debugElement.query(By.css('[kbq-alert-close-button]')).nativeElement.click();

            expect(fixture.componentInstance.closedCount).toBe(1);
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAlert],
    template: `
        <kbq-alert />
    `
})
class BareTestApp {}

@Component({
    selector: 'test-app',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertControl,
        KbqAlertCloseButton,
        KbqButton,
        KbqButtonCssStyler,
        KbqIcon,
        KbqIconButton
    ],
    template: `
        <kbq-alert
            [alertColor]="alertColor()"
            [alertStyle]="alertStyle()"
            [compact]="compact()"
            (closed)="closedCount = closedCount + 1"
        >
            @if (showIcon()) {
                <!-- No explicit [color] — relies on the alert's auto-tint, like the docs examples. -->
                <i kbq-icon="kbq-circle-info_16"></i>
            }
            @if (showTitle()) {
                <div kbq-alert-title>Title</div>
            }
            Alert text
            @if (showControl()) {
                <button kbq-alert-control kbq-button>Action</button>
            }
            @if (showClose()) {
                <button kbq-alert-close-button kbq-icon-button="kbq-xmark-s_16" aria-label="Close"></button>
            }
        </kbq-alert>
    `
})
class ConfigurableTestApp {
    readonly alertColor = signal<KbqEnumValues<KbqAlertColors>>(KbqAlertColors.Info);
    readonly alertStyle = signal<KbqEnumValues<KbqAlertStyles>>(KbqAlertStyles.Default);
    readonly compact = signal(false);
    readonly showIcon = signal(false);
    readonly showTitle = signal(false);
    readonly showControl = signal(false);
    readonly showClose = signal(false);
    closedCount = 0;
}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqIcon],
    template: `
        <kbq-alert [alertColor]="'success'">
            <i kbq-icon="kbq-circle-info_16" [color]="colors.Error"></i>
            Alert text
        </kbq-alert>
    `
})
class ExplicitIconTestApp {
    readonly colors = KbqComponentColors;
}
