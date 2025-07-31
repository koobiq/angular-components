import {
    booleanAttribute,
    Component,
    Directive,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    Optional,
    SimpleChanges
} from '@angular/core';
import { KbqSidepanelRef } from './sidepanel-ref';
import { KbqSidepanelService } from './sidepanel.service';

/**
 * Button that will close the current sidepanel.
 */
@Directive({
    selector: 'button[kbq-sidepanel-close], button[kbqSidepanelClose]',
    host: {
        '(click)': 'sidepanelRef.close(sidepanelResult)',
        class: 'kbq-sidepanel-close'
    }
})
export class KbqSidepanelClose implements OnInit, OnChanges {
    @Input('kbq-sidepanel-close') sidepanelResult: any;

    @Input() kbqSidepanelClose: any;

    constructor(
        @Optional() public sidepanelRef: KbqSidepanelRef,
        private elementRef: ElementRef<HTMLElement>,
        private sidepanelService: KbqSidepanelService
    ) {}

    ngOnInit() {
        if (!this.sidepanelRef) {
            // When this directive is included in a sidepanel via TemplateRef (rather than being
            // in a Component), the SidepanelRef isn't available via injection because embedded
            // views cannot be given a custom injector. Instead, we look up the SidepanelRef by
            // ID.
            // This must occur in `onInit`, as the ID binding for the sidepanel container won't
            // be resolved at constructor time. We use setTimeout by same reason.
            setTimeout(() => {
                this.sidepanelRef = getClosestSidepanel(this.elementRef, this.sidepanelService.openedSidepanels)!;
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const proxiedChange = changes.kbqSidepanelClose || changes.sidepanelResult;

        if (proxiedChange) {
            this.sidepanelResult = proxiedChange.currentValue;
        }
    }
}

/**
 * Header of a sidepanel.
 */
@Component({
    selector: 'kbq-sidepanel-header',
    template: `
        <div class="kbq-sidepanel-title" kbq-title>
            <ng-content />
        </div>

        @if (closeable) {
            <button kbq-button kbq-sidepanel-close [color]="'contrast'" [kbqStyle]="'transparent'">
                <i kbq-icon="kbq-xmark_16" [color]="'contrast'"></i>
            </button>
        }
    `,
    host: {
        class: 'kbq-sidepanel-header',
        '[class.kbq-sidepanel-header_truncate-text]': 'truncateText'
    }
})
export class KbqSidepanelHeader {
    /** Add button for close sidepanel. Default false */
    @Input({ transform: booleanAttribute }) closeable: boolean = false;

    /** Enables text truncation. Default true */
    @Input({ transform: booleanAttribute }) truncateText: boolean = true;
}

/**
 * Scrollable content container of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-body, [kbq-sidepanel-body], kbqSidepanelBody',
    host: {
        class: 'kbq-sidepanel-body kbq-scrollbar'
    }
})
export class KbqSidepanelBody {}

/**
 * Footer of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-footer, [kbq-sidepanel-footer], kbqSidepanelFooter',
    host: {
        class: 'kbq-sidepanel-footer'
    }
})
export class KbqSidepanelFooter {}

/**
 * Actions block of a sidepanel footer.
 */
@Directive({
    selector: 'kbq-sidepanel-actions, [kbq-sidepanel-actions], kbqSidepanelActions',
    host: {
        class: 'kbq-sidepanel-actions'
    }
})
export class KbqSidepanelActions {}

/**
 * Finds the closest KbqSidepanelRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a sidepanel.
 * @param openSidepanels References to the currently-open sidepanels.
 */
function getClosestSidepanel(element: ElementRef<HTMLElement>, openSidepanels: KbqSidepanelRef[]) {
    let parent: HTMLElement | null = element.nativeElement.parentElement;

    while (parent && !parent.classList.contains('kbq-sidepanel-container')) {
        parent = parent.parentElement;
    }

    return parent ? openSidepanels.find((sidepanel) => sidepanel.id === parent!.id) : null;
}
