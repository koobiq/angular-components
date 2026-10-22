import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqToastComponent, KbqToastModule, KbqToastService } from '@koobiq/components/toast';

/** The progress toast the docs recommend: no close button, a "Cancel" action that interrupts the operation. */
@Component({
    selector: 'progress-toast-host',
    imports: [KbqToastModule],
    template: `
        <ng-template #actions let-toast>
            <button class="cancel" type="button" (click)="cancel(toast)">Cancel</button>
        </ng-template>
    `
})
class ProgressToastHost {
    readonly actions = viewChild.required<TemplateRef<unknown>>('actions');

    cancelled = false;

    cancel(toast: KbqToastComponent): void {
        this.cancelled = true;
        toast.close();
    }
}

describe('triage: Escape on a toast without a close button', () => {
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqToastModule, ProgressToastHost] });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    it('DEFECT: Escape removes a toast shown with closeButton: false without running its Cancel action', () => {
        const fixture = TestBed.createComponent(ProgressToastHost);

        fixture.detectChanges();

        const { ref } = service.show(
            { title: 'Importing files', closeButton: false, actions: fixture.componentInstance.actions() },
            0
        );

        TestBed.inject(ApplicationRef).tick();

        const host = ref.location.nativeElement as HTMLElement;
        const cancel = host.querySelector<HTMLButtonElement>('button.cancel')!;

        expect(host.querySelector('[kbq-toast-close-button]')).toBeNull();
        expect(cancel).not.toBeNull();

        cancel.focus();
        dispatchKeyboardEvent(cancel, 'keydown', ESCAPE, undefined, 'Escape');

        expect(service.toasts.length).toBe(0);
        expect(fixture.componentInstance.cancelled).toBe(false);
    });
});
