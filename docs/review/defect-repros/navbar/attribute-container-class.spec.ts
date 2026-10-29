import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqNavbarModule } from '@koobiq/components/navbar';

@Component({
    selector: 'test-attribute-container-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-navbar>
            <div id="attribute-container" kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
            </div>
            <kbq-navbar-container id="element-container">
                <kbq-navbar-item>
                    <kbq-navbar-title>Second</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestAttributeContainerApp {}

describe('triage: attribute form of the navbar container', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TestAttributeContainerApp] }));

    it('DEFECT: a projected [kbq-navbar-container] gets no kbq-navbar-container class', () => {
        const fixture = TestBed.createComponent(TestAttributeContainerApp);

        fixture.detectChanges();

        const navbar = fixture.nativeElement.querySelector('kbq-navbar') as HTMLElement;
        const attributeContainer = fixture.nativeElement.querySelector('#attribute-container') as HTMLElement;
        const elementContainer = fixture.nativeElement.querySelector('#element-container') as HTMLElement;

        // Projected by the navbar's own `ng-content` selector.
        expect(attributeContainer.parentElement).toBe(navbar);

        expect(elementContainer.classList).toContain('kbq-navbar-container');
        expect(attributeContainer.classList).not.toContain('kbq-navbar-container');
    });
});
