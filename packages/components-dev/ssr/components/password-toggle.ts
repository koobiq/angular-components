import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * `kbq-password-toggle` swaps its icon name (`kbq-eye_16` / `kbq-eye-slash_16`) on every click —
 * manual check that a changing `[kbq-icon]` name still renders a single svg after hydration.
 */
@Component({
    selector: 'dev-password-toggle-hydration',
    imports: [FormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <p>Toggle the password visibility a few times, then check the toggle icon for duplicate &lt;svg&gt;s.</p>

        <kbq-form-field style="width: 240px">
            <input kbqInputPassword placeholder="Password" [(ngModel)]="value" />

            <kbq-password-toggle />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevPasswordToggleHydration {
    protected value = signal('P@a$$w0rd');
}
