import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Tabs vertical
 */
@Component({
    standalone: true,
    selector: 'tabs-vertical-example',
    imports: [
        KbqTabsModule,
        KbqIconModule,
        KbqTitleModule
    ],
    template: `
        <div class="example-tabs-vertical">
            <kbq-tab-group vertical>
                @for (tab of tabs; track tab) {
                    <kbq-tab>
                        <ng-template kbq-tab-label>
                            <i kbq-icon="kbq-bug_16"></i>
                            <div class="example-tab-label" kbq-title>{{ tab }}</div>
                        </ng-template>
                        <p>
                            In computing [{{ $index }}], a denial-of-service attack (DoS attack) is a cyber-attack in
                            which the perpetrator seeks to make a machine or network resource unavailable to its
                            intended users by temporarily or indefinitely disrupting services of a host connected to a
                            network. Denial of service is typically accomplished by flooding the targeted machine or
                            resource with superfluous requests in an attempt to overload systems and prevent some or all
                            legitimate requests from being fulfilled. The range of attacks varies widely, spanning from
                            inundating a server with millions of requests to slow its performance, overwhelming a server
                            with a substantial amount of invalid data, to submitting requests with an illegitimate IP
                            address.
                        </p>
                        <p>
                            In a distributed denial-of-service attack [{{ $index }}] (DDoS attack), the incoming traffic
                            flooding the victim originates from many different sources. More sophisticated strategies
                            are required to mitigate this type of attack; simply attempting to block a single source is
                            insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of
                            people crowding the entry door of a shop, making it hard for legitimate customers to enter,
                            thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks
                            often target sites or services hosted on high-profile web servers such as banks or credit
                            card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these
                            attacks.
                        </p>
                    </kbq-tab>
                }
            </kbq-tab-group>
        </div>
    `,
    styleUrls: ['tabs-vertical-example.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsVerticalExample {
    readonly tabs = [
        'Complex Attack',
        'HIPS alert',
        'IDS/IPS Alert',
        'Vulnerability Exploitation'
    ];
}
