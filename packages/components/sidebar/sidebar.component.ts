import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { isControl, isInput, isLeftBracket, isRightBracket } from '@koobiq/cdk/keycodes';
import { kbqSidebarAnimations, KbqSidebarAnimationState } from './sidebar-animations';

export enum SidebarPositions {
    Left = 'left',
    Right = 'right'
}

interface KbqSidebarParams {
    openedStateMinWidth: string;
    openedStateWidth: string;
    openedStateMaxWidth: string;

    closedStateWidth: string;
}

@Directive({
    selector: '[kbq-sidebar-opened]',
    exportAs: 'kbqSidebarOpened',
    host: {
        class: 'kbq-sidebar-opened'
    }
})
export class KbqSidebarOpened {
    @Input() minWidth: string;
    @Input() width: string;
    @Input() maxWidth: string;
}

@Directive({
    selector: '[kbq-sidebar-closed]',
    exportAs: 'kbqSidebarClosed',
    host: {
        class: 'kbq-sidebar-closed'
    }
})
export class KbqSidebarClosed {
    @Input() width: string;
}

@Component({
    selector: 'kbq-sidebar',
    exportAs: 'kbqSidebar',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.scss'],
    host: {
        class: 'kbq-sidebar',
        '[@state]': `{
            value: animationState,
            params: params
        }`,
        '(@state.start)': 'onAnimationStart()',
        '(@state.done)': 'onAnimationDone()'
    },
    animations: [kbqSidebarAnimations.sidebarState],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSidebar implements OnDestroy, OnInit, AfterContentInit {
    protected readonly document = inject<Document>(DOCUMENT);

    @Input()
    get opened(): boolean {
        return this._opened;
    }

    set opened(value: boolean) {
        if (this._opened) {
            this.saveWidth();
        }

        this._opened = value;
    }
    private _opened: boolean = true;

    @Input() position: SidebarPositions;

    params: KbqSidebarParams = {
        openedStateWidth: 'inherit',
        openedStateMinWidth: 'inherit',
        openedStateMaxWidth: 'inherit',

        closedStateWidth: '32px'
    };

    @Output() readonly stateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ContentChild(KbqSidebarOpened, { static: false }) openedContent: KbqSidebarOpened;

    @ContentChild(KbqSidebarClosed, { static: false }) closedContent: KbqSidebarClosed;

    get animationState(): KbqSidebarAnimationState {
        return this._opened ? KbqSidebarAnimationState.Opened : KbqSidebarAnimationState.Closed;
    }

    internalState: boolean = true;

    private documentKeydownListener: (event: KeyboardEvent) => void;

    constructor(
        private ngZone: NgZone,
        private elementRef: ElementRef
    ) {}

    ngOnInit(): void {
        if (this.position === SidebarPositions.Left || this.position === SidebarPositions.Right) {
            this.registerKeydownListener();
        }
    }

    ngOnDestroy(): void {
        if (this.position === SidebarPositions.Left || this.position === SidebarPositions.Right) {
            this.unRegisterKeydownListener();
        }
    }

    toggle(): void {
        this.opened = !this.opened;
    }

    onAnimationStart() {
        if (this._opened) {
            this.internalState = this._opened;
        }
    }

    onAnimationDone() {
        this.internalState = this._opened;

        this.stateChanged.emit(this._opened);
    }

    ngAfterContentInit(): void {
        this.params = {
            openedStateWidth: this.openedContent.width || 'inherit',
            openedStateMinWidth: this.openedContent.minWidth || 'inherit',
            openedStateMaxWidth: this.openedContent.maxWidth || 'inherit',

            closedStateWidth: this.closedContent.width || '32px'
        };
    }

    private registerKeydownListener(): void {
        this.documentKeydownListener = (event) => {
            if (isControl(event) || isInput(event)) return;

            if (
                (this.position === SidebarPositions.Left && isLeftBracket(event)) ||
                (this.position === SidebarPositions.Right && isRightBracket(event))
            ) {
                this.ngZone.run(() => (this._opened = !this._opened));
            }
        };

        this.ngZone.runOutsideAngular(() => {
            this.document.addEventListener('keypress', this.documentKeydownListener, true);
        });
    }

    private unRegisterKeydownListener(): void {
        this.document.removeEventListener('keypress', this.documentKeydownListener, true);
    }

    private saveWidth() {
        this.params.openedStateWidth = `${this.elementRef.nativeElement.offsetWidth}px`;
    }
}
