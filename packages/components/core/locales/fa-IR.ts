import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
} from './types';

export const faIRLocaleData = {
    select: { hiddenItemsText: '{{ number }} بیشتر' },
    datepicker: {
        placeholder: 'روز/ ماه/سال'
    },
    timepicker: {
        placeholder: {
            full: 'ثانیه:دقیقه:ساعت',
            short: 'دقیقه:ساعت'
        }
    },
    fileUpload: {
        single: {
            captionText: 'فایل را به اینجا بکشید یا {{ browseLink }}',
            browseLink: 'انتخاب کنید'
        },
        multiple: {
            captionText: 'به اینجا بکشید یا {{ browseLink }}',
            captionTextWhenSelected: 'فایل های بیشتری را بکشید یا {{ browseLink }}',
            captionTextForCompactSize: 'فایل ها را بکشید یا {{ browseLink }}',
            browseLink: 'انتخاب کنید',
            title: 'فایل ها را آپلود کنید',
            gridHeaders: {
                file: 'فایل',
                size: 'اندازه'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'فعال‌سازی سطربندی',
        softWrapOffTooltip: 'غیرفعال‌سازی سطربندی',
        downloadTooltip: 'دانلود',
        copiedTooltip: '✓ کپی شد',
        copyTooltip: 'کپی',
        viewAllText: 'نمایش همه',
        viewLessText: 'نمایش کمتر',
        openExternalSystemTooltip: 'باز کردن در سیستم خارجی'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: ' شهر یا منطقه زمانی '
    },
    actionsPanel: {
        closeTooltip: 'إلغاء التحديد'
    } satisfies KbqActionsPanelLocaleConfiguration,
    filterBar: {
        reset: {
            buttonName: 'بازنشانی'
        },
        search: {
            tooltip: 'جستجو',
            placeholder: 'جستجو'
        },
        filters: {
            defaultName: 'فیلترها',
            saveNewFilterTooltip: 'ذخیره فیلتر جدید',
            searchPlaceholder: 'جستجو',
            searchEmptyResult: 'چیزی پیدا نشد',
            saveAsNewFilter: 'ذخیره به‌عنوان فیلتر جدید',
            saveChanges: 'ذخیره تغییرات',
            saveAsNew: 'ذخیره به‌عنوان مورد جدید',
            change: 'ویرایش',
            resetChanges: 'بازنشانی',
            remove: 'حذف',
            name: 'نام',
            error: 'جستجویی با این نام از قبل وجود دارد',
            errorHint: 'فیلتر ذخیره نشد. دوباره امتحان کنید یا با سرپرست تماس بگیرید.',
            saveButton: 'ذخیره',
            cancelButton: 'لغو'
        },
        add: {
            tooltip: 'افزودن فیلتر'
        },
        pipe: {
            clearButtonTooltip: 'پاک کردن',
            removeButtonTooltip: 'حذف',
            applyButton: 'اعمال',
            emptySearchResult: 'چیزی پیدا نشد',
            selectAll: 'همه را انتخاب کنید'
        },
        datePipe: {
            customPeriod: 'دوره سفارشی',
            customPeriodFrom: 'از',
            customPeriodTo: 'تا',
            customPeriodErrorHint: 'دوره نمی‌تواند بعد از پایان آن شروع شود',
            backToPeriodSelection: 'بازگشت به انتخاب دوره'
        }
    },
    clampedText: {
        openText: 'باز کردن',
        closeText: 'بستن'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'ترک گسترش یافته',
            collapseButton: 'جمع کردن'
        }
    },
    searchExpandable: {
        tooltip: 'جستجو',
        placeholder: 'جستجو'
    },
    appSwitcher: {
        searchPlaceholder: 'جستجو',
        searchEmptyResult: 'چیزی پیدا نشد',
        sitesHeader: 'سایت‌های دیگر'
    },
    timeRange: {
        title: {
            for: 'برای',
            placeholder: 'دوره را انتخاب کنید'
        },
        editor: {
            from: 'از',
            to: 'تا',
            apply: 'اعمال',
            cancel: 'لغو',
            rangeLabel: 'برای دوره',
            allTime: 'برای همه زمان‌ها',
            currentQuarter: 'برای فصل جاری',
            currentYear: 'برای سال جاری'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' و ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years} سال گذشته`,
                MONTHS: `{months} ماه گذشته`,
                WEEKS: `{weeks} هفته گذشته`,
                DAYS: `{days} روز گذشته`,
                HOURS: `{hours} ساعت گذشته`,
                MINUTES: `{minutes} دقیقه گذشته`,
                SECONDS: `{seconds} ثانیه گذشته`,
                YEARS_FRACTION: `{floorValue, plural,
                =1 {سال {years, number, ::# و #}}
                other {سالها {years, number, ::# و #}}
            }`,
                MONTHS_FRACTION: `{floorValue, plural,
                =1 {ماه {months, number, ::# و #}}
                other {ماه ها {months, number, ::# و #}}
            }`
            },
            option: {
                SEPARATOR: ' و ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years} سال گذشته`,
                MONTHS: `{months} ماه گذشته`,
                WEEKS: `{weeks} هفته گذشته`,
                DAYS: `{days} روز گذشته`,
                HOURS: `{hours} ساعت گذشته`,
                MINUTES: `{minutes} دقیقه گذشته`,
                SECONDS: `{seconds} ثانیه گذشته`,
                YEARS_FRACTION: `{floorValue, plural,
                =1 {سال {years, number, ::# و #}}
                other {سالها {years, number, ::# و #}}
            }`,
                MONTHS_FRACTION: `{floorValue, plural,
                =1 {ماه {months, number, ::# و #}}
                other {ماه ها {months, number, ::# و #}}
            }`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig,
    notificationCenter: {
        notifications: 'اعلان‌ها',
        remove: 'حذف',
        doNotDisturb: 'مزاحم نشوید',
        showPopUpNotifications: 'نمایش اعلان‌های پاپ‌آپ',
        noNotifications: 'بدون اعلان',
        failedToLoadNotifications: 'بارگیری اعلان‌ها ناموفق بود',
        repeat: 'تکرار'
    }
};
