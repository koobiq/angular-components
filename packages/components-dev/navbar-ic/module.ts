import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule } from '@koobiq/components/modal';
import { KbqNavbarIc, KbqNavbarIcModule } from '@koobiq/components/navbar-ic';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { map, timer } from 'rxjs';

@Component({
    standalone: true,
    imports: [
        KbqNavbarIcModule,
        KbqIconModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqPopoverModule,
        KbqToolTipModule,
        KbqModalModule,
        KbqBadgeModule,
        KbqDividerModule,
        AsyncPipe
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
