import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    Renderer2,
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
export class KbqSidebar implements OnDestroy, AfterContentInit {
    /**
     * @docs-private
     */
    protected readonly document = inject<Document>(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

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

    /**
     * @docs-private
     */
    params: KbqSidebarParams = {
        openedStateWidth: 'inherit',
        openedStateMinWidth: 'inherit',
        openedStateMaxWidth: 'inherit',

        closedStateWidth: '32px'
    };

    @Output() readonly stateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * @docs-private
     */
    @ContentChild(KbqSidebarOpened, { static: false }) openedContent: KbqSidebarOpened;

    /**
     * @docs-private
     */
    @ContentChild(KbqSidebarClosed, { static: false }) closedContent: KbqSidebarClosed;

    /**
     * @docs-private
     */
    get animationState(): KbqSidebarAnimationState {
        return this._opened ? KbqSidebarAnimationState.Opened : KbqSidebarAnimationState.Closed;
    }

    /**
     * @docs-private
     */
    internalState: boolean = true;

    private unbindKeydownListener: ReturnType<Renderer2['listen']> | null = null;

    constructor(
        private ngZone: NgZone,
        private elementRef: ElementRef
    ) {
        afterNextRender(() => this.registerKeydownListener());
    }

    ngOnDestroy(): void {
        this.unRegisterKeydownListener();
    }

    ngAfterContentInit(): void {
        this.params = {
            openedStateWidth: this.openedContent.width || 'inherit',
            openedStateMinWidth: this.openedContent.minWidth || 'inherit',
            openedStateMaxWidth: this.openedContent.maxWidth || 'inherit',

            closedStateWidth: this.closedContent.width || '32px'
        };
    }

    toggle(): void {
        this.opened = !this.opened;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * @docs-private
     */
    onAnimationStart() {
        if (this._opened) {
            this.internalState = this._opened;
        }
    }

    /**
     * @docs-private
     */
    onAnimationDone() {
        this.internalState = this._opened;

        this.stateChanged.emit(this._opened);
    }

    private registerKeydownListener(): void {
        this.ngZone.runOutsideAngular(() => {
            this.unbindKeydownListener ||= this.renderer.listen(this.document, 'keypress', (event) =>
                this.handleKeydown(event)
            );
        });
    }

    private unRegisterKeydownListener(): void {
        if (this.unbindKeydownListener) {
            this.unbindKeydownListener();
            this.unbindKeydownListener = null;
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (isControl(event) || isInput(event)) return;

        if (
            (this.position === SidebarPositions.Left && isLeftBracket(event)) ||
            (this.position === SidebarPositions.Right && isRightBracket(event))
        ) {
            this.toggle();
        }
    }

    private saveWidth() {
        this.params.openedStateWidth = `${this.elementRef.nativeElement.offsetWidth}px`;
    }
}
