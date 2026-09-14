import { Component, inject, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { CheckModalContent, OpenerScopedService } from './checks';

/**
 * `ComponentFactoryResolver` is absent from `@angular/core` 22, and the published bundles import it
 * by name — so merely loading these two entry points is the assertion. Rendering them additionally
 * covers what the removed API was doing: the modal's dynamic component creation and the tab body's
 * portal outlet.
 */
@Component({
    selector: 'removed-api-host',
    imports: [KbqTabsModule],
    providers: [OpenerScopedService],
    template: `
        <kbq-tab-group>
            <kbq-tab label="first"><p class="first-body">first body</p></kbq-tab>
            <kbq-tab label="second"><p class="second-body">second body</p></kbq-tab>
        </kbq-tab-group>
    `
})
class RemovedApiHost {
    readonly injector = inject(Injector);
    readonly modalService = inject(KbqModalService);
}

describe('APIs removed in Angular 22', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RemovedApiHost],
            providers: [provideNoopAnimations()]
        }).compileComponents();
    });

    it('renders a tab group, whose body portal no longer takes a ComponentFactoryResolver', () => {
        const fixture = TestBed.createComponent(RemovedApiHost);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.first-body')).toBeTruthy();
    });

    it('creates modal content through createComponent, with both injectors intact', () => {
        const fixture = TestBed.createComponent(RemovedApiHost);

        fixture.detectChanges();

        const { modalService, injector } = fixture.componentInstance;
        const ref = modalService.open({ kbqComponent: CheckModalContent, injector });

        fixture.detectChanges();

        // The element injector carries `KbqModalRef` and reaches the opener's own providers.
        expect(document.querySelector('#modal-ref')?.textContent).toBe('ref-ok');
        expect(document.querySelector('#modal-scoped')?.textContent).toBe('opener-scoped');

        ref.destroy();
    });
});
