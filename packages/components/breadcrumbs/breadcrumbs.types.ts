import { KbqDefaultSizes } from '@koobiq/components/core';

export type KbqBreadcrumbsWrapMode = 'auto' | 'wrap' | 'none';

export type KbqBreadcrumbsConfiguration = {
    /**
     * Specifies the maximum number of breadcrumb items to display.
     * - If a number is provided, only that many items will be shown.
     * - If `null`, no limit is applied, and all breadcrumb items are displayed.
     */
    max: number | null;
    size: KbqDefaultSizes;
    /**
     * Determines if a negative margin should be applied to the first breadcrumb item.
     */
    firstItemNegativeMargin: boolean;
    /**
     * Manages breadcrumb items when space is limited:
     * - `auto`: Adjusts based on space and item count.
     * - `wrap`: Moves items to the next line if needed.
     * - `none`: Prevents wrapping, allowing overflow.
     */
    wrapMode: KbqBreadcrumbsWrapMode;
};
