import { CdkTrapFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    ScrollStrategy
} from '@angular/cdk/overlay';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    InjectionToken,
    Input,
    OnInit,
    Output,
    TemplateRef,
    Type,
    ViewChild,
    ViewEncapsulation,
    booleanAttribute,
    inject,
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    KbqComponentColors,
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { merge } from 'rxjs';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherTree } from './app-switcher-tree';
import { KbqAppSwitcherTreeNodePadding, KbqAppSwitcherTreeOption } from './app-switcher-tree-option';

export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = {
    docs: 'app',
    src: {
        'aria-describer': 'ts',
        'aria-describer.spec': 'ts',
        'aria-reference': 'ts',
        'aria-reference.spec': 'ts'
    },
    documentation: {
        source: '',
        tools: ''
    },
    mosaic: {
        autocomplete: '',
        button: '',
        'button-toggle': '',
        index: 'ts',
        package: 'json',
        version: 'ts'
    },
    'components-dev': {
        alert: '',
        badge: ''
    },
    scripts: {
        'cleanup-preview': 'ts',
        'publish-artifacts': 'sh',
        'publish-docs': 'sh',
        'publish-docs-preview': 'ts'
    },
    tests: ''
};

@Component({
    standalone: true,
    selector: 'kbq-app-switcher',
    templateUrl: './app-switcher.html',
    preserveWhitespaces: false,
    styleUrls: ['./app-switcher.scss'],
    host: {
        class: 'kbq-app-switcher'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqDividerModule,
        KbqAppSwitcherTree,
        KbqBadgeModule,
        KbqIcon,
        KbqTreeModule,
        KbqAppSwitcherTreeOption,
        KbqAppSwitcherTreeNodePadding
    ],
    animations: [kbqAppSwitcherAnimations.state]
})
export class KbqAppSwitcher extends KbqPopUp implements AfterViewInit {
    protected readonly componentColors = KbqComponentColors;

    searchValue: string = '';
    withSearch: boolean = true;
    withSites: boolean = true;

    prefix = 'kbq-app-switcher';

    trigger: KbqAppSwitcherTrigger;

    isTrapFocus: boolean = false;

    @ViewChild('appSwitcherContent') appSwitcherContent: ElementRef<HTMLDivElement>;
    @ViewChild('appSwitcher') elementRef: ElementRef;
    @ViewChild(CdkTrapFocus) cdkTrapFocus: CdkTrapFocus;

    constructor() {
        super();

        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    ngAfterViewInit() {
        if (!this.appSwitcherContent) {
            return;
        }

        this.cdkTrapFocus.focusTrap.focusFirstTabbableElement();
        this.visibleChange.subscribe((state) => {
            if (this.offset !== null && state) {
                applyPopupMargins(
                    this.renderer,
                    this.elementRef.nativeElement,
                    this.prefix,
                    `${this.offset!.toString()}px`
                );
            }
        });
    }

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}

export const KBQ_APP_SWITCHER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-app-switcher-scroll-strategy'
);

/** @docs-private */
export function kbqAppSwitcherScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_APP_SWITCHER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqAppSwitcherScrollStrategyFactory
};

@Directive({
    standalone: true,
    selector: '[kbqAppSwitcher]',
    exportAs: 'kbqAppSwitcher',
    host: {
        '[class.kbq-app-switcher_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class KbqAppSwitcherTrigger extends KbqPopUpTrigger<KbqAppSwitcher> implements AfterContentInit, OnInit {
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_APP_SWITCHER_SCROLL_STRATEGY);

    // not used
    arrow: boolean = false;
    customClass: string;
    private hasBackdrop: boolean = false;
    private size: PopUpSizes = PopUpSizes.Medium;
    content: string | TemplateRef<any>;
    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;
    private closeOnScroll: null;

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);

        if (this._disabled) {
            this.hide();
        }
    }

    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    protected originSelector = '.kbq-app-switcher';

    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'kbq-app-switcher__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.scrollable
            ?.elementScrolled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.hideIfNotInViewPort);
    }

    ngAfterContentInit(): void {
        if (this.closeOnScroll === null) {
            this.scrollDispatcher.scrolled().subscribe((scrollable: CdkScrollable | void) => {
                if (!scrollable?.getElementRef().nativeElement.classList.contains('kbq-hide-nested-popup')) return;

                const parentRects = scrollable.getElementRef().nativeElement.getBoundingClientRect();
                const childRects = this.elementRef.nativeElement.getBoundingClientRect();

                if (childRects.bottom < parentRects.top || childRects.top > parentRects.bottom) {
                    this.hide();
                }
            });
        }
    }

    updateData() {
        if (!this.instance) return;

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;
        this.instance.footer = this.footer;

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    /** Updates the current position. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getAdjustedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    getOverlayHandleComponentType(): Type<KbqAppSwitcher> {
        return KbqAppSwitcher;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) return;

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    closingActions() {
        return merge(
            this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.backdropClick(),
            this.scrollDispatcher.scrolled()
        );
    }

    private hideIfNotInViewPort = () => {
        if (!this.scrollable) return;

        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const containerRect = this.scrollable.getElementRef().nativeElement.getBoundingClientRect();

        if (
            !(
                rect.bottom >= containerRect.top &&
                rect.right >= containerRect.left &&
                rect.top <= containerRect.bottom &&
                rect.left <= containerRect.right
            )
        ) {
            this.hide();
        }
    };
}
