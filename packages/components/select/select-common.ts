import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    ElementRef,
    inject,
    Renderer2
} from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'kbq-select-loading, [kbq-select-loading]',
    imports: [
        KbqProgressSpinnerModule
    ],
    template: `
        <ng-content select="kbq-progress-spinner">
            <div class="layout-row layout-margin-top-4xl layout-margin-bottom-4xl layout-align-center-center">
                <kbq-progress-spinner [mode]="'indeterminate'" />
            </div>
        </ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectLoading',
    host: {
        class: 'kbq-select-loading'
    }
})
export class KbqSelectLoading {}

@Component({
    selector: 'kbq-select-error, [kbq-select-error]',
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            margin-bottom: var(--kbq-size-3xl);
            margin-top: var(--kbq-size-3xl);
        }

        ::ng-deep .kbq-select-error__text {
            margin-top: var(--kbq-size-xs);
            margin-bottom: var(--kbq-size-3xs);
            color: var(--kbq-foreground-error);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectError',
    host: {
        class: 'kbq-select-error'
    }
})
export class kbqSelectError implements AfterContentInit {
    private readonly renderer = inject(Renderer2);
    private readonly textElementRef = contentChild('errorText', { read: ElementRef });

    ngAfterContentInit(): void {
        if (this.textElementRef()) {
            this.renderer.addClass(this.textElementRef()!.nativeElement, 'kbq-select-error__text');
        }
    }
}

@Component({
    selector: 'kbq-select-no-options, [kbq-select-no-options]',
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            padding-bottom: var(--kbq-size-3xl);
            padding-top: var(--kbq-size-3xl);

            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectNoOptions',
    host: {
        class: 'kbq-select-no-options'
    }
})
export class kbqSelectNoOptions {}
