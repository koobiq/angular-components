import { ScrollDispatcher } from '@angular/cdk/overlay';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { AnchorsModule } from '../anchors/anchors.module';
import { CodeSnippet } from '../code-snippet/code-snippet';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { DocsLiveExampleModule } from '../docs-live-example/docs-live-example-module';
import { DocumentationItems } from '../documentation-items';
import { DocStates } from '../doс-states';
import { NavbarModule } from '../navbar';
import { SidenavModule } from '../sidenav/sidenav.module';

@Component({
    standalone: true,
    selector: 'docs-component-viewer',
    template: `
        <div class="docs-component-header">
            <div class="docs-component-name" docs-header>
                {{ docItem.name }}
            </div>
            <div class="docs-component-navbar layout-padding-top-s">
                <nav [tabNavPanel]="tabNavPanel" kbqTabNavBar>
                    @for (link of links; track link) {
                        <a [routerLink]="link.value" kbqTabLink routerLinkActive="kbq-selected">
                            {{ link.viewValue }}
                        </a>
                    }
                </nav>
            </div>
        </div>

        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel>
            <router-outlet />
        </div>
    `,
    styleUrls: ['../component-viewer/component-viewer.scss'],
    host: {
        class: 'docs-component-viewer kbq-scrollbar',
        '[attr.data-docsearch-category]': 'docCategoryName'
    },
    imports: [
        AnchorsModule,
        KbqTabsModule,
        RouterModule,
        DocsLiveExampleModule,
        SidenavModule,
        NavbarModule,
        CodeSnippet
    ],
    encapsulation: ViewEncapsulation.None
})
export class DesignTokensViewer extends ComponentViewerComponent implements OnInit, OnDestroy {
    links = [
        { viewValue: 'Цвета', value: 'colors' },
        { viewValue: 'Тени', value: 'shadows' },
        { viewValue: 'Скругления', value: 'border-radius' },
        { viewValue: 'Размеры', value: 'sizes' },
        { viewValue: 'Типографика', value: 'typography' }
    ];

    constructor(
        routeActivated: ActivatedRoute,
        router: Router,
        docItems: DocumentationItems,
        sidepanelService: KbqSidepanelService,
        modalService: KbqModalService,
        docStates: DocStates,
        elementRef: ElementRef<HTMLElement>,
        scrollDispatcher: ScrollDispatcher,
        ngZone: NgZone
    ) {
        super(
            routeActivated,
            router,
            docItems,
            sidepanelService,
            modalService,
            docStates,
            elementRef,
            scrollDispatcher,
            ngZone
        );
    }
}
