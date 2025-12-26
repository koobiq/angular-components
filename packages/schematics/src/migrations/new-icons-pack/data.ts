export interface ReplaceData {
    replace: string;
    replaceWith: string;
    comment?: string;
}

export const iconReplacements: ReplaceData[] = [
    { replace: 'kbq-icon="mc-', replaceWith: 'kbq-icon="kbq-' },
    { replace: 'kbq-icon-item="mc-', replaceWith: 'kbq-icon-item="kbq-' },
    { replace: 'kbq-icon-button="mc-', replaceWith: 'kbq-icon-button="kbq-' },
    { replace: 'class="mc kbq-icon mc-', replaceWith: 'class="kbq kbq-icon kbq-' },
    { replace: 'class="mc kbq-', replaceWith: 'class="kbq kbq-' },
    { replace: "class: 'mc kbq-", replaceWith: "class: 'kbq kbq-" },
    { replace: 'mc mc-', replaceWith: 'kbq kbq-' },
    { replace: '\\[class\\.mc', replaceWith: '[class.kbq' },
    { replace: "'mc-", replaceWith: "'kbq-" },
    { replace: `\\.mc;`, replaceWith: `.kbq;` }
];

export const newIconsPackData: ReplaceData[] = [
    {
        replaceWith: 'kbq-3-columns_32',
        replace: 'kbq-3-columns_32'
    },
    {
        replaceWith: 'kbq-file-plus-o_16',
        replace: 'kbq-add-to-list_16'
    },
    {
        replaceWith: 'kbq-speaker_16',
        replace: 'kbq-alert-disabled_16'
    },
    {
        replaceWith: 'kbq-speaker-wave_16',
        replace: 'kbq-alert-enabled_16'
    },
    {
        replaceWith: 'kbq-align-center_16',
        replace: 'kbq-align-center_16'
    },
    {
        replaceWith: 'kbq-align-left_16',
        replace: 'kbq-align-left_16'
    },
    {
        replaceWith: 'kbq-align-right_16',
        replace: 'kbq-align-right_16'
    },
    {
        replaceWith: 'kbq-android_24',
        replace: 'kbq-android_24'
    },
    {
        replaceWith: 'kbq-chevron-down_16',
        replace: 'kbq-angle-down-L_16'
    },
    {
        replaceWith: 'kbq-chevron-down_24',
        replace: 'kbq-angle-down-L_24'
    },
    {
        replaceWith: 'kbq-chevron-down_16',
        replace: 'kbq-angle-down-M_16'
    },
    {
        replaceWith: 'kbq-chevron-down_24',
        replace: 'kbq-angle-down-M_24'
    },
    {
        replaceWith: 'kbq-chevron-down_32',
        replace: 'kbq-angle-down-M_32'
    },
    {
        replaceWith: 'kbq-chevron-down-s_16',
        replace: 'kbq-angle-down-S_16'
    },
    {
        replaceWith: 'kbq-chevron-left_16',
        replace: 'kbq-angle-left-L_16'
    },
    {
        replaceWith: 'kbq-chevron-left_24',
        replace: 'kbq-angle-left-L_24'
    },
    {
        replaceWith: 'kbq-chevron-left_16',
        replace: 'kbq-angle-left-M_16'
    },
    {
        replaceWith: 'kbq-chevron-left_24',
        replace: 'kbq-angle-left-M_24'
    },
    {
        replaceWith: 'kbq-chevron-left_32',
        replace: 'kbq-angle-left-M_32'
    },
    {
        replaceWith: 'kbq-chevron-left-s_16',
        replace: 'kbq-angle-left-S_16'
    },
    {
        replaceWith: 'kbq-chevron-right_16',
        replace: 'kbq-angle-right-L_16'
    },
    {
        replaceWith: 'kbq-chevron-right_24',
        replace: 'kbq-angle-right-L_24'
    },
    {
        replaceWith: 'kbq-chevron-right_16',
        replace: 'kbq-angle-right-M_16'
    },
    {
        replaceWith: 'kbq-chevron-right_24',
        replace: 'kbq-angle-right-M_24'
    },
    {
        replaceWith: 'kbq-chevron-right_32',
        replace: 'kbq-angle-right-M_32'
    },
    {
        replaceWith: 'kbq-chevron-right-s_16',
        replace: 'kbq-angle-right-S_16'
    },
    {
        replaceWith: 'kbq-chevron-up_16',
        replace: 'kbq-angle-up-L_16'
    },
    {
        replaceWith: 'kbq-chevron-up_24',
        replace: 'kbq-angle-up-L_24'
    },
    {
        replaceWith: 'kbq-chevron-up_16',
        replace: 'kbq-angle-up-M_16'
    },
    {
        replaceWith: 'kbq-chevron-up_24',
        replace: 'kbq-angle-up-M_24'
    },
    {
        replaceWith: 'kbq-chevron-up_32',
        replace: 'kbq-angle-up-M_32'
    },
    {
        replaceWith: 'kbq-chevron-up-s_16',
        replace: 'kbq-angle-up-S_16'
    },
    {
        replaceWith: 'kbq-chevron-down_16',
        replace: 'kbq-angle-down-l_16'
    },
    {
        replaceWith: 'kbq-chevron-down_24',
        replace: 'kbq-angle-down-l_24'
    },
    {
        replaceWith: 'kbq-chevron-down_16',
        replace: 'kbq-angle-down-m_16'
    },
    {
        replaceWith: 'kbq-chevron-down_24',
        replace: 'kbq-angle-down-m_24'
    },
    {
        replace: 'kbq-angle-down-m_32',
        replaceWith: 'kbq-chevron-down_32'
    },
    {
        replaceWith: 'kbq-chevron-down-s_16',
        replace: 'kbq-angle-down-s_16'
    },
    {
        replaceWith: 'kbq-chevron-left_16',
        replace: 'kbq-angle-left-l_16'
    },
    {
        replaceWith: 'kbq-chevron-left_24',
        replace: 'kbq-angle-left-l_24'
    },
    {
        replaceWith: 'kbq-chevron-left_16',
        replace: 'kbq-angle-left-m_16'
    },
    {
        replaceWith: 'kbq-chevron-left_24',
        replace: 'kbq-angle-left-m_24'
    },
    {
        replaceWith: 'kbq-chevron-left_32',
        replace: 'kbq-angle-left-m_32'
    },
    {
        replaceWith: 'kbq-chevron-left-s_16',
        replace: 'kbq-angle-left-s_16'
    },
    {
        replaceWith: 'kbq-chevron-right_16',
        replace: 'kbq-angle-right-l_16'
    },
    {
        replaceWith: 'kbq-chevron-right_24',
        replace: 'kbq-angle-right-l_24'
    },
    {
        replaceWith: 'kbq-chevron-right_16',
        replace: 'kbq-angle-right-m_16'
    },
    {
        replaceWith: 'kbq-chevron-right_24',
        replace: 'kbq-angle-right-m_24'
    },
    {
        replaceWith: 'kbq-chevron-right_32',
        replace: 'kbq-angle-right-m_32'
    },
    {
        replaceWith: 'kbq-chevron-right-s_16',
        replace: 'kbq-angle-right-s_16'
    },
    {
        replaceWith: 'kbq-chevron-up_16',
        replace: 'kbq-angle-up-l_16'
    },
    {
        replaceWith: 'kbq-chevron-up_24',
        replace: 'kbq-angle-up-l_24'
    },
    {
        replaceWith: 'kbq-chevron-up_16',
        replace: 'kbq-angle-up-m_16'
    },
    {
        replaceWith: 'kbq-chevron-up_24',
        replace: 'kbq-angle-up-m_24'
    },
    {
        replaceWith: 'kbq-chevron-up_32',
        replace: 'kbq-angle-up-m_32'
    },
    {
        replaceWith: 'kbq-chevron-up-s_16',
        replace: 'kbq-angle-up-s_16'
    },
    {
        replaceWith: 'kbq-anomaly_16',
        replace: 'kbq-anomaly_16'
    },
    {
        replaceWith: 'kbq-api_16',
        replace: 'kbq-api_16'
    },
    {
        replaceWith: 'kbq-api_24',
        replace: 'kbq-api_24'
    },
    {
        replaceWith: 'kbq-box-archive_16',
        replace: 'kbq-archive_16'
    },
    {
        replaceWith: 'kbq-arrow-left_16',
        replace: 'kbq-arrow-back_16'
    },
    {
        replaceWith: 'kbq-arrow-right_16',
        replace: 'kbq-arrow-forward_16'
    },
    {
        replaceWith: 'kbq-arrow-left-to-line_16',
        replace: 'kbq-arrow-left-terminal_16'
    },
    {
        replaceWith: 'kbq-arrow-right-to-line_16',
        replace: 'kbq-arrow-right-terminal_16'
    },
    {
        replaceWith: 'kbq-arrow-down_16',
        replace: 'kbq-arrow-small-down_16'
    },
    {
        replaceWith: 'kbq-arrow-left_16',
        replace: 'kbq-arrow-small-left_16'
    },
    {
        replaceWith: 'kbq-arrow-right_16',
        replace: 'kbq-arrow-small-right_16'
    },
    {
        replaceWith: 'kbq-arrow-up_16',
        replace: 'kbq-arrow-small-up_16'
    },
    {
        replaceWith: 'kbq-arrow-thin-down_16',
        replace: 'kbq-arrow-thin-down_16'
    },
    {
        replaceWith: 'kbq-arrow-thin-left_16',
        replace: 'kbq-arrow-thin-left_16'
    },
    {
        replaceWith: 'kbq-arrow-thin-right_16',
        replace: 'kbq-arrow-thin-right_16'
    },
    {
        replaceWith: 'kbq-arrow-thin-up_16',
        replace: 'kbq-arrow-thin-up_16'
    },
    {
        replaceWith: 'kbq-signal-stream_16',
        replace: 'kbq-asset-access-point_16'
    },
    {
        replaceWith: 'kbq-signal-stream_24',
        replace: 'kbq-asset-access-point_24'
    },
    {
        replaceWith: 'kbq-user_16',
        replace: 'kbq-asset-account_16'
    },
    {
        replaceWith: 'kbq-user_24',
        replace: 'kbq-asset-account_24'
    },
    {
        replaceWith: 'kbq-active-directory_16',
        replace: 'kbq-asset-active-directory_16'
    },
    {
        replaceWith: 'kbq-active-directory_24',
        replace: 'kbq-asset-active-directory_24'
    },
    {
        replaceWith: 'kbq-aix_16',
        replace: 'kbq-asset-aix_16'
    },
    {
        replaceWith: 'kbq-aix_24',
        replace: 'kbq-asset-aix_24'
    },
    {
        replaceWith: 'kbq-android_16',
        replace: 'kbq-asset-android_16'
    },
    {
        replaceWith: 'kbq-apple_16',
        replace: 'kbq-asset-apple_16'
    },
    {
        replaceWith: 'kbq-apple_24',
        replace: 'kbq-asset-apple_24'
    },
    {
        replaceWith: 'kbq-bsd_16',
        replace: 'kbq-asset-bsd_16'
    },
    {
        replaceWith: 'kbq-bsd_24',
        replace: 'kbq-asset-bsd_24'
    },
    {
        replaceWith: 'kbq-cloud_16',
        replace: 'kbq-asset-cloud_16'
    },
    {
        replaceWith: 'kbq-cloud_24',
        replace: 'kbq-asset-cloud_24'
    },
    {
        replaceWith: 'kbq-desktop_16',
        replace: 'kbq-asset-desktop_16'
    },
    {
        replaceWith: 'kbq-desktop_24',
        replace: 'kbq-asset-desktop_24'
    },
    {
        replaceWith: 'kbq-block-brick_16',
        replace: 'kbq-asset-firewall_16'
    },
    {
        replaceWith: 'kbq-block-brick_24',
        replace: 'kbq-asset-firewall_24'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-asset-host-virtual_16'
    },
    {
        replaceWith: 'kbq-question-circle_24',
        replace: 'kbq-asset-host-virtual_24'
    },
    {
        replaceWith: 'kbq-hpux_16',
        replace: 'kbq-asset-hpux_16'
    },
    {
        replaceWith: 'kbq-hpux_24',
        replace: 'kbq-asset-hpux_24'
    },
    {
        replaceWith: 'kbq-hypervisor_16',
        replace: 'kbq-asset-hypervisor_16'
    },
    {
        replaceWith: 'kbq-hypervisor_24',
        replace: 'kbq-asset-hypervisor_24'
    },
    {
        replaceWith: 'kbq-idrac_16',
        replace: 'kbq-asset-idrac_16'
    },
    {
        replaceWith: 'kbq-idrac_24',
        replace: 'kbq-asset-idrac_24'
    },
    {
        replaceWith: 'kbq-linux_16',
        replace: 'kbq-asset-linux_16'
    },
    {
        replaceWith: 'kbq-linux_24',
        replace: 'kbq-asset-linux_24'
    },
    {
        replaceWith: 'kbq-mobile_16',
        replace: 'kbq-asset-mobile-device_16'
    },
    {
        replaceWith: 'kbq-desktop-multiple_16',
        replace: 'kbq-asset-multiple_16'
    },
    {
        replaceWith: 'kbq-desktop-multiple_24',
        replace: 'kbq-asset-multiple_24'
    },
    {
        replaceWith: 'kbq-network-device-dots_16',
        replace: 'kbq-asset-network-device_16'
    },
    {
        replaceWith: 'kbq-network-device-dots_24',
        replace: 'kbq-asset-network-device_24'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-asset-network-dummy_16'
    },
    {
        replaceWith: 'kbq-cloud_16',
        replace: 'kbq-asset-network_16'
    },
    {
        replaceWith: 'kbq-cloud-o_24',
        replace: 'kbq-asset-network_24'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-asset-node_16'
    },
    {
        replaceWith: 'kbq-question-circle_24',
        replace: 'kbq-asset-node_24'
    },
    {
        replaceWith: 'kbq-question-circle_24',
        replace: 'kbq-asset-other-2_24'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-asset-other_16'
    },
    {
        replaceWith: 'kbq-question-circle_24',
        replace: 'kbq-asset-other_24'
    },
    {
        replaceWith: 'kbq-printer_16',
        replace: 'kbq-asset-printer_16'
    },
    {
        replaceWith: 'kbq-printer_24',
        replace: 'kbq-asset-printer_24'
    },
    {
        replaceWith: 'kbq-router_16',
        replace: 'kbq-asset-router_16'
    },
    {
        replaceWith: 'kbq-router_24',
        replace: 'kbq-asset-router_24'
    },
    {
        replaceWith: 'kbq-sap_16',
        replace: 'kbq-asset-sap_16'
    },
    {
        replaceWith: 'kbq-sap_24',
        replace: 'kbq-asset-sap_24'
    },
    {
        replaceWith: 'kbq-server_16',
        replace: 'kbq-asset-server_16'
    },
    {
        replaceWith: 'kbq-server_24',
        replace: 'kbq-asset-server_24'
    },
    {
        replaceWith: 'kbq-arrows-left-right-rectangle-horizontal-o_16',
        replace: 'kbq-asset-switch_16'
    },
    {
        replaceWith: 'kbq-arrows-left-right-rectangle-horizontal-o_24',
        replace: 'kbq-asset-switch_24'
    },
    {
        replaceWith: 'kbq-globe_16',
        replace: 'kbq-asset-website_16'
    },
    {
        replaceWith: 'kbq-globe_24',
        replace: 'kbq-asset-website_24'
    },
    {
        replaceWith: 'kbq-windows_16',
        replace: 'kbq-asset-windows_16'
    },
    {
        replaceWith: 'kbq-windows_24',
        replace: 'kbq-asset-windows_24'
    },
    {
        replaceWith: 'kbq-backward_16',
        replace: 'kbq-backward_16'
    },
    {
        replaceWith: 'kbq-band-aid_16',
        replace: 'kbq-band-aid_16'
    },
    {
        replaceWith: 'kbq-bell_16',
        replace: 'kbq-bell-o_16'
    },
    {
        replaceWith: 'kbq-bell_24',
        replace: 'kbq-bell-o_24'
    },
    {
        replaceWith: 'kbq-bell-slash_16',
        replace: 'kbq-bell-off-o_16'
    },
    {
        replaceWith: 'kbq-bell-slash_24',
        replace: 'kbq-bell-off-o_24'
    },
    {
        replaceWith: 'kbq-bell_16',
        replace: 'kbq-bell_16'
    },
    {
        replaceWith: 'kbq-bell_32',
        replace: 'kbq-bell_32'
    },
    {
        replaceWith: 'kbq-bento-menu_16',
        replace: 'kbq-bento_16'
    },
    {
        replaceWith: 'kbq-bento-menu_24',
        replace: 'kbq-bento_24'
    },
    {
        replaceWith: 'kbq-bento-menu_32',
        replace: 'kbq-bento_32'
    },
    {
        replaceWith: 'kbq-binoculars_16',
        replace: 'kbq-binoculars_16'
    },
    {
        replaceWith: 'kbq-server_24',
        replace: 'kbq-blackbox-o_24'
    },
    {
        replaceWith: 'kbq-server_24',
        replace: 'kbq-blackbox_24'
    },
    {
        replaceWith: 'kbq-file-badge-ban-o_16',
        replace: 'kbq-blacklist_16'
    },
    {
        replaceWith: 'kbq-file-badge-ban-o_24',
        replace: 'kbq-blacklist_24'
    },
    {
        replaceWith: 'kbq-bolt_16',
        replace: 'kbq-bolt_16'
    },
    {
        replaceWith: 'kbq-bolt-o_32',
        replace: 'kbq-bolt_32'
    },
    {
        replaceWith: 'kbq-book-multiple-o_24',
        replace: 'kbq-book-o_24'
    },
    {
        replaceWith: 'kbq-book-open_16',
        replace: 'kbq-book-open_16'
    },
    {
        replaceWith: 'kbq-book-open_24',
        replace: 'kbq-book-open_24'
    },
    {
        replaceWith: 'kbq-book-multiple_24',
        replace: 'kbq-book_24'
    },
    {
        replaceWith: 'kbq-cloud-badge-globe-o_16',
        replace: 'kbq-border-network_16'
    },
    {
        replaceWith: 'kbq-cloud-badge-globe-o_24',
        replace: 'kbq-border-network_24'
    },
    {
        replaceWith: 'kbq-box_16',
        replace: 'kbq-box-closed_16'
    },
    {
        replaceWith: 'kbq-box-open_16',
        replace: 'kbq-box-open_16'
    },
    {
        replaceWith: 'kbq-branch_24',
        replace: 'kbq-branch-o_24'
    },
    {
        replaceWith: 'kbq-branch_16',
        replace: 'kbq-branch_16'
    },
    {
        replaceWith: 'kbq-branch_24',
        replace: 'kbq-branch_24'
    },
    {
        replaceWith: 'kbq-break-block_16',
        replace: 'kbq-break-block_16'
    },
    {
        replaceWith: 'kbq-bug_16',
        replace: 'kbq-bug_16'
    },
    {
        replaceWith: 'kbq-wrench-badge-play_16',
        replace: 'kbq-build-config_16'
    },
    {
        replaceWith: 'kbq-build-set_16',
        replace: 'kbq-build-set_16'
    },
    {
        replaceWith: 'kbq-building_16',
        replace: 'kbq-building_16'
    },
    {
        replaceWith: 'kbq-calendar-xmark-o_16',
        replace: 'kbq-calendar-stopped_16'
    },
    {
        replaceWith: 'kbq-calendar-o_16',
        replace: 'kbq-calendar_16'
    },
    {
        replaceWith: 'kbq-channel_16',
        replace: 'kbq-channel_16'
    },
    {
        replaceWith: 'kbq-chart-area_16',
        replace: 'kbq-chart-area_16'
    },
    {
        replaceWith: 'kbq-chart-area_24',
        replace: 'kbq-chart-area_24'
    },
    {
        replaceWith: 'kbq-chart-bar-vertical_16',
        replace: 'kbq-chart-bar-vertical_16'
    },
    {
        replaceWith: 'kbq-chart-bar-vertical_24',
        replace: 'kbq-chart-bar-vertical_24'
    },
    {
        replaceWith: 'kbq-chart-bar-horizontal_16',
        replace: 'kbq-chart-bar_16'
    },
    {
        replaceWith: 'kbq-chart-bar-horizontal_24',
        replace: 'kbq-chart-bar_24'
    },
    {
        replaceWith: 'kbq-chart-bar-horizontal_32',
        replace: 'kbq-chart-bar_32'
    },
    {
        replaceWith: 'kbq-chart-bar-horizontal_48',
        replace: 'kbq-chart-bar_48'
    },
    {
        replaceWith: 'kbq-chart-bubble_16',
        replace: 'kbq-chart-bubble_16'
    },
    {
        replaceWith: 'kbq-chart-donut_16',
        replace: 'kbq-chart-donut_16'
    },
    {
        replaceWith: 'kbq-chart-donut_24',
        replace: 'kbq-chart-donut_24'
    },
    {
        replaceWith: 'kbq-chart-heatmap_16',
        replace: 'kbq-chart-heatmap_16'
    },
    {
        replaceWith: 'kbq-chart-heatmap_24',
        replace: 'kbq-chart-heatmap_24'
    },
    {
        replaceWith: 'kbq-chart-index_24',
        replace: 'kbq-chart-index-only_24'
    },
    {
        replaceWith: 'kbq-chart-index_16',
        replace: 'kbq-chart-index_16'
    },
    {
        replaceWith: 'kbq-chart-index-line_24',
        replace: 'kbq-chart-index_24'
    },
    {
        replaceWith: 'kbq-chart-line-multiple_16',
        replace: 'kbq-chart-line-multiple_16'
    },
    {
        replaceWith: 'kbq-chart-line-multiple_24',
        replace: 'kbq-chart-line-multiple_24'
    },
    {
        replaceWith: 'kbq-chart-line-multiple_32',
        replace: 'kbq-chart-line-multiple_32'
    },
    {
        replaceWith: 'kbq-chart-line-multiple_48',
        replace: 'kbq-chart-line-multiple_48'
    },
    {
        replaceWith: 'kbq-chart-line_16',
        replace: 'kbq-chart-line_16'
    },
    {
        replaceWith: 'kbq-chart-line_24',
        replace: 'kbq-chart-line_24'
    },
    {
        replaceWith: 'kbq-map_16',
        replace: 'kbq-chart-map_16'
    },
    {
        replaceWith: 'kbq-map_24',
        replace: 'kbq-chart-map_24'
    },
    {
        replaceWith: 'kbq-chart-pie_16',
        replace: 'kbq-chart-pie_16'
    },
    {
        replaceWith: 'kbq-chart-stacked-bar-vertical_24',
        replace: 'kbq-chart-stacked-bar-vertical_24'
    },
    {
        replaceWith: 'kbq-chart-stacked-bar-horizontal_24',
        replace: 'kbq-chart-stacked-bar_24'
    },
    {
        replaceWith: 'kbq-check-badge-auto_16',
        replace: 'kbq-check-auto_16'
    },
    {
        replaceWith: 'kbq-check_16',
        replace: 'kbq-check_16'
    },
    {
        replaceWith: 'kbq-check_48',
        replace: 'kbq-check_48'
    },
    {
        replaceWith: 'kbq-checkbox-multiple_16',
        replace: 'kbq-checkbox-multiple_16'
    },
    {
        replaceWith: 'kbq-arrow-turn-down-right_16',
        replace: 'kbq-child-link_16'
    },
    {
        replaceWith: 'kbq-circle-xs_16',
        replace: 'kbq-circle-6_16'
    },
    {
        replaceWith: 'kbq-circle-dot-o_16',
        replace: 'kbq-circle-empty-partial_16'
    },
    {
        replaceWith: 'kbq-circle-o_16',
        replace: 'kbq-circle-empty_16'
    },
    {
        replaceWith: 'kbq-circle-o_24',
        replace: 'kbq-circle-empty_24'
    },
    {
        replaceWith: 'kbq-circle-o_16',
        replace: 'kbq-circle-outline_16'
    },
    {
        replaceWith: 'kbq-circle-dot_16',
        replace: 'kbq-circle-partial_16'
    },
    {
        replaceWith: 'kbq-check-circle_16',
        replace: 'kbq-circle-successfull-o_16'
    },
    {
        replaceWith: 'kbq-check-circle_16',
        replace: 'kbq-circle-successfull_16'
    },
    {
        replaceWith: 'kbq-check-circle_24',
        replace: 'kbq-circle-successfull_24'
    },
    {
        replaceWith: 'kbq-ban-dot_16',
        replace: 'kbq-circle-unavailable-partial_16'
    },
    {
        replaceWith: 'kbq-ban_16',
        replace: 'kbq-circle-unavailable_16'
    },
    {
        replaceWith: 'kbq-ban_24',
        replace: 'kbq-circle-unavailable_24'
    },
    {
        replaceWith: 'kbq-exclamation-circle_24',
        replace: 'kbq-circle-warning_24'
    },
    {
        replaceWith: 'kbq-circle_16',
        replace: 'kbq-circle_16'
    },
    {
        replaceWith: 'kbq-clock_16',
        replace: 'kbq-clock_16'
    },
    {
        replaceWith: 'kbq-xmark-circle_16',
        replace: 'kbq-close-circle-o_16'
    },
    {
        replaceWith: 'kbq-xmark-circle_24',
        replace: 'kbq-close-circle-o_24'
    },
    {
        replaceWith: 'kbq-xmark-circle_16',
        replace: 'kbq-close-circle-small_16'
    },
    {
        replaceWith: 'kbq-xmark-circle_16',
        replace: 'kbq-close-circle_16'
    },
    {
        replaceWith: 'kbq-xmark_16',
        replace: 'kbq-close-l_16'
    },
    {
        replaceWith: 'kbq-xmark_16',
        replace: 'kbq-close-L_16'
    },
    {
        replaceWith: 'kbq-xmark_32',
        replace: 'kbq-close-l_32'
    },
    {
        replaceWith: 'kbq-xmark_32',
        replace: 'kbq-close-L_32'
    },
    {
        replaceWith: 'kbq-xmark-s_16',
        replace: 'kbq-close-m_16'
    },
    {
        replaceWith: 'kbq-xmark-s_16',
        replace: 'kbq-close-M_16'
    },
    {
        replaceWith: 'kbq-xmark-s_16',
        replace: 'kbq-close-s_16'
    },
    {
        replaceWith: 'kbq-xmark-s_16',
        replace: 'kbq-close-S_16'
    },
    {
        replaceWith: 'kbq-cloud-badge-key-o_16',
        replace: 'kbq-cloud-badge-key-o_16'
    },
    {
        replaceWith: 'kbq-cloud-badge-key-o_24',
        replace: 'kbq-cloud-badge-key-o_24'
    },
    {
        replaceWith: 'kbq-arrows-collapse-diagonal_16',
        replace: 'kbq-collapse-diagonal_16'
    },
    {
        replaceWith: 'kbq-chevrons-down-up_16',
        replace: 'kbq-collapse_16'
    },
    {
        replaceWith: 'kbq-satellite-dish_16',
        replace: 'kbq-collect-data_16'
    },
    {
        replaceWith: 'kbq-palette_16',
        replace: 'kbq-color-palette_16'
    },
    {
        replaceWith: 'kbq-message-dot_24',
        replace: 'kbq-comment-active_24'
    },
    {
        replaceWith: 'kbq-message_16',
        replace: 'kbq-comment_16'
    },
    {
        replaceWith: 'kbq-message_24',
        replace: 'kbq-comment_24'
    },
    {
        replaceWith: 'kbq-gear-badge-arrowtriangle-up-square_16',
        replace: 'kbq-compliance-level-critical_16'
    },
    {
        replaceWith: 'kbq-gear-badge-square_16',
        replace: 'kbq-compliance-level-high_16'
    },
    {
        replaceWith: 'kbq-gear-badge-square-o_16',
        replace: 'kbq-compliance-level-low_16'
    },
    {
        replaceWith: 'kbq-gear-badge-square-s_16',
        replace: 'kbq-compliance-level-medium_16'
    },
    {
        replaceWith: 'kbq-gear-badge-square-o_16',
        replace: 'kbq-compliance-level-not-defined_16'
    },
    {
        replaceWith: 'kbq-certificate-vertical_16',
        replace: 'kbq-compliance_16'
    },
    {
        replaceWith: 'kbq-network-device-dots_24',
        replace: 'kbq-connection-o_24'
    },
    {
        replaceWith: 'kbq-network-device-dots_24',
        replace: 'kbq-connection_24'
    },
    {
        replaceWith: 'kbq-file-multiple-o_16',
        replace: 'kbq-copy-o_16'
    },
    {
        replaceWith: 'kbq-square-multiple-o_16',
        replace: 'kbq-copy_16'
    },
    {
        replaceWith: 'kbq-credit-card_16',
        replace: 'kbq-credit-card_16'
    },
    {
        replaceWith: 'kbq-circle-half_16',
        replace: 'kbq-criticality-medium_16'
    },
    {
        replaceWith: 'kbq-crown_16',
        replace: 'kbq-crown_16'
    },
    {
        replaceWith: 'kbq-dashboard_16',
        replace: 'kbq-dashboard_16'
    },
    {
        replaceWith: 'kbq-dashboard-o_32',
        replace: 'kbq-dashboard_32'
    },
    {
        replaceWith: 'kbq-trash_16',
        replace: 'kbq-delete_16'
    },
    {
        replaceWith: 'kbq-check-double_16',
        replace: 'kbq-delivered_16'
    },
    {
        replaceWith: 'kbq-diamond-o_16',
        replace: 'kbq-diamond-o_16'
    },
    {
        replaceWith: 'kbq-disk-drive_16',
        replace: 'kbq-disc_16'
    },
    {
        replaceWith: 'kbq-disk-drive_24',
        replace: 'kbq-disc_24'
    },
    {
        replaceWith: 'kbq-chevron-double-down_16',
        replace: 'kbq-double-angle-down_16'
    },
    {
        replaceWith: 'kbq-chevron-double-left_16',
        replace: 'kbq-double-angle-left_16'
    },
    {
        replaceWith: 'kbq-chevron-double-right_16',
        replace: 'kbq-double-angle-right_16'
    },
    {
        replaceWith: 'kbq-chevron-double-up_16',
        replace: 'kbq-double-angle-up_16'
    },
    {
        replaceWith: 'kbq-arrow-down-to-line_16',
        replace: 'kbq-download_16'
    },
    {
        replaceWith: 'kbq-cloud-arrow-down-o_32',
        replace: 'kbq-download_32'
    },
    {
        replaceWith: 'kbq-pencil_16',
        replace: 'kbq-edit_16'
    },
    {
        replaceWith: 'kbq-pencil_24',
        replace: 'kbq-edit_24'
    },
    {
        replaceWith: 'kbq-ellipsis-horizontal-circle-o_16',
        replace: 'kbq-ellipsis-horiz-circle_16'
    },
    {
        replaceWith: 'kbq-ellipsis-horizontal_16',
        replace: 'kbq-ellipsis-horizontal_16'
    },
    {
        replaceWith: 'kbq-ellipsis-vertical_16',
        replace: 'kbq-ellipsis_16'
    },
    {
        replaceWith: 'kbq-ellipsis-vertical_24',
        replace: 'kbq-ellipsis_24'
    },
    {
        replaceWith: 'kbq-envelope-dot_24',
        replace: 'kbq-email-notification-o_24'
    },
    {
        replaceWith: 'kbq-envelope-dot_24',
        replace: 'kbq-email-notification_24'
    },
    {
        replaceWith: 'kbq-arrow-turn-down-left_16',
        replace: 'kbq-enter_16'
    },
    {
        replaceWith: 'kbq-envelope-dot_16',
        replace: 'kbq-envelope-partial_16'
    },
    {
        replaceWith: 'kbq-envelope-badge-arrow-right_16',
        replace: 'kbq-envelope-send_16'
    },
    {
        replaceWith: 'kbq-envelope_16',
        replace: 'kbq-envelope_16'
    },
    {
        replaceWith: 'kbq-envelope_24',
        replace: 'kbq-envelope_24'
    },
    {
        replaceWith: 'kbq-exclamation-triangle_16',
        replace: 'kbq-error_16'
    },
    {
        replaceWith: 'kbq-exclamation-triangle_32',
        replace: 'kbq-error_32'
    },
    {
        replaceWith: 'kbq-bolt-rectangle-vertical-o_16',
        replace: 'kbq-event-alert-o_16'
    },
    {
        replaceWith: 'kbq-bolt-rectangle-vertical_16',
        replace: 'kbq-event-alert_16'
    },
    {
        replaceWith: 'kbq-database-badge-arrow-down_16',
        replace: 'kbq-event-hierarchical_16'
    },
    {
        replaceWith: 'kbq-file-lines_16',
        replace: 'kbq-event-normalized-o_16'
    },
    {
        replaceWith: 'kbq-file-lines_16',
        replace: 'kbq-event-normalized_16'
    },
    {
        replaceWith: 'kbq-file-lines-short_16',
        replace: 'kbq-event-raw-o_16'
    },
    {
        replaceWith: 'kbq-bars-bold-horizontal_16',
        replace: 'kbq-event-template_16'
    },
    {
        replaceWith: 'kbq-arrow-right-arrow-left_16',
        replace: 'kbq-exchange_16'
    },
    {
        replaceWith: 'kbq-exists_16',
        replace: 'kbq-exists_16'
    },
    {
        replaceWith: 'kbq-arrows-expand-diagonal_16',
        replace: 'kbq-expand-diagonal_16'
    },
    {
        replaceWith: 'kbq-chevrons-up-down_16',
        replace: 'kbq-expand_16'
    },
    {
        replaceWith: 'kbq-arrow-right-from-bracket_16',
        replace: 'kbq-export_16'
    },
    {
        replaceWith: 'kbq-arrow-up-right-from-square_16',
        replace: 'kbq-external-link_16'
    },
    {
        replaceWith: 'kbq-eye-slash_16',
        replace: 'kbq-eye-crossed_16'
    },
    {
        replaceWith: 'kbq-eye_16',
        replace: 'kbq-eye_16'
    },
    {
        replaceWith: 'kbq-fence_16',
        replace: 'kbq-fence_16'
    },
    {
        replaceWith: 'kbq-file-archive-o_16',
        replace: 'kbq-file-archive_16'
    },
    {
        replaceWith: 'kbq-file-code-o_16',
        replace: 'kbq-file-code_16'
    },
    {
        replaceWith: 'kbq-file-doc-o_48',
        replace: 'kbq-file-doc_48'
    },
    {
        replaceWith: 'kbq-file-multiple-o_16',
        replace: 'kbq-file-empty-multiple_16'
    },
    {
        replaceWith: 'kbq-file-multiple-o_24',
        replace: 'kbq-file-empty-multiple_24'
    },
    {
        replaceWith: 'kbq-file-o_16',
        replace: 'kbq-file-empty_16'
    },
    {
        replaceWith: 'kbq-file-o_32',
        replace: 'kbq-file-empty_32'
    },
    {
        replaceWith: 'kbq-arrow-right-circle-dot-o_16',
        replace: 'kbq-file-passed-partial_16'
    },
    {
        replaceWith: 'kbq-arrow-right-through-line_16',
        replace: 'kbq-file-passed_16'
    },
    {
        replaceWith: 'kbq-file-pdf-o_48',
        replace: 'kbq-file-pdf_48'
    },
    {
        replaceWith: 'kbq-file-badge-arrow-left-o_16',
        replace: 'kbq-file-text-arrow-left_16'
    },
    {
        replaceWith: 'kbq-file-badge-arrow-right-o_16',
        replace: 'kbq-file-text-arrow-right_16'
    },
    {
        replaceWith: 'kbq-file-text-o_16',
        replace: 'kbq-file-text_16'
    },
    {
        replaceWith: 'kbq-file-cut-o_16',
        replace: 'kbq-file-unfinished_16'
    },
    {
        replaceWith: 'kbq-filter-dot_16',
        replace: 'kbq-filter-active-o_16'
    },
    {
        replaceWith: 'kbq-filter-dot_16',
        replace: 'kbq-filter-active_16'
    },
    {
        replaceWith: 'kbq-filter_16',
        replace: 'kbq-filter-o_16'
    },
    {
        replaceWith: 'kbq-filter_16',
        replace: 'kbq-filter_16'
    },
    {
        replaceWith: 'kbq-crosshairs_16',
        replace: 'kbq-find-me_16'
    },
    {
        replaceWith: 'kbq-flowchart-dot_16',
        replace: 'kbq-flowchart-partial_16'
    },
    {
        replaceWith: 'kbq-flowchart_16',
        replace: 'kbq-flowchart_16'
    },
    {
        replaceWith: 'kbq-folder-dot_16',
        replace: 'kbq-folder-closed-partial_16'
    },
    {
        replaceWith: 'kbq-folder_16',
        replace: 'kbq-folder-closed_16'
    },
    {
        replaceWith: 'kbq-folder_24',
        replace: 'kbq-folder-closed_24'
    },
    {
        replaceWith: 'kbq-folder-badge-arrow-right_16',
        replace: 'kbq-folder-move_16'
    },
    {
        replaceWith: 'kbq-folder-multiple_16',
        replace: 'kbq-folder-multiple_16'
    },
    {
        replaceWith: 'kbq-folder-open_24',
        replace: 'kbq-folder-open-o_24'
    },
    {
        replaceWith: 'kbq-folder-open-dot_16',
        replace: 'kbq-folder-open-partial_16'
    },
    {
        replaceWith: 'kbq-folder-open_16',
        replace: 'kbq-folder-open_16'
    },
    {
        replaceWith: 'kbq-folder-open_24',
        replace: 'kbq-folder-open_24'
    },
    {
        replaceWith: 'kbq-folder-open-badge-magnifying-glass_16',
        replace: 'kbq-folder-search-open_16'
    },
    {
        replaceWith: 'kbq-folder-badge-magnifying-glass_16',
        replace: 'kbq-folder-search_16'
    },
    {
        replaceWith: 'kbq-folder-o_32',
        replace: 'kbq-folder_32'
    },
    {
        replaceWith: 'kbq-formula_16',
        replace: 'kbq-formula_16'
    },
    {
        replaceWith: 'kbq-forward-step_16',
        replace: 'kbq-forward_16'
    },
    {
        replaceWith: 'kbq-gear_24',
        replace: 'kbq-gear-o_24'
    },
    {
        replaceWith: 'kbq-gear_16',
        replace: 'kbq-gear_16'
    },
    {
        replaceWith: 'kbq-gear_24',
        replace: 'kbq-gear_24'
    },
    {
        replaceWith: 'kbq-globe-multiple_16',
        replace: 'kbq-globe-multiple_16'
    },
    {
        replaceWith: 'kbq-globe-dot_16',
        replace: 'kbq-globe-partial_16'
    },
    {
        replaceWith: 'kbq-globe_16',
        replace: 'kbq-globe_16'
    },
    {
        replaceWith: 'kbq-message-arrow-right_16',
        replace: 'kbq-go-to-comment_16'
    },
    {
        replaceWith: 'kbq-message-arrow-right_24',
        replace: 'kbq-go-to-comment_24'
    },
    {
        replaceWith: 'kbq-gossopka_16',
        replace: 'kbq-gossopka_16'
    },
    {
        replaceWith: 'kbq-grid-group-dot_16',
        replace: 'kbq-grid-group-active_16'
    },
    {
        replaceWith: 'kbq-grid-group_16',
        replace: 'kbq-grid-group_16'
    },
    {
        replaceWith: 'kbq-bars-horizontal_16',
        replace: 'kbq-hamburger_16'
    },
    {
        replaceWith: 'kbq-bars-horizontal_32',
        replace: 'kbq-hamburger_32'
    },
    {
        replaceWith: 'kbq-grip-vertical_16',
        replace: 'kbq-handle_16'
    },
    {
        replaceWith: 'kbq-hashtag_16',
        replace: 'kbq-hash_16'
    },
    {
        replaceWith: 'kbq-clock-rotate-left_16',
        replace: 'kbq-history_16'
    },
    {
        replaceWith: 'kbq-hourglass-start_16',
        replace: 'kbq-hourglasses-0_16'
    },
    {
        replaceWith: 'kbq-hourglass-end_16',
        replace: 'kbq-hourglasses-100_16'
    },
    {
        replaceWith: 'kbq-hourglass-half_16',
        replace: 'kbq-hourglasses-50_16'
    },
    {
        replaceWith: 'kbq-house-o_16',
        replace: 'kbq-house-o_16'
    },
    {
        replaceWith: 'kbq-house_16',
        replace: 'kbq-house_16'
    },
    {
        replaceWith: 'kbq-minus-circle-o_16',
        replace: 'kbq-ignore-o_16'
    },
    {
        replaceWith: 'kbq-minus-circle-o_24',
        replace: 'kbq-ignore-o_24'
    },
    {
        replaceWith: 'kbq-minus-circle_24',
        replace: 'kbq-ignore_24'
    },
    {
        replaceWith: 'kbq-image_16',
        replace: 'kbq-image-block_16'
    },
    {
        replaceWith: 'kbq-arrow-right-to-bracket_16',
        replace: 'kbq-import_16'
    },
    {
        replaceWith: 'kbq-arrows-up_16',
        replace: 'kbq-importance-1_16'
    },
    {
        replaceWith: 'kbq-arrow-up_16',
        replace: 'kbq-importance-2_16'
    },
    {
        replaceWith: 'kbq-circle-half_16',
        replace: 'kbq-importance-3_16'
    },
    {
        replaceWith: 'kbq-minus_16',
        replace: 'kbq-importance-4_16'
    },
    {
        replaceWith: 'kbq-arrow-down_16',
        replace: 'kbq-importance-5_16'
    },
    {
        replaceWith: 'kbq-info-circle_16',
        replace: 'kbq-info-circle_16'
    },
    {
        replaceWith: 'kbq-info-circle_16',
        replace: 'kbq-info-o_16'
    },
    {
        replaceWith: 'kbq-info-circle_24',
        replace: 'kbq-info-o_24'
    },
    {
        replaceWith: 'kbq-info-circle_16',
        replace: 'kbq-info_16'
    },
    {
        replaceWith: 'kbq-info-circle_24',
        replace: 'kbq-info_24'
    },
    {
        replaceWith: 'kbq-arrow-right-to-arc_16',
        replace: 'kbq-interface-in_16'
    },
    {
        replaceWith: 'kbq-arrow-right-to-arc_24',
        replace: 'kbq-interface-in_24'
    },
    {
        replaceWith: 'kbq-arrow-right-from-arc_16',
        replace: 'kbq-interface-out_16'
    },
    {
        replaceWith: 'kbq-arrow-right-from-arc_24',
        replace: 'kbq-interface-out_24'
    },
    {
        replaceWith: 'kbq-ip-multiple_16',
        replace: 'kbq-ip-group_16'
    },
    {
        replaceWith: 'kbq-ip_16',
        replace: 'kbq-ip_16'
    },
    {
        replaceWith: 'kbq-join_16',
        replace: 'kbq-join_16'
    },
    {
        replaceWith: 'kbq-key_16',
        replace: 'kbq-key_16'
    },
    {
        replaceWith: 'kbq-key_24',
        replace: 'kbq-key_24'
    },
    {
        replaceWith: 'kbq-keyboard_16',
        replace: 'kbq-keyboard_16'
    },
    {
        replaceWith: 'kbq-file-horizontal-o_16',
        replace: 'kbq-landscape-orientation_16'
    },
    {
        replaceWith: 'kbq-certificate-horizontal_16',
        replace: 'kbq-license_16'
    },
    {
        replaceWith: 'kbq-certificate-horizontal_24',
        replace: 'kbq-license_24'
    },
    {
        replaceWith: 'kbq-scissors_16',
        replace: 'kbq-limit_16'
    },
    {
        replaceWith: 'kbq-link-multiple_16',
        replace: 'kbq-link-group_16'
    },
    {
        replaceWith: 'kbq-link-multiple_24',
        replace: 'kbq-link-group_24'
    },
    {
        replaceWith: 'kbq-link-dot_16',
        replace: 'kbq-link-partial_16'
    },
    {
        replaceWith: 'kbq-link_16',
        replace: 'kbq-link_16'
    },
    {
        replaceWith: 'kbq-list-ol_16',
        replace: 'kbq-list-ol_16'
    },
    {
        replaceWith: 'kbq-list-ul_16',
        replace: 'kbq-list-ul_16'
    },
    {
        replaceWith: 'kbq-list_16',
        replace: 'kbq-list_16'
    },
    {
        replaceWith: 'kbq-list_24',
        replace: 'kbq-list_24'
    },
    {
        replaceWith: 'kbq-list_32',
        replace: 'kbq-list_32'
    },
    {
        replaceWith: 'kbq-spinner_16',
        replace: 'kbq-loader-circle_16'
    },
    {
        replaceWith: 'kbq-lock_16',
        replace: 'kbq-lock-locked-o_16'
    },
    {
        replaceWith: 'kbq-lock_24',
        replace: 'kbq-lock-locked-o_24'
    },
    {
        replaceWith: 'kbq-lock_16',
        replace: 'kbq-lock-locked_16'
    },
    {
        replaceWith: 'kbq-lock_24',
        replace: 'kbq-lock-locked_24'
    },
    {
        replaceWith: 'kbq-lock-open_16',
        replace: 'kbq-lock-unlocked_16'
    },
    {
        replaceWith: 'kbq-scroll-o_16',
        replace: 'kbq-log-o_16'
    },
    {
        replaceWith: 'kbq-scroll-o_24',
        replace: 'kbq-log-o_24'
    },
    {
        replaceWith: 'kbq-scroll-o_24',
        replace: 'kbq-log_24'
    },
    {
        replaceWith: 'kbq-arrow-right-to-rectangle_24',
        replace: 'kbq-login_24'
    },
    {
        replaceWith: 'kbq-map-slash_16',
        replace: 'kbq-map-slash_16'
    },
    {
        replaceWith: 'kbq-map_16',
        replace: 'kbq-map_16'
    },
    {
        replaceWith: 'kbq-chevrons-expand_16',
        replace: 'kbq-maximize_16'
    },
    {
        replaceWith: 'kbq-compress_16',
        replace: 'kbq-minimize_16'
    },
    {
        replaceWith: 'kbq-minus-circle-s_16',
        replace: 'kbq-minus-circle-small_16'
    },
    {
        replaceWith: 'kbq-minus-circle-s_16',
        replace: 'kbq-minus-circle-xs_16'
    },
    {
        replaceWith: 'kbq-minus-circle_16',
        replace: 'kbq-minus-circle_16'
    },
    {
        replaceWith: 'kbq-minus_16',
        replace: 'kbq-minus_16'
    },
    {
        replaceWith: 'kbq-network-device-multiple_16',
        replace: 'kbq-net-packet-group_16'
    },
    {
        replaceWith: 'kbq-network-device_16',
        replace: 'kbq-net-packet_16'
    },
    {
        replaceWith: 'kbq-arrow-up-right-from-square_16',
        replace: 'kbq-new-tab_16'
    },
    {
        replaceWith: 'kbq-paper-plane_16',
        replace: 'kbq-paper-plane_16'
    },
    {
        replaceWith: 'kbq-paperclip_16',
        replace: 'kbq-paperclip_16'
    },
    {
        replaceWith: 'kbq-paperclip_24',
        replace: 'kbq-paperclip_24'
    },
    {
        replaceWith: 'kbq-arrow-up-left_16',
        replace: 'kbq-parent-link_16'
    },
    {
        replaceWith: 'kbq-pause-circle_16',
        replace: 'kbq-pause-circle_16'
    },
    {
        replaceWith: 'kbq-clock-badge-pause_16',
        replace: 'kbq-pause-on-time_16'
    },
    {
        replaceWith: 'kbq-pause_16',
        replace: 'kbq-pause_16'
    },
    {
        replaceWith: 'kbq-pause_32',
        replace: 'kbq-pause_32'
    },
    {
        replaceWith: 'kbq-pause_48',
        replace: 'kbq-pause_48'
    },
    {
        replaceWith: 'kbq-pause_64',
        replace: 'kbq-pause_64'
    },
    {
        replaceWith: 'kbq-phone_16',
        replace: 'kbq-phone_16'
    },
    {
        replaceWith: 'kbq-pin_16',
        replace: 'kbq-pin_16'
    },
    {
        replaceWith: 'kbq-play-circle_16',
        replace: 'kbq-play-circle_16'
    },
    {
        replaceWith: 'kbq-play_16',
        replace: 'kbq-play-o_16'
    },
    {
        replaceWith: 'kbq-clock-badge-play_16',
        replace: 'kbq-play-on-time_16'
    },
    {
        replaceWith: 'kbq-play-rewind_16',
        replace: 'kbq-play-rewind_16'
    },
    {
        replaceWith: 'kbq-play_16',
        replace: 'kbq-play_16'
    },
    {
        replaceWith: 'kbq-play_32',
        replace: 'kbq-play_32'
    },
    {
        replaceWith: 'kbq-play_48',
        replace: 'kbq-play_48'
    },
    {
        replaceWith: 'kbq-play_64',
        replace: 'kbq-play_64'
    },
    {
        replaceWith: 'kbq-plug_16',
        replace: 'kbq-plug-o_16'
    },
    {
        replaceWith: 'kbq-plug_24',
        replace: 'kbq-plug-o_24'
    },
    {
        replaceWith: 'kbq-plug_16',
        replace: 'kbq-plug_16'
    },
    {
        replaceWith: 'kbq-plug_24',
        replace: 'kbq-plug_24'
    },
    {
        replaceWith: 'kbq-plus-circle-s_16',
        replace: 'kbq-plus-circle-xs_16'
    },
    {
        replaceWith: 'kbq-plus-circle_16',
        replace: 'kbq-plus-circle_16'
    },
    {
        replaceWith: 'kbq-plus_16',
        replace: 'kbq-plus_16'
    },
    {
        replaceWith: 'kbq-plus_32',
        replace: 'kbq-plus_32'
    },
    {
        replaceWith: 'kbq-plus_64',
        replace: 'kbq-plus_64'
    },
    {
        replaceWith: 'kbq-robot_16',
        replace: 'kbq-policies_16'
    },
    {
        replaceWith: 'kbq-clipboard-check-o_24',
        replace: 'kbq-policy-o_24'
    },
    {
        replaceWith: 'kbq-clipboard-check_24',
        replace: 'kbq-policy_24'
    },
    {
        replaceWith: 'kbq-file-o_16',
        replace: 'kbq-portrait-orientation_16'
    },
    {
        replaceWith: 'kbq-bars-vertical_16',
        replace: 'kbq-project_16'
    },
    {
        replaceWith: 'kbq-shield-check_16',
        replace: 'kbq-protection-active_16'
    },
    {
        replaceWith: 'kbq-shield-half_16',
        replace: 'kbq-protection-half_16'
    },
    {
        replaceWith: 'kbq-shield-slash_16',
        replace: 'kbq-protection-off_16'
    },
    {
        replaceWith: 'kbq-pulse_16',
        replace: 'kbq-pulse_16'
    },
    {
        replaceWith: 'kbq-ql_16',
        replace: 'kbq-ql_16'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-question-circle-o_16'
    },
    {
        replaceWith: 'kbq-question-circle_24',
        replace: 'kbq-question-circle-o_24'
    },
    {
        replaceWith: 'kbq-question-circle-o_32',
        replace: 'kbq-question-circle-o_32'
    },
    {
        replaceWith: 'kbq-question-circle_16',
        replace: 'kbq-question-circle_16'
    },
    {
        replaceWith: 'kbq-question_16',
        replace: 'kbq-question_16'
    },
    {
        replaceWith: 'kbq-reachability-from_16',
        replace: 'kbq-reachability-from_16'
    },
    {
        replaceWith: 'kbq-reachability-to_16',
        replace: 'kbq-reachability-to_16'
    },
    {
        replaceWith: 'kbq-reachability_16',
        replace: 'kbq-reachability_16'
    },
    {
        replaceWith: 'kbq-redo_16',
        replace: 'kbq-redo_16'
    },
    {
        replaceWith: 'kbq-arrows-rotate-reverse-slash_16',
        replace: 'kbq-refresh-off_16'
    },
    {
        replaceWith: 'kbq-arrows-rotate-reverse_16',
        replace: 'kbq-refresh_16'
    },
    {
        replaceWith: 'kbq-arrows-rotate-reverse_24',
        replace: 'kbq-refresh_24'
    },
    {
        replaceWith: 'kbq-arrows-rotate_48',
        replace: 'kbq-refresh_48'
    },
    {
        replaceWith: 'kbq-regex_16',
        replace: 'kbq-regex_16'
    },
    {
        replaceWith: 'kbq-registry-multiple_16',
        replace: 'kbq-registry-group_16'
    },
    {
        replaceWith: 'kbq-registry_16',
        replace: 'kbq-registry_16'
    },
    {
        replaceWith: 'kbq-list-badge-xmark_16',
        replace: 'kbq-remove-from-list_16'
    },
    {
        replaceWith: 'kbq-file-exclamation-o_16',
        replace: 'kbq-report-errors_16'
    },
    {
        replaceWith: 'kbq-file-o_16',
        replace: 'kbq-report-o_16'
    },
    {
        replaceWith: 'kbq-file-o_24',
        replace: 'kbq-report-o_24'
    },
    {
        replaceWith: 'kbq-file-o_16',
        replace: 'kbq-report_16'
    },
    {
        replaceWith: 'kbq-file-o_24',
        replace: 'kbq-report_24'
    },
    {
        replaceWith: 'kbq-file-lines-o_32',
        replace: 'kbq-report_32'
    },
    {
        replaceWith: 'kbq-arrow-rotate-right-dot_16',
        replace: 'kbq-retro-analysis_16'
    },
    {
        replaceWith: 'kbq-satellite-dish_16',
        replace: 'kbq-satellite_16'
    },
    {
        replaceWith: 'kbq-floppy-disk_16',
        replace: 'kbq-save_16'
    },
    {
        replaceWith: 'kbq-radar-o_32',
        replace: 'kbq-scan_32'
    },
    {
        replaceWith: 'kbq-magnifying-glass-badge-sparkles_16',
        replace: 'kbq-search-sparkles_16'
    },
    {
        replaceWith: 'kbq-magnifying-glass_16',
        replace: 'kbq-search_16'
    },
    {
        replaceWith: 'kbq-magnifying-glass_24',
        replace: 'kbq-search_24'
    },
    {
        replaceWith: 'kbq-arrow-up-from-rectangle_16',
        replace: 'kbq-share_16'
    },
    {
        replaceWith: 'kbq-rectangle-triangle-vertical-thin_16',
        replace: 'kbq-siem-vulner-level-critical_16'
    },
    {
        replaceWith: 'kbq-rectangle-vertical-thin_16',
        replace: 'kbq-siem-vulner-level-high_16'
    },
    {
        replaceWith: 'kbq-rectangle-vertical-thin-o_16',
        replace: 'kbq-siem-vulner-level-low_16'
    },
    {
        replaceWith: 'kbq-rectangle-vertical-thin-half_16',
        replace: 'kbq-siem-vulner-level-medium_16'
    },
    {
        replaceWith: 'kbq-rectangle-vertical-thin-lines_16',
        replace: 'kbq-siem-vulner-level-not-defined_16'
    },
    {
        replaceWith: 'kbq-shield-star_16',
        replace: 'kbq-significance-high_16'
    },
    {
        replaceWith: 'kbq-shield-o_16',
        replace: 'kbq-significance-low_16'
    },
    {
        replaceWith: 'kbq-shield-ribbon_16',
        replace: 'kbq-significance-medium_16'
    },
    {
        replaceWith: 'kbq-shield-o_16',
        replace: 'kbq-significance-na_16'
    },
    {
        replaceWith: 'kbq-sliders-dot_16',
        replace: 'kbq-sliders-active_16'
    },
    {
        replaceWith: 'kbq-sliders_16',
        replace: 'kbq-sliders_16'
    },
    {
        replaceWith: 'kbq-sliders_24',
        replace: 'kbq-sliders_24'
    },
    {
        replaceWith: 'kbq-sliders_32',
        replace: 'kbq-sliders_32'
    },
    {
        replaceWith: 'kbq-arrow-up-arrow-down-dot_16',
        replace: 'kbq-sort-active_16'
    },
    {
        replaceWith: 'kbq-arrow-up-arrow-down_16',
        replace: 'kbq-sort_16'
    },
    {
        replaceWith: 'kbq-sources_24',
        replace: 'kbq-sources_24'
    },
    {
        replaceWith: 'kbq-split-screen-bottom_16',
        replace: 'kbq-split-screen-bottom_16'
    },
    {
        replaceWith: 'kbq-split-screen-no-split_16',
        replace: 'kbq-split-screen-no-split_16'
    },
    {
        replaceWith: 'kbq-split-screen-right_16',
        replace: 'kbq-split-screen-right_16'
    },
    {
        replaceWith: 'kbq-square-dot_16',
        replace: 'kbq-square-partial_16'
    },
    {
        replaceWith: 'kbq-square_16',
        replace: 'kbq-square_16'
    },
    {
        replaceWith: 'kbq-star-o_16',
        replace: 'kbq-star-o_16'
    },
    {
        replaceWith: 'kbq-star_16',
        replace: 'kbq-star_16'
    },
    {
        replaceWith: 'kbq-diamond_16',
        replace: 'kbq-startline_16'
    },
    {
        replaceWith: 'kbq-stop-circle_16',
        replace: 'kbq-stop-circle_16'
    },
    {
        replaceWith: 'kbq-clock-badge-stop_16',
        replace: 'kbq-stop-on-time_16'
    },
    {
        replaceWith: 'kbq-stop_16',
        replace: 'kbq-stop_16'
    },
    {
        replaceWith: 'kbq-stop_32',
        replace: 'kbq-stop_32'
    },
    {
        replaceWith: 'kbq-stop_48',
        replace: 'kbq-stop_48'
    },
    {
        replaceWith: 'kbq-stop_64',
        replace: 'kbq-stop_64'
    },
    {
        replaceWith: 'kbq-database-normal_16',
        replace: 'kbq-storage-normal_16'
    },
    {
        replaceWith: 'kbq-database-raw_16',
        replace: 'kbq-storage-raw_16'
    },
    {
        replaceWith: 'kbq-database_16',
        replace: 'kbq-storage_16'
    },
    {
        replaceWith: 'kbq-database-o_32',
        replace: 'kbq-storage_32'
    },
    {
        replaceWith: 'kbq-check-circle_16',
        replace: 'kbq-success-small_16'
    },
    {
        replaceWith: 'kbq-check-circle_16',
        replace: 'kbq-success_16'
    },
    {
        replaceWith: 'kbq-sigma_16',
        replace: 'kbq-summ_16'
    },
    {
        replaceWith: 'kbq-table-badge-arrow-down-circle_32',
        replace: 'kbq-table-download_32'
    },
    {
        replaceWith: 'kbq-table-badge-clock_16',
        replace: 'kbq-table-list-ttl_16'
    },
    {
        replaceWith: 'kbq-table-badge-clock_24',
        replace: 'kbq-table-list-ttl_24'
    },
    {
        replaceWith: 'kbq-table_16',
        replace: 'kbq-table-list_16'
    },
    {
        replaceWith: 'kbq-table_24',
        replace: 'kbq-table-list_24'
    },
    {
        replaceWith: 'kbq-tag_16',
        replace: 'kbq-tag_16'
    },
    {
        replaceWith: 'kbq-tag-multiple_16',
        replace: 'kbq-tags_16'
    },
    {
        replaceWith: 'kbq-bars-progress_16',
        replace: 'kbq-tasks_16'
    },
    {
        replaceWith: 'kbq-bars-progress_24',
        replace: 'kbq-tasks_24'
    },
    {
        replaceWith: 'kbq-text-font_16',
        replace: 'kbq-text-block_16'
    },
    {
        replaceWith: 'kbq-text-bold_16',
        replace: 'kbq-text-bold_16'
    },
    {
        replaceWith: 'kbq-text-italic_16',
        replace: 'kbq-text-italic_16'
    },
    {
        replaceWith: 'kbq-text-underline_16',
        replace: 'kbq-text-underline_16'
    },
    {
        replaceWith: 'kbq-sun-moon_16',
        replace: 'kbq-theme_16'
    },
    {
        replaceWith: 'kbq-topology_16',
        replace: 'kbq-topology_16'
    },
    {
        replaceWith: 'kbq-arrow-down-right_16',
        replace: 'kbq-trend-down_16'
    },
    {
        replaceWith: 'kbq-arrow-up-right_16',
        replace: 'kbq-trend-up_16'
    },
    {
        replaceWith: 'kbq-chevron-down-s_16',
        replace: 'kbq-triangle-down_16'
    },
    {
        replaceWith: 'kbq-chevron-left-s_16',
        replace: 'kbq-triangle-left_16'
    },
    {
        replaceWith: 'kbq-chevron-right-s_16',
        replace: 'kbq-triangle-right_16'
    },
    {
        replaceWith: 'kbq-chevron-up-s_16',
        replace: 'kbq-triangle-up_16'
    },
    {
        replaceWith: 'kbq-undo_16',
        replace: 'kbq-undo_16'
    },
    {
        replaceWith: 'kbq-arrow-down-on-rectangles_16',
        replace: 'kbq-unique_16'
    },
    {
        replaceWith: 'kbq-link-broken_16',
        replace: 'kbq-unlink_16'
    },
    {
        replaceWith: 'kbq-pin-slash_16',
        replace: 'kbq-unpin_16'
    },
    {
        replaceWith: 'kbq-arrow-rotate-left_24',
        replace: 'kbq-update-o_24'
    },
    {
        replaceWith: 'kbq-arrow-rotate-left_16',
        replace: 'kbq-update_16'
    },
    {
        replaceWith: 'kbq-arrow-rotate-left_24',
        replace: 'kbq-update_24'
    },
    {
        replaceWith: 'kbq-arrow-up-from-line_16',
        replace: 'kbq-upload-to-cloud_16'
    },
    {
        replaceWith: 'kbq-cloud-arrow-up-o_24',
        replace: 'kbq-upload-to-cloud_24'
    },
    {
        replaceWith: 'kbq-cloud-arrow-up-o_32',
        replace: 'kbq-upload-to-cloud_32'
    },
    {
        replaceWith: 'kbq-cloud-arrow-up-o_64',
        replace: 'kbq-upload-to-cloud_64'
    },
    {
        replaceWith: 'kbq-url_16',
        replace: 'kbq-url_16'
    },
    {
        replaceWith: 'kbq-usb-flash_16',
        replace: 'kbq-usb-flash_16'
    },
    {
        replaceWith: 'kbq-user_16',
        replace: 'kbq-user-o_16'
    },
    {
        replaceWith: 'kbq-user_16',
        replace: 'kbq-user_16'
    },
    {
        replaceWith: 'kbq-user_24',
        replace: 'kbq-user_24'
    },
    {
        replaceWith: 'kbq-user-multiple_24',
        replace: 'kbq-users-group-o_24'
    },
    {
        replaceWith: 'kbq-user-multiple_16',
        replace: 'kbq-users-group_16'
    },
    {
        replaceWith: 'kbq-user-multiple_24',
        replace: 'kbq-users-group_24'
    },
    {
        replaceWith: 'kbq-burst_16',
        replace: 'kbq-vulner-exploitable_16'
    },
    {
        replaceWith: 'kbq-eject_16',
        replace: 'kbq-vulner-level-abovemedium_16'
    },
    {
        replaceWith: 'kbq-eject-down_16',
        replace: 'kbq-vulner-level-belowmedium_16'
    },
    {
        replaceWith: 'kbq-arrow-up_16',
        replace: 'kbq-vulner-level-high_16'
    },
    {
        replaceWith: 'kbq-arrow-down_16',
        replace: 'kbq-vulner-level-low_16'
    },
    {
        replaceWith: 'kbq-stop_16',
        replace: 'kbq-vulner-level-medium_16'
    },
    {
        replaceWith: 'kbq-user-arrow-triangle-up_16',
        replace: 'kbq-vulner-lpe_16'
    },
    {
        replaceWith: 'kbq-chart-network_16',
        replace: 'kbq-vulner-network_16'
    },
    {
        replaceWith: 'kbq-capsule_16',
        replace: 'kbq-vulner-patch_16'
    },
    {
        replaceWith: 'kbq-code_16',
        replace: 'kbq-vulner-rce_16'
    },
    {
        replaceWith: 'kbq-file-badge-arrow-through-line-o_16',
        replace: 'kbq-whitelist_16'
    },
    {
        replaceWith: 'kbq-wrap-text-slash_16',
        replace: 'kbq-word-wrap-slash_16'
    },
    {
        replaceWith: 'kbq-wrap-text_16',
        replace: 'kbq-word-wrap_16'
    },
    {
        replaceWith: 'kbq-wrench_16',
        replace: 'kbq-wrench_16'
    },
    {
        replaceWith: 'kbq-arrows-left-right-to-line_16',
        replace: 'kbq-zoom-to-fit_16'
    },
    {
        replaceWith: 'kbq-circle-xs_16',
        replace: 'kbq-circle-8_16'
    },
    {
        replaceWith: 'kbq-folder-open_16',
        replace: 'kbq-folder-opened_16'
    },
    {
        replaceWith: 'kbq-folder-open-badge-magnifying-glass_16',
        replace: 'kbq-folder-search-opened_16'
    },
    {
        replaceWith: 'kbq-user_24',
        replace: 'kbq-user-o_24'
    }
];
