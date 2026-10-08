import { AutocompleteScenario } from './autocomplete';
import { DatepickerScenario } from './datepicker';
import { DropdownScenario } from './dropdown';
import { ListScenario } from './list';
import { NavbarScenario } from './navbar';
import { SelectScenario } from './select';
import { SidepanelScenario } from './sidepanel';
import { TooltipScenario } from './tooltip';
import { TreeSelectScenario } from './tree-select';

/** Every scenario, rendered together on the page of each application. */
export const SCENARIOS = [
    SelectScenario,
    TreeSelectScenario,
    AutocompleteScenario,
    DropdownScenario,
    DatepickerScenario,
    TooltipScenario,
    ListScenario,
    NavbarScenario,
    SidepanelScenario
];
