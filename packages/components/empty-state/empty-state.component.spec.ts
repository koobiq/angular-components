import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
import { KbqIconItem, KbqIconModule } from '@koobiq/components/icon';
import { readFileSync } from 'fs';
import { axe } from 'jest-axe';
import { join } from 'path';
import {
    KbqEmptyState,
    KbqEmptyStateActions,
    KbqEmptyStateIcon,
    KbqEmptyStateModule,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from './index';

describe('KbqEmptyState', () => {
    const createFixture = <T>(component: Type<T>): ComponentFixture<T> => {
        const fixture = TestBed.createComponent(component);

        fixture.detectChanges();

        return fixture;
    };

    const classListOf = <T>(fixture: ComponentFixture<T>, directive: Type<unknown>): DOMTokenList =>
        fixture.debugElement.query(By.directive(directive)).nativeElement.classList;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqEmptyStateModule,
                KbqIconModule,
                KbqButtonModule,
                EmptyStateWithParams,
                EmptyStateWithInputs,
                EmptyStateWithWrappedIcon
            ]
        }).compileComponents();
    });

    it('should init and set classes', () => {
        const fixture = createFixture(EmptyStateWithParams);

        expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state');
        expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_normal');
        expect(classListOf(fixture, KbqEmptyStateIcon)).toContain('kbq-empty-state-icon');
        expect(classListOf(fixture, KbqEmptyStateTitle)).toContain('kbq-empty-state-title');
        expect(classListOf(fixture, KbqEmptyStateText)).toContain('kbq-empty-state-text');
        expect(classListOf(fixture, KbqEmptyStateActions)).toContain('kbq-empty-state-actions');
    });

    describe('size', () => {
        it.each<KbqDefaultSizes>(['compact', 'normal', 'big'])('should render the %s size class', (size) => {
            const fixture = createFixture(EmptyStateWithInputs);

            fixture.componentInstance.size.set(size);
            fixture.detectChanges();

            expect(classListOf(fixture, KbqEmptyState)).toContain(`kbq-empty-state_${size}`);
        });

        it('should replace the previous size class instead of accumulating', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            fixture.componentInstance.size.set('big');
            fixture.detectChanges();

            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_normal');
        });
    });

    describe('alignTop', () => {
        it('should align to the center by default', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_align-center');
            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_align-top');
        });

        it('should align to the top when enabled', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            fixture.componentInstance.alignTop.set(true);
            fixture.detectChanges();

            expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_align-top');
            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_align-center');
        });
    });

    describe('has-icon', () => {
        it('should mark the host when the illustration slot is filled', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_has-icon');
        });

        it('should not mark the host when the illustration slot is empty', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            fixture.componentInstance.withIcon.set(false);
            fixture.detectChanges();

            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_has-icon');
        });
    });

    describe('errorColor', () => {
        const iconClassList = <T>(fixture: ComponentFixture<T>): DOMTokenList =>
            fixture.debugElement.query(By.directive(KbqIconItem)).nativeElement.classList;

        it('should carry the normal color classes by default', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_normal-color');
            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_error-color');
        });

        it('should swap the host color classes', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            fixture.componentInstance.errorColor.set(true);
            fixture.detectChanges();

            expect(classListOf(fixture, KbqEmptyState)).toContain('kbq-empty-state_error-color');
            expect(classListOf(fixture, KbqEmptyState)).not.toContain('kbq-empty-state_normal-color');
        });

        // The tint used to be applied once from ngAfterContentInit, so it neither arrived late nor
        // ever went away.
        it('should tint and untint the icon as the input is toggled', () => {
            const fixture = createFixture(EmptyStateWithInputs);

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Contrast}`);

            fixture.componentInstance.errorColor.set(true);
            fixture.detectChanges();

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Error}`);
            expect(iconClassList(fixture)).not.toContain(`kbq-${KbqComponentColors.Contrast}`);

            fixture.componentInstance.errorColor.set(false);
            fixture.detectChanges();

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Contrast}`);
            expect(iconClassList(fixture)).not.toContain(`kbq-${KbqComponentColors.Error}`);
        });

        it('should tint an icon that starts out in the error state', () => {
            const fixture = TestBed.createComponent(EmptyStateWithInputs);

            fixture.componentInstance.errorColor.set(true);
            fixture.detectChanges();

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Error}`);
        });

        // The directive resolves the icon through `inject(KbqIconItem)`, which only sees an icon on
        // its own host element; two of the package's own examples wrap the icon instead.
        it('should tint an icon wrapped by the illustration slot', () => {
            const fixture = createFixture(EmptyStateWithWrappedIcon);

            fixture.componentInstance.errorColor.set(true);
            fixture.detectChanges();

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Error}`);

            fixture.componentInstance.errorColor.set(false);
            fixture.detectChanges();

            expect(iconClassList(fixture)).toContain(`kbq-${KbqComponentColors.Contrast}`);
        });
    });

    describe('a11y', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            container.innerHTML = '<h1>Page</h1>';
            document.body.appendChild(container);
        });

        afterEach(() => container.remove());

        it('should have no axe violations under a page heading', async () => {
            const fixture = createFixture(EmptyStateWithInputs);

            container.appendChild(fixture.nativeElement);

            expect(await axe(container)).toHaveNoViolations();
        });
    });

    // EST-CSS-01: the layout rules and the custom properties they read used to live in two files
    // joined only by `styleUrls`, so anything reusing the stylesheet took the rules without the
    // variables and every `max-width` in it silently resolved to `none`.
    describe('stylesheet packaging', () => {
        const read = (name: string) => readFileSync(join(__dirname, name), 'utf8');
        const tokens = read('empty-state-tokens.scss');
        const stylesheets = [read('empty-state.scss'), read('_empty-state-theme.scss')];

        it('should load its token layer from the stylesheet that reads it', () => {
            expect(stylesheets[0]).toContain("@use './empty-state-tokens'");
        });

        it('should declare every custom property its stylesheets read', () => {
            const consumed = stylesheets.flatMap((stylesheet) =>
                [...stylesheet.matchAll(/var\((--kbq-empty-state-[\w-]+)/g)].map(([, property]) => property)
            );

            expect(consumed.length).toBeGreaterThan(0);

            for (const property of new Set(consumed)) {
                expect(tokens).toContain(`${property}:`);
            }
        });

        it('should keep the deprecated theme token names as fallbacks', () => {
            expect(tokens).toContain('--kbq-empty-state-title-color: var(--kbq-empty-state-title,');
            expect(tokens).toContain('--kbq-empty-state-text-color: var(--kbq-empty-state-color,');
        });
    });
});

@Component({
    selector: 'empty-state-with-params',
    imports: [KbqEmptyStateModule, KbqIconModule, KbqButtonModule],
    template: `
        <kbq-empty-state>
            <i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon [fade]="true" [big]="true" [color]="'contrast'"></i>
            <h2 kbq-empty-state-title>kbq-empty-state-title</h2>
            <div kbq-empty-state-text>kbq-empty-state-text</div>
            <div kbq-empty-state-actions>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 1</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 2</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 3</button>
            </div>
        </kbq-empty-state>
    `
})
class EmptyStateWithParams {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}

@Component({
    selector: 'empty-state-with-inputs',
    imports: [KbqEmptyStateModule, KbqIconModule],
    template: `
        <kbq-empty-state [alignTop]="alignTop()" [errorColor]="errorColor()" [size]="size()">
            @if (withIcon()) {
                <i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon [fade]="true" [big]="true" [color]="'contrast'"></i>
            }
            <h2 kbq-empty-state-title>Title</h2>
            <div kbq-empty-state-text>Text</div>
        </kbq-empty-state>
    `
})
class EmptyStateWithInputs {
    readonly size = signal<KbqDefaultSizes>('normal');
    readonly alignTop = signal(false);
    readonly errorColor = signal(false);
    readonly withIcon = signal(true);
}

@Component({
    selector: 'empty-state-with-wrapped-icon',
    imports: [KbqEmptyStateModule, KbqIconModule],
    template: `
        <kbq-empty-state [errorColor]="errorColor()">
            <div kbq-empty-state-icon>
                <i kbq-icon-item="kbq-bell_16" [fade]="true" [big]="true" [color]="'contrast'"></i>
            </div>
            <div kbq-empty-state-text>Text</div>
        </kbq-empty-state>
    `
})
class EmptyStateWithWrappedIcon {
    readonly errorColor = signal(false);
}
