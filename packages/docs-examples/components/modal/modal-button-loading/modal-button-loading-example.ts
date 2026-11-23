import { ChangeDetectionStrategy, Component, inject, signal, type TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { type KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

const SERVER_ADDRESS_PATTERN = /^https?:\/\/\S+$/;

type CheckResult = 'success' | 'error';

/**
 * @title Modal buttons in the loading state
 */
@Component({
    selector: 'modal-button-loading-example',
    imports: [KbqButtonModule, KbqIconModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <button kbq-button type="button" (click)="openModal(content, footer)">{{ t().open }}</button>

        <ng-template #content>
            <div class="kbq-form kbq-form-vertical">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>{{ t().serverLabel }}</kbq-label>
                        <input kbqInput type="text" [formControl]="server" />
                        <kbq-error>
                            {{ server.hasError('required') ? t().required : t().invalidUrl }}
                        </kbq-error>
                        @if (checkResult(); as result) {
                            <kbq-hint [color]="result">
                                <i
                                    [color]="result"
                                    [kbq-icon]="result === 'success' ? 'kbq-check_16' : 'kbq-xmark_16'"
                                ></i>
                                {{ result === 'success' ? t().connected : t().notConnected }}
                            </kbq-hint>
                        }
                    </kbq-form-field>
                </div>
            </div>
        </ng-template>

        <ng-template #footer>
            <div class="layout-row flex-grow layout-align-space-between-center">
                <div>
                    <button type="button" color="contrast" kbq-button kbq-modal-main-action (click)="save()">
                        {{ t().save }}
                    </button>
                    <button type="button" class="layout-margin-left-m" kbq-button (click)="close()">
                        {{ t().cancel }}
                    </button>
                </div>
                <button
                    type="button"
                    kbq-button
                    [class.kbq-progress]="checking()"
                    [disabled]="checking()"
                    (click)="checkConnection()"
                >
                    {{ t().check }}
                </button>
            </div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalButtonLoadingExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly checking = signal(false);

    protected readonly checkResult = signal<CheckResult | null>(null);

    protected readonly server = new FormControl('https://koobiq.io/', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(SERVER_ADDRESS_PATTERN)]
    });

    private readonly modalService = inject(KbqModalService);

    private modalRef?: KbqModalRef;

    private previousConnectionState = true;

    constructor() {
        this.server.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.checkResult.set(null));
    }

    openModal(content: TemplateRef<any>, footer: TemplateRef<any>): void {
        this.modalRef = this.modalService.create({
            kbqSize: ModalSize.Medium,
            kbqContent: content,
            kbqFooter: footer
        });
    }

    protected save(): void {
        this.modalRef?.close();
    }

    protected close(): void {
        this.modalRef?.close();
    }

    protected checkConnection(): void {
        if (this.server.invalid) {
            this.server.markAsTouched();

            return;
        }

        this.checking.set(true);

        setTimeout(() => {
            this.previousConnectionState = !this.previousConnectionState;

            this.checking.set(false);
            this.checkResult.set(this.previousConnectionState ? 'success' : 'error');
        }, 1500);
    }
}
