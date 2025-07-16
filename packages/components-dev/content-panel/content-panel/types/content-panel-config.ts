import { KbqSidepanelConfig } from '@koobiq/components/sidepanel';

export type IcContentPanelConfig<D = any> = KbqSidepanelConfig<D> & { topOffset?: number; ghostElement?: HTMLElement };
