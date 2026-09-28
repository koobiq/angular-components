import {
    ClassEntry,
    DocEntry,
    EntryType,
    FunctionEntry,
    JsDocTagEntry,
    MemberEntry,
    MemberTags
} from '../rendering/entities';
import { normalizeFunctionFields } from '../rendering/transforms/normalize-function-fields';

/** Gets a unique lookup key for an API */
export function getApiLookupKey(moduleName: string, name: string) {
    return `${moduleName}/${name}`;
}

// Declarations tagged `internal` are missing from the published typings. The Angular extractor drops such
// members by itself, but keeps top-level entries.
export function isPublic(entry: { jsdocTags: JsDocTagEntry[] }) {
    return entry.jsdocTags.every((t: JsDocTagEntry) => t.name !== 'docs-private' && t.name !== 'internal');
}

/** Members every class has, or a framework calls — documenting them would tell a consumer nothing. */
const FRAMEWORK_MEMBERS = new Set([
    'ngAfterContentChecked',
    'ngAfterContentInit',
    'ngAfterViewChecked',
    'ngAfterViewInit',
    'ngDoCheck',
    'ngOnChanges',
    'ngOnDestroy',
    'ngOnInit',

    // ControlValueAccessor methods
    'writeValue',
    'registerOnChange',
    'registerOnTouched',
    'setDisabledState',

    // tabIndex exists on all elements, no need to document it
    'tabIndex'
]);

/**
 * Whether a member of `entry` belongs in the docs. A `protected` member is there for the class's own template
 * or host bindings (see AGENTS.md), or for its internals, so it is left out — unless the class is abstract and
 * exists to be extended, or, outside a component or directive, its author documents it for a subclass.
 */
export function isDocumentedMember(entry: DocEntry, member: MemberEntry): boolean {
    const { isAbstract, isService } = entry as ClassEntry;
    const isTemplated = entry.entryType === EntryType.Component || entry.entryType === EntryType.Directive;
    const { description, params } = normalizeFunctionFields(member as Partial<FunctionEntry>);

    if (!isPublic(member) || FRAMEWORK_MEMBERS.has(member.name)) return false;

    // Angular creates a component, directive, pipe or service itself, passing what DI injects: nobody else
    // calls its constructor. A plain class is created with `new`, and its parameters are what to pass.
    if (member.name === 'constructor') {
        return !isTemplated && entry.entryType !== EntryType.Pipe && !isService && !!params?.length;
    }

    return !member.memberTags.includes(MemberTags.Protected) || !!isAbstract || (!isTemplated && !!description?.trim());
}
