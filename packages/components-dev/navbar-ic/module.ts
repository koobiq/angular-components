import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarIc, KbqNavbarIcModule } from '@koobiq/components/navbar-ic';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { map, timer } from 'rxjs';
import { NavbarIcExamplesModule } from '../../docs-examples/components/navbar-ic';

@Component({
    standalone: true,
    imports: [NavbarIcExamplesModule],
    selector: 'dev-examples',
    template: `
        <navbar-ic-overview-example />
        <br />
        <br />
        <navbar-ic-long-app-name-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        KbqNavbarIcModule,
        KbqIconModule,
        KbqButtonModule,
        FormsModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqPopoverModule,
        KbqToolTipModule,
        KbqBadgeModule,
        AsyncPipe,
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    popUpPlacements = PopUpPlacements;

    @ViewChild('navbar', { static: false }) navbar: KbqNavbarIc;

    permission$ = timer(500).pipe(map(() => true));
}
