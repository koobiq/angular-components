import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

/** Supported alignment values for description list items. */
export type KbqDlAlign = 'start' | 'center' | 'end';

@Component({
    selector: 'kbq-dl',
    template: '<ng-content />',
    styleUrls: ['dl.scss', 'dl-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dl',
        '[class.kbq-dl_vertical]': 'vertical',
        '[class.kbq-dl_wide]': 'wide()',
        '[class.kbq-dl_vertical-align-center]': "verticalAlign() === 'center'",
        '[class.kbq-dl_vertical-align-end]': "verticalAlign() === 'end'",
        '[class.kbq-dl_horizontal-align-center]': "horizontalAlign() === 'center'",
        '[class.kbq-dl_horizontal-align-end]': "horizontalAlign() === 'end'",
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqDlComponent implements AfterContentInit, OnDestroy {
    readonly minWidth = input<number>(400);
    readonly wide = input(false);
    /** Vertical alignment of `kbq-dt` and `kbq-dd` items. */
    readonly verticalAlign = input<KbqDlAlign>('start');
    /** Horizontal alignment of `kbq-dt` and `kbq-dd` items. */
    readonly horizontalAlign = input<KbqDlAlign>('start');
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input() vertical: boolean | null = null;

    readonly resizeStream = new Subject<Event>();
    private readonly resizeDebounceInterval: number = 100;

    private resizeSubscription = Subscription.EMPTY;

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly platform = inject(Platform);

    ngAfterContentInit(): void {
        if (this.vertical !== null || !this.platform.isBrowser) {
            return;
        }

        this.resizeSubscription = this.resizeStream
            .pipe(startWith(null), debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateState);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
    }

    private readonly updateState = (): void => {
        const domRect = this.elementRef.nativeElement.getClientRects()[0];
        const width = domRect?.width || 0;

        this.vertical = width <= this.minWidth();

        this.changeDetectorRef.markForCheck();
    };
}

@Component({
    selector: 'kbq-dt',
    template: '<ng-content />',
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dt'
    }
})
export class KbqDtComponent {}

@Component({
    selector: 'kbq-dd',
    template: '<ng-content />',
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dd'
    }
})
export class KbqDdComponent {}
