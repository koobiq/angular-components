import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs vertical icons
 */
@Component({
    standalone: true,
    selector: 'tabs-vertical-icons-example',
    styleUrls: ['tabs-vertical-icons-example.css'],
    imports: [
        KbqTabsModule,
        KbqIconModule
    ],
    template: `
        <div class="example-tabs-vertical-icons">
            <kbq-tab-group vertical>
                <kbq-tab tooltipTitle="BruteForce" empty [tooltipPlacement]="PopUpPlacements.Left">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                    <p>
                        In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator
                        seeks to make a machine or network resource unavailable to its intended users by temporarily or
                        indefinitely disrupting services of a host connected to a network. Denial of service is
                        typically accomplished by flooding the targeted machine or resource with superfluous requests in
                        an attempt to overload systems and prevent some or all legitimate requests from being fulfilled.
                        The range of attacks varies widely, spanning from inundating a server with millions of requests
                        to slow its performance, overwhelming a server with a substantial amount of invalid data, to
                        submitting requests with an illegitimate IP address.
                    </p>
                    <p>
                        In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the
                        victim originates from many different sources. More sophisticated strategies are required to
                        mitigate this type of attack; simply attempting to block a single source is insufficient as
                        there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the
                        entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade
                        and losing the business money. Criminal perpetrators of DoS attacks often target sites or
                        services hosted on high-profile web servers such as banks or credit card payment gateways.
                        Revenge and blackmail, as well as hacktivism, can motivate these attacks.
                    </p>
                </kbq-tab>
                <kbq-tab tooltipTitle="Complex Attack" empty [tooltipPlacement]="PopUpPlacements.Left">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                    <p>
                        In cryptography, a brute-force attack consists of an attacker submitting many passwords or
                        passphrases with the hope of eventually guessing correctly. The attacker systematically checks
                        all possible passwords and passphrases until the correct one is found. Alternatively, the
                        attacker can attempt to guess the key which is typically created from the password using a key
                        derivation function. This is known as an exhaustive key search. This approach doesn't depend on
                        intellectual tactics; rather, it relies on making several attempts.
                    </p>
                    <p>
                        A brute-force attack is a cryptanalytic attack that can, in theory, be used to attempt to
                        decrypt any encrypted data (except for data encrypted in an information-theoretically secure
                        manner). Such an attack might be used when it is not possible to take advantage of other
                        weaknesses in an encryption system (if any exist) that would make the task easier.
                    </p>
                </kbq-tab>
                <kbq-tab tooltipTitle="DDoS" empty [tooltipPlacement]="PopUpPlacements.Left">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                    <p>
                        In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator
                        seeks to make a machine or network resource unavailable to its intended users by temporarily or
                        indefinitely disrupting services of a host connected to a network. Denial of service is
                        typically accomplished by flooding the targeted machine or resource with superfluous requests in
                        an attempt to overload systems and prevent some or all legitimate requests from being fulfilled.
                        The range of attacks varies widely, spanning from inundating a server with millions of requests
                        to slow its performance, overwhelming a server with a substantial amount of invalid data, to
                        submitting requests with an illegitimate IP address.
                    </p>
                    <p>
                        In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the
                        victim originates from many different sources. More sophisticated strategies are required to
                        mitigate this type of attack; simply attempting to block a single source is insufficient as
                        there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the
                        entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade
                        and losing the business money. Criminal perpetrators of DoS attacks often target sites or
                        services hosted on high-profile web servers such as banks or credit card payment gateways.
                        Revenge and blackmail, as well as hacktivism, can motivate these attacks.
                    </p>
                </kbq-tab>
                <kbq-tab tooltipTitle="DoS" empty [tooltipPlacement]="PopUpPlacements.Left">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                    <p>
                        In cryptography, a brute-force attack consists of an attacker submitting many passwords or
                        passphrases with the hope of eventually guessing correctly. The attacker systematically checks
                        all possible passwords and passphrases until the correct one is found. Alternatively, the
                        attacker can attempt to guess the key which is typically created from the password using a key
                        derivation function. This is known as an exhaustive key search. This approach doesn't depend on
                        intellectual tactics; rather, it relies on making several attempts.
                    </p>
                    <p>
                        A brute-force attack is a cryptanalytic attack that can, in theory, be used to attempt to
                        decrypt any encrypted data (except for data encrypted in an information-theoretically secure
                        manner). Such an attack might be used when it is not possible to take advantage of other
                        weaknesses in an encryption system (if any exist) that would make the task easier.
                    </p>
                </kbq-tab>
            </kbq-tab-group>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsVerticalIconsExample {
    readonly PopUpPlacements = PopUpPlacements;
}
