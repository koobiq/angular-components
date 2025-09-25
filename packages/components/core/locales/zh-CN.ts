import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration
} from './types';

export const zhCNLocaleData = {
    select: { hiddenItemsText: '另外 {{ number }} 个' },
    datepicker: {
        placeholder: '年/月/日'
    },
    timepicker: {
        placeholder: {
            full: '时:分:秒',
            short: '时:分'
        }
    },
    fileUpload: {
        single: {
            captionText: '将文件拖到此处或{{ browseLink }}',
            browseLink: '选择'
        },
        multiple: {
            captionText: '拖到此处或{{ browseLink }}',
            captionTextWhenSelected: '拖动更多文件或{{ browseLink }}',
            captionTextForCompactSize: '拖动文件或{{ browseLink }}',
            browseLink: '选择',
            title: '上传文件',
            gridHeaders: {
                file: '文件',
                size: '大小'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: '启用文本换行',
        softWrapOffTooltip: '禁用文本换行',
        downloadTooltip: '下载',
        copiedTooltip: '✓已复制',
        copyTooltip: '复制',
        viewAllText: '显示全部',
        viewLessText: '显示部分',
        openExternalSystemTooltip: '在外部系统中打开'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: '城市或时区'
    },
    actionsPanel: {
        closeTooltip: '取消选择'
    } satisfies KbqActionsPanelLocaleConfiguration,
    filterBar: {
        reset: {
            buttonName: '重置'
        },
        search: {
            tooltip: '搜索',
            placeholder: '搜索'
        },
        filters: {
            defaultName: '筛选器',
            saveNewFilterTooltip: '保存新筛选器',
            searchPlaceholder: '搜索',
            searchEmptyResult: '未找到任何内容',
            saveAsNewFilter: '另存为新筛选器',
            saveChanges: '保存更改',
            saveAsNew: '另存为新的',
            change: '编辑',
            resetChanges: '重置',
            remove: '删除',
            name: '名称',
            error: '已经使用此名称进行过搜索',
            errorHint: '无法保存筛选器。请重试或联系管理员。',
            saveButton: '保存',
            cancelButton: '取消'
        },
        add: {
            tooltip: '添加筛选器'
        },
        pipe: {
            clearButtonTooltip: '清除',
            removeButtonTooltip: '删除',
            applyButton: '应用',
            emptySearchResult: '未找到任何内容',
            selectAll: '选择全部'
        },
        datePipe: {
            customPeriod: '自定义时段',
            customPeriodFrom: '从',
            customPeriodTo: '到',
            customPeriodErrorHint: '时段开始时间不能晚于结束时间',
            backToPeriodSelection: '返回以选择一个时段'
        }
    },
    clampedText: {
        openText: '展开',
        closeText: '收起'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: '保持展开',
            collapseButton: '折叠'
        }
    },
    searchExpandable: {
        tooltip: '搜索',
        placeholder: '搜索'
    }
};
