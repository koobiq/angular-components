import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * Element to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    standalone: true,
    imports: [KbqIconModule],
    selector: 'kbq-cleaner',
    exportAs: 'kbqCleaner',
    template: `
        <ng-content>
            <i [autoColor]="true" [color]="'contrast-fade'" kbq-icon="kbq-xmark-circle_16"></i>
        </ng-content>
    `,
    styleUrls: ['cleaner.scss'],
    host: {
        class: 'kbq-cleaner',
        '[attr.tabindex]': 'tabindex'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCleaner implements AfterViewInit, OnDestroy {
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    protected readonly focusMonitor = inject(FocusMonitor);

    @Input({ transform: numberAttribute }) tabindex: number = 0;

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.nativeElement);
    }
}
