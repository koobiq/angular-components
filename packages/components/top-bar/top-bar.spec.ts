import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqOverlayLayer } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { axe } from 'jest-axe';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer } from './top-bar';

const createFixture = <T>(component: Type<T>): ComponentFixture<T> => {
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getTopBar = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('kbq-top-bar');

const getContainers = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.kbq-top-bar-container'));

describe(KbqTopBar.name, () => {
    describe('shadow modifier', () => {
        let fixture: ComponentFixture<TestApp>;
        let topBarElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            topBarElement = getTopBar(fixture);
        });

        it('should be absent by default', () => {
            fixture.detectChanges();

            expect(topBarElement.classList.contains('kbq-top-bar_with-shadow')).toBeFalsy();
        });

        it('should be applied when withShadow is set', () => {
            fixture.componentInstance.withShadow = true;
            fixture.detectChanges();

            expect(topBarElement.classList.contains('kbq-top-bar_with-shadow')).toBeTruthy();
        });

        it('should be removed when withShadow is unset again', () => {
            fixture.componentInstance.withShadow = true;
            fixture.detectChanges();

            fixture.componentInstance.withShadow = false;
            fixture.detectChanges();

            expect(topBarElement.classList.contains('kbq-top-bar_with-shadow')).toBeFalsy();
        });
    });

    it('should coerce the bare attribute form of withShadow', () => {
        const fixture = createFixture(BareAttributeTestApp);

        expect(getTopBar(fixture).classList.contains('kbq-top-bar_with-shadow')).toBeTruthy();
    });

    describe('aria-label', () => {
        it('should not be rendered when it is not set', () => {
            const fixture = createFixture(TestApp);

            expect(getTopBar(fixture).hasAttribute('aria-label')).toBeFalsy();
        });

        it('should be rendered from the static attribute form', () => {
            const fixture = createFixture(PopulatedTestApp);

            expect(getTopBar(fixture).getAttribute('aria-label')).toBe('Dashboards');
        });

        it('should not be rendered when it is bound to an empty string', () => {
            const fixture = createFixture(TestApp);

            fixture.componentInstance.ariaLabel = '';
            fixture.detectChanges();

            expect(getTopBar(fixture).hasAttribute('aria-label')).toBeFalsy();
        });
    });

    it('should keep the panels opened from it in the application-wide container inside an overlay layer', () => {
        TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });

        const fixture = createFixture(InOverlayLayerTestApp);

        fixture.componentInstance.trigger().open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')!.closest('.cdk-overlay-container')).toBe(
            TestBed.inject(OverlayContainer).getContainerElement()
        );
    });

    it('should have no axe violations for a populated bar', async () => {
        const fixture = createFixture(PopulatedTestApp);

        document.body.appendChild(fixture.nativeElement);

        expect(await axe(fixture.nativeElement)).toHaveNoViolations();

        fixture.nativeElement.remove();
    });
});

describe(KbqTopBarContainer.name, () => {
    it('should apply the placement modifier matching the input', () => {
        const [start, end] = getContainers(createFixture(PopulatedTestApp));

        expect(start.classList.contains('kbq-top-bar-container_start')).toBeTruthy();
        expect(end.classList.contains('kbq-top-bar-container_end')).toBeTruthy();
    });

    it('should never apply both placement modifiers to the same container', () => {
        for (const container of getContainers(createFixture(PopulatedTestApp))) {
            expect(container.classList.contains('kbq-top-bar-container_start')).not.toBe(
                container.classList.contains('kbq-top-bar-container_end')
            );
        }
    });

    it('should swap the placement modifier when the input changes', () => {
        const fixture = createFixture(DynamicPlacementTestApp);
        const container = getContainers(fixture)[0];

        expect(container.classList.contains('kbq-top-bar-container_start')).toBeTruthy();

        fixture.componentInstance.placement = 'end';
        fixture.detectChanges();

        expect(container.classList.contains('kbq-top-bar-container_start')).toBeFalsy();
        expect(container.classList.contains('kbq-top-bar-container_end')).toBeTruthy();
    });
});

describe(KbqTopBarSpacer.name, () => {
    it('should apply the spacer class', () => {
        const fixture = createFixture(PopulatedTestApp);

        expect(fixture.nativeElement.querySelectorAll('.kbq-top-bar-spacer').length).toBe(1);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqTopBar],
    template: '<kbq-top-bar [withShadow]="withShadow" [aria-label]="ariaLabel" />'
})
class TestApp {
    withShadow = false;
    ariaLabel: string | null = null;
}

@Component({
    selector: 'bare-attribute-test-app',
    imports: [KbqTopBar],
    template: '<kbq-top-bar withShadow />'
})
class BareAttributeTestApp {}

@Component({
    selector: 'dynamic-placement-test-app',
    imports: [KbqTopBar, KbqTopBarContainer],
    template: `
        <kbq-top-bar>
            <div kbqTopBarContainer [placement]="placement"></div>
        </kbq-top-bar>
    `
})
class DynamicPlacementTestApp {
    placement: 'start' | 'end' = 'start';
}

@Component({
    selector: 'populated-test-app',
    imports: [KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer],
    template: `
        <kbq-top-bar role="banner" aria-label="Dashboards">
            <div kbqTopBarContainer placement="start">
                <h1>Dashboards</h1>
            </div>

            <div kbqTopBarSpacer></div>

            <div kbqTopBarContainer placement="end">
                <button type="button">Create</button>
            </div>
        </kbq-top-bar>
    `
})
class PopulatedTestApp {}

@Component({
    imports: [KbqTopBar, KbqOverlayLayer, KbqDropdownModule],
    template: `
        <div kbqOverlayLayer>
            <kbq-top-bar>
                <button [kbqDropdownTriggerFor]="dropdown">Actions</button>
            </kbq-top-bar>

            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item>Rename</button>
            </kbq-dropdown>
        </div>
    `
})
class InOverlayLayerTestApp {
    readonly trigger = viewChild.required(KbqDropdownTrigger);
}
