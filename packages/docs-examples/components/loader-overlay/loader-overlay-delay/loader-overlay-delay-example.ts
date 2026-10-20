import { ChangeDetectionStrategy, Component, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { kbqDelayLoadingIndicator } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { switchMap, timer } from 'rxjs';

/**
 * @title Loader-overlay delay
 */
@Component({
    selector: 'loader-overlay-delay-example',
    imports: [KbqLoaderOverlayModule, KbqButtonModule, KbqButtonToggleModule, KbqToggleModule, FormsModule],
    template: `
        <div class="example__controls">
            <kbq-toggle [(ngModel)]="delay">Display delay</kbq-toggle>

            <kbq-button-toggle-group aria-label="Request duration" [(ngModel)]="duration">
                <kbq-button-toggle [value]="200">200 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="600">600 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="2000">2 s</kbq-button-toggle>
            </kbq-button-toggle-group>

            <button kbq-button [disabled]="loading()" (click)="load()">Refresh</button>
        </div>

        <div class="example__card">
            <div class="kbq-text-normal">Updates</div>
            <div class="kbq-display-compact">{{ updates() }}</div>
            @if (showOverlay()) {
                <kbq-loader-overlay size="compact" text="Updating..." />
            }
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .example__controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--kbq-size-l);
        }

        .example__card {
            padding: var(--kbq-size-l);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayDelayExample {
    private readonly destroyRef = inject(DestroyRef);
    protected readonly delay = model(true);
    protected readonly duration = model(200);
    protected readonly updates = signal(0);
    protected readonly loading = signal(false);
    private readonly loading$ = toObservable(this.loading);
    protected readonly showOverlay = toSignal(
        toObservable(this.delay).pipe(
            switchMap((delay) => (delay ? this.loading$.pipe(kbqDelayLoadingIndicator()) : this.loading$))
        ),
        { initialValue: false }
    );

    protected load(): void {
        this.loading.set(true);

        timer(this.duration())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.updates.update((value) => value + 1);
                this.loading.set(false);
            });
    }
}
