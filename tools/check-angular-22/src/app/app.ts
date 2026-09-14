import { Component, inject, Injector } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { CheckModalContent, OpenerScopedService } from './checks';

@Component({
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqSelectModule, KbqTabsModule],
    selector: 'app-root',
    providers: [OpenerScopedService],
    templateUrl: './app.html'
})
export class App {
    /** `KbqTrim` matches `[kbqInput]`, so this control must never see leading or trailing whitespace. */
    readonly trimmed = new FormControl('');
    /** The `no-trim` opt-out, as the control group for the assertion above. */
    readonly untrimmed = new FormControl('');

    private readonly modalService = inject(KbqModalService);
    private readonly injector = inject(Injector);

    openModal(): void {
        this.modalService.open({ kbqComponent: CheckModalContent, injector: this.injector });
    }
}
