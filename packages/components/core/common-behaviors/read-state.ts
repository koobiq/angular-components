import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
    standalone: true,
    host: {
        '(mouseenter)': 'mouseenterHandler()',
        '(mouseleave)': 'mouseleaveHandler()',
        '(click)': 'read.next(true)'
    }
})
export class KbqReadStateDirective {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    timestamp: number;
    timeToRead: number = 500;

    readonly read = new BehaviorSubject<boolean>(false);

    mouseenterHandler() {
        this.timestamp = new Date().getTime();
    }

    mouseleaveHandler() {
        if (new Date().getTime() - this.timestamp > this.timeToRead) {
            this.read.next(true);
        }

        this.changeDetectorRef.markForCheck();
    }
}
