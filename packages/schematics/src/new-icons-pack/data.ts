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
    { replace: "'mc-", replaceWith: "'kbq-" }
];

export const newIconsPackData: ReplaceData[] = [
    {
        replace: 'angle-down-L_16',
        replaceWith: 'chevron-down_16'
    },
    {
        replace: 'angle-down-L_24',
        replaceWith: 'chevron-down_24'
    },
    {
        replace: 'angle-down-M_16',
        replaceWith: 'chevron-down_16'
    },
    {
        replace: 'angle-down-M_24',
        replaceWith: 'chevron-down_24'
    },
    {
        replace: 'angle-down-S_16',
        replaceWith: 'chevron-down-s_16'
    },
    {
        replace: 'angle-left-L_16',
        replaceWith: 'chevron-left_16'
    },
    {
        replace: 'angle-left-L_24',
        replaceWith: 'chevron-left_24'
    },
    {
        replace: 'angle-left-M_16',
        replaceWith: 'chevron-left_16'
    },
    {
        replace: 'angle-left-M_24',
        replaceWith: 'chevron-left_24'
    },
    {
        replace: 'angle-left-S_16',
        replaceWith: 'chevron-left-s_16'
    },
    {
        replace: 'angle-right-L_16',
        replaceWith: 'chevron-right_16'
    },
    {
        replace: 'angle-right-L_24',
        replaceWith: 'chevron-right_24'
    },
    {
        replace: 'angle-right-M_16',
        replaceWith: 'chevron-right_16'
    },
    {
        replace: 'angle-right-M_24',
        replaceWith: 'chevron-right_24'
    },
    {
        replace: 'angle-right-M_32',
        replaceWith: 'chevron-right-m_32'
    },
    {
        replace: 'angle-right-S_16',
        replaceWith: 'chevron-right-s_16'
    },
    {
        replace: 'angle-up-L_16',
        replaceWith: 'chevron-up_16'
    },
    {
        replace: 'angle-up-L_24',
        replaceWith: 'chevron-up_24'
    },
    {
        replace: 'angle-up-M_16',
        replaceWith: 'chevron-up_16'
    },
    {
        replace: 'angle-up-M_24',
        replaceWith: 'chevron-up_24'
    },
    {
        replace: 'angle-up-S_16',
        replaceWith: 'chevron-up-s_16'
    },
    {
        replace: 'bell_16',
        replaceWith: 'bell_16'
    },
    {
        replace: 'bell_32',
        replaceWith: 'bell_32'
    },
    {
        replace: 'bell-o_16',
        replaceWith: 'bell_16'
    },
    {
        replace: 'bell-o_24',
        replaceWith: 'bell_24'
    },
    {
        replace: 'bell-off-o_16',
        replaceWith: 'bell-slash_16'
    },
    {
        replace: 'bento_16',
        replaceWith: 'bento-menu_16'
    },
    {
        replace: 'bento_24',
        replaceWith: 'bento-menu_24'
    },
    {
        replace: 'bento_32',
        replaceWith: 'bento-menu_32'
    },
    {
        replace: 'calendar_16',
        replaceWith: 'calendar-o_16'
    },
    {
        replace: 'chart-bar_24',
        replaceWith: 'chart-bar_24'
    },
    {
        replace: 'check_16',
        replaceWith: 'check_16'
    },
    {
        replace: 'circle-8_16',
        replaceWith: 'circle-6_16'
    },
    {
        replace: 'clock_16',
        replaceWith: 'clock_16'
    },
    {
        replace: 'close-circle_16',
        replaceWith: 'xmark-circle_16'
    },
    {
        replace: 'close-L_16',
        replaceWith: 'xmark_16'
    },
    {
        replace: 'close-L_32',
        replaceWith: 'xmark_32'
    },
    {
        replace: 'close-M_16',
        replaceWith: 'xmark_16'
    },
    {
        replace: 'close-S_16',
        replaceWith: 'xmark-s_16'
    },
    {
        replace: 'cloud-404_256',
        replaceWith: 'cloud-404_256'
    },
    {
        replace: 'color-palette_16',
        replaceWith: 'palette_16'
    },
    {
        replace: 'copy_16',
        replaceWith: 'square-multiple-o_16'
    },
    {
        replace: 'copy-o_16',
        replaceWith: 'file-multiple_16'
    },
    {
        replace: 'download_16',
        replaceWith: 'arrow-down-to-line_16'
    },
    {
        replace: 'download_32',
        replaceWith: 'cloud-arrow-down_32'
    },
    {
        replace: 'ellipsis_16',
        replaceWith: 'ellipsis-vertical_16'
    },
    {
        replace: 'ellipsis_24',
        replaceWith: 'ellipsis-vertical_24'
    },
    {
        replace: 'error_16',
        replaceWith: 'exclamation-triangle_16'
    },
    {
        replace: 'external-link_16',
        replaceWith: 'arrow-up-right-from-square_16'
    },
    {
        replace: 'eye_16',
        replaceWith: 'eye_16'
    },
    {
        replace: 'eye-crossed_16',
        replaceWith: 'eye-slash_16'
    },
    {
        replace: 'file-empty_16',
        replaceWith: 'file_16'
    },
    {
        replace: 'folder-closed_16',
        replaceWith: 'folder_16'
    },
    {
        replace: 'folder-open-o_24',
        replaceWith: 'folder-open_24'
    },
    {
        replace: 'folder-opened_16',
        replaceWith: 'folder-open_16'
    },
    {
        replace: 'folder-search_16',
        replaceWith: 'folder-badge-magnifying-glass_16'
    },
    {
        replace: 'folder-search-opened_16',
        replaceWith: 'folder-open-badge-magnifying-glass_16'
    },
    {
        replace: 'gear_16',
        replaceWith: 'gear_16'
    },
    {
        replace: 'globe_16',
        replaceWith: 'globe_16'
    },
    {
        replace: 'hamburger_16',
        replaceWith: 'hamburger-menu_16'
    },
    {
        replace: 'hamburger_32',
        replaceWith: 'hamburger-menu_32'
    },
    {
        replace: 'info_16',
        replaceWith: 'info-circle_16'
    },
    {
        replace: 'info-o_16',
        replaceWith: 'info-circle-o_16'
    },
    {
        replace: 'list_24',
        replaceWith: 'list_24'
    },
    {
        replace: 'minus_16',
        replaceWith: 'minus_16'
    },
    {
        replace: 'new-tab_16',
        replaceWith: 'window-plus_16'
    },
    {
        replace: 'pause_16',
        replaceWith: 'pause_16'
    },
    {
        replace: 'play_16',
        replaceWith: 'play_16'
    },
    {
        replace: 'question-circle_24',
        replaceWith: 'question-circle_24'
    },
    {
        replace: 'search_16',
        replaceWith: 'magnifying-glass_16'
    },
    {
        replace: 'search_24',
        replaceWith: 'magnifying-glass_24'
    },
    {
        replace: 'stop_16',
        replaceWith: 'stop_16'
    },
    {
        replace: 'success_16',
        replaceWith: 'check-circle_16'
    },
    {
        replace: 'theme_16',
        replaceWith: 'theme-mode_16'
    },
    {
        replace: 'triangle-down_16',
        replaceWith: 'location-chevron-down_16'
    },
    {
        replace: 'triangle-left_16',
        replaceWith: 'location-chevron-left_16'
    },
    {
        replace: 'triangle-right_16',
        replaceWith: 'location-chevron-right_16'
    },
    {
        replace: 'triangle-up_16',
        replaceWith: 'location-chevron-up_16'
    },
    {
        replace: 'upload-to-cloud_16',
        replaceWith: 'arrow-up-from-line_16'
    },
    {
        replace: 'upload-to-cloud_24',
        replaceWith: 'arrow-up-from-line_24'
    },
    {
        replace: 'upload-to-cloud_32',
        replaceWith: 'arrow-up-from-line_32'
    },
    {
        replace: 'upload-to-cloud_64',
        replaceWith: 'arrow-up-from-line_64'
    },
    {
        replace: 'user-o_24',
        replaceWith: 'user_24'
    }
];
