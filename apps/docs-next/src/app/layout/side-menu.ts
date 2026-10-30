import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { DocsNextMenuGroup, docsNextMenuGroups } from '../data/menu';
import { DocsNextSiteState } from '../services/site-state';

/** Menu of the open section: groups with titles, the open page highlighted, no filter. */
@Component({
    selector: 'docs-next-side-menu',
    imports: [RouterLink, KbqBadgeModule, KbqScrollbar],
    templateUrl: './side-menu.html',
    styleUrl: './side-menu.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { role: 'navigation', '[attr.aria-label]': 'state.t("sectionMenu")' }
})
export class DocsNextSideMenu {
    protected readonly state = inject(DocsNextSiteState);

    /** Address of the open page without its subsection: a component stays selected on any of its tabs. */
    protected readonly current = computed(() => this.state.rest().slice(0, 2).join('/'));

    protected readonly groups = computed<DocsNextMenuGroup[]>(() =>
        docsNextMenuGroups(this.state.section() ?? '', this.state.locale(), this.state.framework())
    );
}
