import { AfterContentInit, Component, ElementRef, inject, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'kbq-dl',
    template: '<ng-content />',
    styleUrls: ['dl.scss', 'dl-tokens.scss'],
    host: {
        class: 'kbq-dl',
        '[class.kbq-dl_vertical]': 'vertical',
        '[class.kbq-dl_wide]': 'wide',
        '(window:resize)': 'resizeStream.next($event)'
    },
    encapsulation: ViewEncapsulation.None
})
export class KbqDlComponent implements AfterContentInit, OnDestroy {
    @Input() minWidth: number = 400;
    @Input() wide = false;
    @Input() vertical: boolean | null = null;

    readonly resizeStream = new Subject<Event>();
    private readonly resizeDebounceInterval: number = 100;

    private resizeSubscription = Subscription.EMPTY;

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    ngAfterContentInit(): void {
        if (this.vertical !== null) {
            return;
        }

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateState);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
    }

    private readonly updateState = (): void => {
        const domRect = this.elementRef.nativeElement.getClientRects()[0];
        const width = domRect?.width || 0;
        this.vertical = width <= this.minWidth;
    };
}

@Component({
    selector: 'kbq-dt',
    template: '<ng-content />',
    host: {
        class: 'kbq-dt'
    },
    encapsulation: ViewEncapsulation.None
})
export class KbqDtComponent {}

@Component({
    selector: 'kbq-dd',
    template: '<ng-content />',
    host: {
        class: 'kbq-dd'
    },
    encapsulation: ViewEncapsulation.None
})
export class KbqDdComponent {}
