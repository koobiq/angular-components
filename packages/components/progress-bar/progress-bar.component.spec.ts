import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KBQ_LOCALE_SERVICE,
    KbqComponentColors,
    KbqLocaleService,
    KbqLocaleServiceModule,
    ruRULocaleData
} from '@koobiq/components/core';
import { axe } from 'jest-axe';
import { KbqProgressBarModule, ProgressBarMode } from './index';

const DEFAULT_ARIA_LABEL = ruRULocaleData.a11y.progressBar;

describe('KbqProgressBar', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;

    const detect = (): void => fixture.detectChanges();
    const first = (): HTMLElement => fixture.debugElement.query(By.css('.first')).nativeElement;
    const byDefault = (): HTMLElement => fixture.debugElement.query(By.css('.default')).nativeElement;
    const lineOf = (host: HTMLElement): HTMLElement => host.querySelector('.kbq-progress-bar__line')!;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqProgressBarModule, KbqLocaleServiceModule, TestApp, ProjectedApp, LabelledApp]
        }).compileComponents();
    });

    describe('rendering', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.componentInstance;
            detect();
        });

        describe('mode', () => {
            it('should render the determinate line and only that one', () => {
                testComponent.mode = 'determinate';
                detect();

                expect(first().querySelector('.kbq-progress-bar__line_determinate')).not.toBeNull();
                expect(first().querySelector('.kbq-progress-bar__line_indeterminate')).toBeNull();
                expect(first().classList).toContain('kbq-progress-bar_determinate');
                expect(first().classList).not.toContain('kbq-progress-bar_indeterminate');
            });

            it('should render the indeterminate line and only that one', () => {
                testComponent.mode = 'indeterminate';
                detect();

                expect(first().querySelector('.kbq-progress-bar__line_indeterminate')).not.toBeNull();
                expect(first().querySelector('.kbq-progress-bar__line_determinate')).toBeNull();
                expect(first().classList).toContain('kbq-progress-bar_indeterminate');
                expect(first().classList).not.toContain('kbq-progress-bar_determinate');
            });

            it('should render the determinate line without a binding', () => {
                expect(byDefault().querySelector('.kbq-progress-bar__line_determinate')).not.toBeNull();
                expect(byDefault().classList).toContain('kbq-progress-bar_determinate');
            });

            // A signal input does not fall back to its declared default when a binding supplies
            // `undefined`, so the modifier class has to agree with the branch the template renders.
            it('should stay determinate when the binding is explicitly undefined', () => {
                testComponent.mode = undefined as unknown as ProgressBarMode;
                detect();

                expect(first().querySelector('.kbq-progress-bar__line_determinate')).not.toBeNull();
                expect(first().classList).toContain('kbq-progress-bar_determinate');
                expect(first().classList).not.toContain('kbq-progress-bar_indeterminate');
            });
        });

        describe('value', () => {
            it('should write the value out as the line width', () => {
                testComponent.value = 40;
                detect();

                expect(lineOf(first()).style.width).toBe('40%');
            });

            it('should clamp a value below the range', () => {
                testComponent.value = -50;
                detect();

                expect(lineOf(first()).style.width).toBe('0%');
            });

            it('should clamp a value above the range', () => {
                testComponent.value = 140;
                detect();

                expect(lineOf(first()).style.width).toBe('100%');
            });

            // `Math.max(0, Math.min(100, NaN))` is `NaN`, which renders as the invalid `width: NaN%` and
            // leaves the previous width standing.
            it('should fall back to zero for a non-finite value', () => {
                testComponent.value = 40;
                detect();
                testComponent.value = Number.NaN;
                detect();

                expect(lineOf(first()).style.width).toBe('0%');
            });

            it('should be zero without a binding', () => {
                expect(lineOf(byDefault()).style.width).toBe('0%');
            });
        });

        describe('color', () => {
            it('should carry the theme color by default', () => {
                expect(byDefault().classList).toContain('kbq-theme');
            });

            it('should apply a bound color', () => {
                testComponent.color = KbqComponentColors.Error;
                detect();

                expect(first().classList).toContain('kbq-error');
                expect(first().classList).not.toContain('kbq-theme');
            });

            // Without `setDefaultColor()` a falsy binding removes the previous class and adds nothing,
            // which strips the only selector the theme keys on and leaves the bar invisible.
            it('should fall back to the default color for a falsy binding', () => {
                testComponent.color = KbqComponentColors.Error;
                detect();
                testComponent.color = null as unknown as KbqComponentColors;
                detect();

                expect(first().classList).toContain('kbq-theme');
            });
        });

        describe('id', () => {
            it('should set the id attribute', () => {
                testComponent.id = 'foo';
                detect();

                expect(first().getAttribute('id')).toBe('foo');
            });

            it('should generate an id', () => {
                expect(byDefault().getAttribute('id')).toMatch(/^kbq-progress-bar-\d+$/);
            });

            // The inner track used to repeat the host id, so every bar shipped two elements answering to
            // the same selector.
            it('should render exactly one element carrying the id', () => {
                testComponent.id = 'foo';
                detect();

                expect(fixture.nativeElement.querySelectorAll('#foo')).toHaveLength(1);
                expect(first().querySelectorAll('[id]')).toHaveLength(0);
            });
        });

        describe('aria', () => {
            it('should expose the progressbar role', () => {
                expect(byDefault().getAttribute('role')).toBe('progressbar');
            });

            it('should report the clamped value in determinate mode', () => {
                testComponent.value = 140;
                detect();

                expect(first().getAttribute('aria-valuenow')).toBe('100');
                expect(first().getAttribute('aria-valuemin')).toBe('0');
                expect(first().getAttribute('aria-valuemax')).toBe('100');
            });

            it('should report a zero value rather than omitting it', () => {
                expect(byDefault().getAttribute('aria-valuenow')).toBe('0');
            });

            // The absence of `aria-valuenow` is what expresses "unknown"; pinning it to 0 would report a
            // bar that has not started instead.
            it('should omit the whole range in indeterminate mode', () => {
                testComponent.mode = 'indeterminate';
                detect();

                expect(first().getAttribute('aria-valuenow')).toBeNull();
                expect(first().getAttribute('aria-valuemin')).toBeNull();
                expect(first().getAttribute('aria-valuemax')).toBeNull();
            });

            it('should name an unlabelled bar from the locale', () => {
                expect(byDefault().getAttribute('aria-label')).toBe(DEFAULT_ARIA_LABEL);
                expect(byDefault().getAttribute('aria-labelledby')).toBeNull();
            });

            it('should prefer a bound aria-label', () => {
                testComponent.ariaLabel = 'Uploading';
                detect();

                expect(first().getAttribute('aria-label')).toBe('Uploading');
            });
        });
    });

    describe('projected content', () => {
        let projected: ComponentFixture<ProjectedApp>;

        const host = (): HTMLElement => projected.debugElement.query(By.css('kbq-progress-bar')).nativeElement;
        const query = (selector: string): HTMLElement => projected.debugElement.query(By.css(selector)).nativeElement;

        beforeEach(() => {
            projected = TestBed.createComponent(ProjectedApp);
            projected.detectChanges();
        });

        it('should be named by the projected text', () => {
            const id = query('[kbq-progress-bar-text]').getAttribute('id');

            expect(id).toMatch(/^kbq-progress-bar-text-\d+$/);
            expect(host().getAttribute('aria-labelledby')).toBe(id);
            expect(host().getAttribute('aria-label')).toBeNull();
        });

        it('should be described by the projected caption', () => {
            const id = query('[kbq-progress-bar-caption]').getAttribute('id');

            expect(id).toMatch(/^kbq-progress-bar-caption-\d+$/);
            expect(host().getAttribute('aria-describedby')).toBe(id);
        });

        it('should let a bound aria-label win over the projected text', () => {
            projected.componentInstance.ariaLabel = 'Uploading';
            projected.detectChanges();

            expect(host().getAttribute('aria-label')).toBe('Uploading');
            expect(host().getAttribute('aria-labelledby')).toBeNull();
        });

        it('should reference a supplied id on the projected text', () => {
            const labelled = TestBed.createComponent(LabelledApp);

            labelled.detectChanges();

            expect(
                labelled.debugElement.query(By.css('kbq-progress-bar')).nativeElement.getAttribute('aria-labelledby')
            ).toBe('upload-label');
        });

        it('should have no axe violations', async () => {
            expect(await axe(projected.nativeElement)).toHaveNoViolations();
        });
    });

    describe('locale', () => {
        let localeService: KbqLocaleService;

        beforeEach(() => {
            localeService = TestBed.inject(KBQ_LOCALE_SERVICE);
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.componentInstance;
            detect();
        });

        it('should follow a locale change', () => {
            localeService.addLocale('test-locale', { a11y: { progressBar: 'Loading' } });
            detect();

            expect(byDefault().getAttribute('aria-label')).toBe('Loading');
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar
            class="first"
            [aria-label]="ariaLabel"
            [id]="id"
            [value]="value"
            [mode]="mode"
            [color]="color"
        />
        <kbq-progress-bar class="default" />
    `
})
class TestApp {
    value: number = 0;
    mode: ProgressBarMode = 'determinate';
    id: string = 'first';
    color: KbqComponentColors = KbqComponentColors.Theme;
    ariaLabel: string | null = null;
}

@Component({
    selector: 'projected-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [aria-label]="ariaLabel" [id]="'upload-bar'" [value]="30">
            <div kbq-progress-bar-text>Uploading the archive</div>
            <div kbq-progress-bar-caption>3 of 12 files</div>
        </kbq-progress-bar>
        <!-- Aims an ARIA reference at the bar's id, which is what makes the duplicate-id-aria rule live. -->
        <button type="button" aria-controls="upload-bar">Cancel</button>
    `
})
class ProjectedApp {
    ariaLabel: string | null = null;
}

@Component({
    selector: 'labelled-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [value]="30">
            <div kbq-progress-bar-text id="upload-label">Uploading the archive</div>
        </kbq-progress-bar>
    `
})
class LabelledApp {}
