import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemePalette } from '@koobiq/components/core';
import { KbqModalService } from '@koobiq/components/modal';
import { BehaviorSubject, Subject, auditTime, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { IconItem, IconItems } from 'src/app/components/icons-items/icon-items';
import { DocStates } from '../../components/doс-states';
import { IconPreviewModalComponent } from './icon-preview-modal/icon-preview-modal.component';

const SEARCH_DEBOUNCE_TIME = 300;

@Component({
    selector: 'docs-icons-viewer',
    templateUrl: './icons-viewer.template.html',
    styleUrls: ['./icons-viewer.scss'],
    host: {
        class: 'docs-icons-viewer kbq-scrollbar',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class IconsViewerComponent implements OnDestroy {
    themePalette = ThemePalette;

    searchControl = new FormControl<string>('');
    filteredIcons: BehaviorSubject<IconItem[] | undefined>;

    availableSizes: number[];

    private iconItems: IconItems;
    private queryParamMap: { [key: string]: string };

    private destroy: Subject<void> = new Subject<void>();

    constructor(
        private http: HttpClient,
        private modalService: KbqModalService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private titleService: Title,
        private docStates: DocStates,
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef,
    ) {
        this.http.get('assets/SVGIcons/mc-icons-info.json', { responseType: 'json' }).subscribe((data) => {
            this.iconItems = new IconItems(data);

            this.availableSizes = Array.from(this.iconItems.sizes).sort((a, b) => a - b);

            this.init();
            this.refreshTitle(undefined);

            this.changeDetectorRef.markForCheck();
        });

        this.location.subscribe(() => this.modalService.closeAll());

        this.activeRoute.queryParamMap.subscribe(({ params }: any) => (this.queryParamMap = params));

        this.docStates.registerHeaderScrollContainer(elementRef.nativeElement);
    }

    init() {
        this.filteredIcons = new BehaviorSubject([]);

        this.searchControl.valueChanges
            .pipe(
                auditTime(SEARCH_DEBOUNCE_TIME),
                distinctUntilChanged(),
                map((value) => {
                    this.syncSearchQuery(value);

                    if (!value) {
                        return this.iconItems.getItems();
                    }

                    const lowered = value?.toLowerCase() || '';

                    const items = this.iconItems
                        .getItems()
                        .filter(
                            (item) =>
                                item.name.toLowerCase().includes(lowered) ||
                                item.tags.some((tag) => tag.toLowerCase().includes(lowered)),
                        );

                    return items.length ? items : undefined;
                }),
                takeUntil(this.destroy),
            )
            .subscribe((filteredItems) => this.filteredIcons.next(filteredItems));

        this.activeRoute.queryParams.subscribe((params) => {
            if (params.id) {
                const iconItem = this.iconItems.getItemById(params.id);

                if (iconItem) {
                    this.openIconPreview(iconItem);
                } else {
                    this.setActiveIcon(undefined);
                }

                return;
            }

            this.searchControl.setValue(params.s);
        });
    }

    filterBySize(icons: IconItem[], size: number): IconItem[] {
        return icons.filter((iconItem: IconItem) => iconItem.size === size);
    }

    setActiveIcon(iconItem: IconItem | undefined): void {
        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: {
                id: iconItem?.id,
                s: this.searchControl.value ? this.searchControl.value : undefined,
            },
        });

        this.refreshTitle(iconItem);
    }

    openIconPreview(iconItem: IconItem): void {
        this.modalService
            .open({
                kbqComponent: IconPreviewModalComponent,
                kbqComponentParams: { iconItem },
                kbqClassName: 'icon-preview-modal',
                kbqWidth: 400,
            })
            .afterClose.subscribe((result: string) => {
                if (result) {
                    this.searchControl.setValue(result);
                }

                this.setActiveIcon(undefined);
            });
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
    }

    private syncSearchQuery(value: string) {
        if (value === this.queryParamMap.s) {
            return;
        }

        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: { s: value || undefined },
            queryParamsHandling: 'merge',
        });
    }

    private refreshTitle(activeIcon: IconItem | undefined): void {
        this.titleService.setTitle(`${activeIcon ? `${activeIcon.name} \u00B7 ` : ''} Icon \u00B7 Mosaic`);
    }
}
