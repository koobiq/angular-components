import {
    ClassEntry,
    ConstantEntry,
    DirectiveEntry,
    DocEntry,
    EntryType,
    EnumMemberEntry,
    FunctionEntry,
    FunctionWithOverloads,
    GenericEntry,
    MemberEntry,
    MemberTags,
    MemberType,
    ParameterEntry,
    PipeEntry,
    PropertyEntry,
    SignalApi,
    TypeAliasEntry
} from './entities';
import { isDeprecatedEntry } from './entities/categorization';
import { normalizeFunctionFields } from './transforms/normalize-function-fields';

/**
 * Builds the signature block of an API entry — the code a reader sees first on the API tab and the one
 * `llms-full.txt` carries. It is written the way the source declares the entry, not the way the compiler
 * resolves it: `input<boolean>(false)` rather than `InputSignalWithTransform<boolean, unknown>`, with the
 * selector in the decorator, where a template author looks for it. Host directives are left out: the list under
 * the signature shows the bindings they forward.
 */

const INDENT = '    ';

/** One level deeper; a blank line stays empty, so that copied code carries no trailing spaces. */
const indentLine = (line: string): string => (line.trim() ? INDENT + line : '');

/**
 * A longer line is broken the way prettier breaks it: the options object, or one parameter per line. The
 * width is what the docs article shows at common laptop widths without scrolling the code sideways.
 */
const MAX_LINE_LENGTH = 72;

/** Interfaces every Angular class may implement; naming them tells a consumer nothing. */
const LIFECYCLE_INTERFACES = new Set([
    'AfterContentChecked',
    'AfterContentInit',
    'AfterViewChecked',
    'AfterViewInit',
    'DoCheck',
    'OnChanges',
    'OnDestroy',
    'OnInit'
]);

/** Where a member sits in a signature and in the list below it: the bindings first, then the rest. */
type MemberRole = 'input' | 'output' | 'property' | 'method';

const ROLE_ORDER: MemberRole[] = ['input', 'output', 'property', 'method'];

function getMemberRole(member: MemberEntry): MemberRole {
    if (member.memberType === MemberType.Method) return 'method';

    if (member.memberTags.includes(MemberTags.Input)) return 'input';

    if (member.memberTags.includes(MemberTags.Output)) return 'output';

    return 'property';
}

/** A class-like entry's kind as the API tab labels it. */
export function getEntryKind(entry: DocEntry): string {
    const classEntry = entry as ClassEntry;

    switch (entry.entryType) {
        case EntryType.Component:
            return 'component';
        case EntryType.Directive:
            return 'directive';
        case EntryType.Pipe:
            return 'pipe';
        case EntryType.NgModule:
            return 'NgModule';
        case EntryType.Interface:
            return 'interface';
        case EntryType.TypeAlias:
            return 'type';
        case EntryType.Enum:
            return 'enum';
        case EntryType.Constant:
            return 'const';
        case EntryType.Function:
            return 'function';
        default:
            if (classEntry.isService) return 'service';

            return classEntry.isAbstract ? 'abstract class' : 'class';
    }
}

/** Entries of the kinds a reader looks for together, which the API tab lists under a heading of their own. */
export interface EntryGroup {
    /** The id of the heading. The hyphen keeps it apart from the name of any entry, which is an identifier. */
    id: string;
    title: string;
    kinds: readonly string[];
}

/**
 * The groups in the order the API tab lists them: what a template uses first, plain types last. The kinds a template
 * uses apart stay apart — a component is an element of its own, a directive an attribute of another — while those that
 * differ in how they are declared share a group. An NgModule, which the tab does not list, is in none of them.
 */
export const ENTRY_GROUPS: readonly EntryGroup[] = [
    { id: 'api-components', title: 'Components', kinds: ['component'] },
    { id: 'api-directives', title: 'Directives', kinds: ['directive'] },
    { id: 'api-pipes', title: 'Pipes', kinds: ['pipe'] },
    { id: 'api-services', title: 'Services', kinds: ['service'] },
    { id: 'api-classes', title: 'Classes', kinds: ['class', 'abstract class'] },
    { id: 'api-functions', title: 'Functions', kinds: ['function'] },
    { id: 'api-types', title: 'Types', kinds: ['interface', 'type'] },
    { id: 'api-enums', title: 'Enums', kinds: ['enum'] },
    { id: 'api-constants', title: 'Constants', kinds: ['const'] }
];

const getEntryGroup = (entry: DocEntry): EntryGroup | undefined => {
    const kind = getEntryKind(entry);

    return ENTRY_GROUPS.find(({ kinds }) => kinds.includes(kind));
};

/** Orders entries by group, then by name; an entry in no group comes last. */
export function compareEntries(a: DocEntry, b: DocEntry): number {
    const rank = (entry: DocEntry): number => {
        const group = getEntryGroup(entry);

        return group ? ENTRY_GROUPS.indexOf(group) : ENTRY_GROUPS.length;
    };

    return rank(a) - rank(b) || a.name.localeCompare(b.name);
}

/**
 * The entries in their groups, ordered, without the groups that have none and without the entries in no group — an
 * NgModule. The API tab and `llms-full.txt` list them so.
 */
export function groupEntries(entries: DocEntry[]): { group: EntryGroup; entries: DocEntry[] }[] {
    const sorted = [...entries].sort(compareEntries);

    return ENTRY_GROUPS.map((group) => ({
        group,
        entries: sorted.filter((entry) => getEntryGroup(entry) === group)
    })).filter(({ entries: grouped }) => grouped.length);
}

const isOptional = (member: { memberTags: MemberTags[] }): boolean => member.memberTags.includes(MemberTags.Optional);

const isConstructor = (member: MemberEntry): boolean =>
    member.name === 'constructor' && member.memberType === MemberType.Method;

/** An optional member or parameter already says it may be missing; `| undefined` repeats it. */
export const withoutUndefined = (type: string): string => type.replace(/\s*\|\s*undefined$/, '');

/**
 * Scans `text` from `start` and returns the index of the bracket that closes the one at `start`, skipping
 * string literals and the `>` of an arrow — `(event: FocusEvent) => boolean` must not close a `<`.
 */
function findClosingBracket(text: string, start: number): number {
    let depth = 0;
    let quote: string | null = null;

    for (let index = start; index < text.length; index++) {
        const char = text[index];

        if (quote) {
            if (char === quote && text[index - 1] !== '\\') quote = null;

            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            quote = char;
        } else if ('<([{'.includes(char)) {
            depth++;
        } else if ('>)]}'.includes(char) && !(char === '>' && text[index - 1] === '=')) {
            depth--;

            if (depth === 0) return index;
        }
    }

    return -1;
}

/** Splits `text` on the commas that are not nested in brackets or strings. */
function splitTopLevel(text: string): string[] {
    const parts: string[] = [];
    let start = 0;
    let index = 0;

    while (index < text.length) {
        const char = text[index];

        if ('<([{'.includes(char) || char === '"' || char === "'" || char === '`') {
            const close = '<([{'.includes(char) ? findClosingBracket(text, index) : text.indexOf(char, index + 1);

            index = close < 0 ? text.length : close + 1;

            continue;
        }

        if (char === ',') {
            parts.push(text.slice(start, index).trim());
            start = index + 1;
        }

        index++;
    }

    parts.push(text.slice(start).trim());

    return parts.filter(Boolean);
}

/** The type arguments of `type` when it is exactly `Name<...>` for one of `names`, otherwise nothing. */
function typeArgumentsOf(type: string, names: readonly string[]): string[] | undefined {
    const text = type.trim();
    const open = text.indexOf('<');

    if (open < 0 || !names.includes(text.slice(0, open))) return undefined;

    return findClosingBracket(text, open) === text.length - 1 ? splitTopLevel(text.slice(open + 1, -1)) : undefined;
}

const SIGNAL_WRAPPERS = [
    'InputSignal',
    'InputSignalWithTransform',
    'ModelSignal',
    'OutputEmitterRef',
    'OutputRef',
    'WritableSignal'
];

/**
 * The signal API a member is declared with, as the source calls it. Not guessed from a `ModelSignal<T>`
 * type: an interface member of that type declares no initializer to write.
 */
const getSignalApi = (member: PropertyEntry): SignalApi | undefined => member.signalApi;

/** The value type of a signal member: `boolean` for `InputSignalWithTransform<boolean, unknown>`. */
function getSignalValueType(member: PropertyEntry): string | undefined {
    return member.declaredType ?? typeArgumentsOf(member.type ?? '', SIGNAL_WRAPPERS)?.[0];
}

/** The type of a member as its declaration writes it. */
function getDeclaredType(member: PropertyEntry): string {
    const type = member.declaredType ?? member.type ?? '';

    return isOptional(member) ? withoutUndefined(type) : type;
}

/**
 * The type a reader of the member list needs: the value an input takes, the payload an output emits, the
 * value a property holds, what a method returns, `void` included. Nothing for a constructor.
 */
export function getMemberDisplayType(member: MemberEntry): string {
    const property = member as PropertyEntry;
    const role = getMemberRole(member);

    if (role === 'method') {
        return isConstructor(member) ? '' : (getSignatures(member as unknown as FunctionEntry)[0]?.returnType ?? '');
    }

    if (member.memberType === MemberType.EnumItem) return (member as EnumMemberEntry).value ?? '';

    const signalType = getSignalApi(property) ? getSignalValueType(property) : undefined;

    if (signalType) return signalType;

    if (role === 'output') {
        const payload = typeArgumentsOf(getDeclaredType(property), ['EventEmitter', 'Observable', 'Subject'])?.[0];

        return payload ?? getDeclaredType(property);
    }

    return getDeclaredType(property);
}

/** What a member is to a template: an input, an output, or a model, which a template binds both ways. */
export type MemberBinding = 'input' | 'output' | 'model';

/** How a template binds the member; nothing for a member it does not bind. */
export function getMemberBinding(member: MemberEntry): MemberBinding | undefined {
    const { inputAlias, outputAlias } = member as PropertyEntry;

    switch (getMemberRole(member)) {
        case 'input':
            return member.memberTags.includes(MemberTags.Output) && outputAlias === `${inputAlias ?? member.name}Change`
                ? 'model'
                : 'input';
        case 'output':
            return 'output';
        default:
            return undefined;
    }
}

/** Whether an object may leave the member out: by its own `?`, or by the utility type its literal is wrapped in. */
const mayBeLeftOut = (member: MemberEntry): boolean =>
    (member as PropertyEntry).optionalByWrapper ?? isOptional(member);

/**
 * Whether an object may leave the member out: an optional field or method. A binding is not marked so — any
 * input a template may leave unbound is optional to it — and is marked `required` otherwise.
 */
export function isOptionalMember(member: MemberEntry): boolean {
    return mayBeLeftOut(member) && !getMemberBinding(member);
}

/** The name a template binds the member by, which is the alias of a binding; a method as `open()`. */
export function getMemberName(member: MemberEntry): string {
    const { inputAlias, outputAlias } = member as PropertyEntry;

    switch (getMemberRole(member)) {
        case 'method':
            return `${member.name}()`;
        case 'input':
            return inputAlias ?? member.name;
        case 'output':
            return outputAlias ?? member.name;
        default:
            return member.name;
    }
}

/**
 * How a template writes the member: `[value]`, `(changed)`, `[(opened)]`; a method as `open()`, and one an object
 * may leave out marked as optional, as `label?` or `keys?()`.
 */
export function getMemberDisplayName(member: MemberEntry): string {
    const name = getMemberName(member);

    switch (getMemberBinding(member)) {
        case 'input':
            return `[${name}]`;
        case 'model':
            return `[(${name})]`;
        case 'output':
            return `(${name})`;
        default:
            if (!mayBeLeftOut(member)) return name;

            return getMemberRole(member) === 'method' ? `${member.name}?()` : `${member.name}?`;
    }
}

/**
 * A getter and a setter of the same name are one property to a reader. The pair keeps whichever of the two
 * the author documented; a lone getter or setter stays what it is.
 */
function mergeAccessors(members: MemberEntry[]): MemberEntry[] {
    const byName = new Map<string, MemberEntry[]>();

    for (const member of members) {
        if (member.memberType === MemberType.Getter || member.memberType === MemberType.Setter) {
            byName.set(member.name, [...(byName.get(member.name) ?? []), member]);
        }
    }

    return members.flatMap((member) => {
        const accessors = byName.get(member.name);

        if (!accessors || accessors.length < 2) return [member];

        if (member !== accessors[0]) return [];

        const getter = accessors.find(({ memberType }) => memberType === MemberType.Getter) ?? member;
        const documented = accessors.find(({ description }) => description) ?? getter;

        return [
            {
                ...documented,
                memberType: MemberType.Property,
                type: (getter as PropertyEntry).type,
                declaredType: getter.declaredType ?? documented.declaredType
            } as MemberEntry
        ];
    });
}

/**
 * The members in the order both the signature and the list below it show them: by role — the bindings
 * first — and within a role the entry's own members before the inherited ones, each in source order. Where
 * an inherited member comes from is told by the `extends` clause and its badge in the list, not by where it
 * sits: a reader looks for an input among the inputs.
 */
export function orderMembers(members: MemberEntry[]): MemberEntry[] {
    const isInherited = ({ inheritedFrom }: MemberEntry): number => (inheritedFrom ? 1 : 0);

    return mergeAccessors(members)
        .map((member, index) => ({ member, index }))
        .sort(
            (a, b) =>
                ROLE_ORDER.indexOf(getMemberRole(a.member)) - ROLE_ORDER.indexOf(getMemberRole(b.member)) ||
                isInherited(a.member) - isInherited(b.member) ||
                a.index - b.index
        )
        .map(({ member }) => member);
}

/**
 * The members, each followed by the fields of the object literal type it is declared with, which the signature
 * nests under it and a reader addresses by their path: `indent.vertical`.
 */
export function flattenMembers(members: MemberEntry[]): MemberEntry[] {
    return members.flatMap((member) => [
        member,
        ...flattenMembers((member as PropertyEntry).members ?? []).map((field) => ({
            ...field,
            name: `${member.name}.${field.name}`
        }))
    ]);
}

/**
 * Whether a member has more to say than its line in the signature, which lists every member the class declares:
 * a description, the reason it is deprecated, an example or, for a method, a documented parameter or return
 * value. The signature has no line for a binding forwarded from a host directive, which therefore always counts.
 * The list under the signature and `llms-full.txt` take the same members by it.
 */
export function hasMemberDetails(member: MemberEntry): boolean {
    if (member.forwardedFrom) return true;

    const { description, jsdocTags, params, returnDescription } = normalizeFunctionFields(
        member as Partial<FunctionEntry>
    );

    return (
        !!description?.trim() ||
        (jsdocTags ?? []).some(
            ({ name, comment }) => (name === 'deprecated' || name === 'example') && !!comment.trim()
        ) ||
        !!params?.some((param) => param.description?.trim()) ||
        !!returnDescription?.trim()
    );
}

const quote = (text: string): string => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function renderGenerics(generics: GenericEntry[] | undefined): string {
    if (!generics?.length) return '';

    const params = generics.map(
        ({ name, constraint, default: fallback }) =>
            `${name}${constraint ? ` extends ${constraint}` : ''}${fallback ? ` = ${fallback}` : ''}`
    );

    return `<${params.join(', ')}>`;
}

const renderParam = ({ name, type, isOptional: optional, isRestParam }: ParameterEntry): string =>
    `${isRestParam ? '...' : ''}${name}${optional ? '?' : ''}: ${optional ? withoutUndefined(type) : type}`;

/**
 * `prefix(params): returnType;` — or `prefix(params) => returnType;` for a function type — with the
 * parameters one per line when it does not fit at `indent`.
 */
function renderCallSignature(
    prefix: string,
    signature: { params?: (ParameterEntry | string)[]; returnType: string },
    indent: string,
    returnSeparator = ':'
): string[] {
    const params = (signature.params ?? []).map((param) => (typeof param === 'string' ? param : renderParam(param)));
    // A constructor has none to write.
    const returns = signature.returnType ? `${returnSeparator} ${signature.returnType}` : '';
    const inline = `${prefix}(${params.join(', ')})${returns};`;

    if (!params.length || indent.length + inline.length <= MAX_LINE_LENGTH) return [inline];

    return [
        `${prefix}(`,
        ...params.map((param, index) => `${INDENT}${param}${index < params.length - 1 ? ',' : ''}`),
        `)${returns};`
    ];
}

/** Every call signature of a function or method: its overloads, or the one it has. */
function getSignatures(entry: FunctionEntry): FunctionEntry[] {
    const { signatures, implementation } = entry as unknown as Partial<FunctionWithOverloads>;

    if (signatures?.length) return signatures;

    return [implementation ?? entry];
}

/** Modifiers in the order TypeScript requires them. */
function renderModifiers(member: MemberEntry, exclude: MemberTags[] = []): string {
    return [MemberTags.Protected, MemberTags.Static, MemberTags.Abstract, MemberTags.Readonly]
        .filter((tag) => member.memberTags.includes(tag) && !exclude.includes(tag))
        .map((tag) => `${tag} `)
        .join('');
}

function renderSignalMember(member: PropertyEntry, api: SignalApi): string[] {
    const valueType = getSignalValueType(member);
    const alias = api === 'output' ? member.outputAlias : member.inputAlias;
    const aliased = !!alias && alias !== member.name;
    // `input.required()` and `output()` take their options first, and have no default to show.
    const defaultValue =
        api === 'input' || api === 'model' ? (member.defaultValue ?? (aliased ? 'undefined' : '')) : '';
    const head = `${renderModifiers(member)}${member.name} = ${api}${valueType ? `<${valueType}>` : ''}(`;
    const options = aliased ? `{ alias: ${quote(alias!)} }` : '';
    const args = [defaultValue, options].filter(Boolean);
    // A default spanning lines never fits on one: the arguments go one per line, its lines shifted with it.
    const fits = (line: string): boolean => !line.includes('\n') && INDENT.length + line.length <= MAX_LINE_LENGTH;
    const inline = `${head}${args.join(', ')});`;

    if (!args.length || fits(inline)) return [inline];

    // The options object hugs the call when what comes before it fits, as prettier writes it.
    const hugged = `${head}${defaultValue ? `${defaultValue}, ` : ''}{`;

    if (options && fits(hugged)) return [hugged, `${INDENT}alias: ${quote(alias!)}`, '});'];

    return [
        head,
        ...args.flatMap((arg, index) => `${arg}${index < args.length - 1 ? ',' : ''}`.split('\n').map(indentLine)),
        ');'
    ];
}

function renderDecoratorArgs(member: PropertyEntry, isInput: boolean): string {
    const alias = isInput ? member.inputAlias : member.outputAlias;
    const aliased = !!alias && alias !== member.name;

    if (isInput && member.isRequiredInput) {
        return `{ ${aliased ? `alias: ${quote(alias!)}, ` : ''}required: true }`;
    }

    return aliased ? quote(alias!) : '';
}

function renderMemberCode(member: MemberEntry): string[] {
    const property = member as PropertyEntry;
    const role = getMemberRole(member);

    if (role === 'method') {
        return getSignatures(member as unknown as FunctionEntry).flatMap((signature) =>
            renderCallSignature(
                `${renderModifiers(member)}${member.name}${isOptional(member) ? '?' : ''}${renderGenerics(signature.generics)}`,
                isConstructor(member) ? { ...signature, returnType: '' } : signature,
                INDENT
            )
        );
    }

    const api = getSignalApi(property);

    // Written as the source declares it whether or not it binds — a service extending a directive has an
    // `output()` it cannot bind, and it is still an `output()`, not the type argument it carries.
    if (api) return renderSignalMember(property, api);

    // An object literal type is laid out field by field, as the source writes it, without the comments.
    if (property.members?.length) {
        return [
            `${renderModifiers(member)}${member.name}${isOptional(member) ? '?' : ''}: {`,
            ...renderBody(property.members),
            '};'
        ];
    }

    const type = getDeclaredType(property);
    const decorator =
        role === 'input'
            ? `@Input(${renderDecoratorArgs(property, true)}) `
            : role === 'output'
              ? `@Output(${renderDecoratorArgs(property, false)}) `
              : '';

    if (member.memberType === MemberType.Getter) {
        return [`${decorator}${renderModifiers(member, [MemberTags.Readonly])}get ${member.name}(): ${type};`];
    }

    if (member.memberType === MemberType.Setter) {
        return [`${decorator}${renderModifiers(member)}set ${member.name}(value: ${type});`];
    }

    const initializer = role === 'input' && property.defaultValue ? ` = ${property.defaultValue}` : '';

    return [
        `${decorator}${renderModifiers(member)}${member.name}${isOptional(member) ? '?' : ''}: ${type}${initializer};`
    ];
}

function renderMemberLines(member: MemberEntry): string[] {
    return [...(isDeprecatedEntry(member) ? ['/** @deprecated */'] : []), ...renderMemberCode(member)];
}

/** The class body: the members one after another, in the order `orderMembers` gives. */
function renderBody(members: MemberEntry[]): string[] {
    return (
        orderMembers(members)
            .filter(({ forwardedFrom }) => !forwardedFrom)
            .flatMap(renderMemberLines)
            // A decorated input's default may span lines; each of them sits in the class body.
            .flatMap((line) => line.split('\n'))
            .map(indentLine)
    );
}

/** A decorator call whose object argument is written on one line when it is short enough to read there. */
function renderDecorator(name: string, properties: string[]): string[] {
    if (!properties.length) return [`@${name}()`];

    const inline = `@${name}({ ${properties.join(', ')} })`;

    if (inline.length <= 80 && !properties.some((property) => property.includes('\n'))) return [inline];

    return [
        `@${name}({`,
        ...properties.map(
            (property, index) =>
                `${property
                    .split('\n')
                    .map((line) => INDENT + line)
                    .join('\n')}${index < properties.length - 1 ? ',' : ''}`
        ),
        '})'
    ];
}

function renderClassDecorator(entry: ClassEntry): string[] {
    switch (entry.entryType) {
        case EntryType.Component:
        case EntryType.Directive: {
            const { selector, exportAs } = entry as DirectiveEntry;

            return renderDecorator(
                entry.entryType === EntryType.Component ? 'Component' : 'Directive',
                [
                    selector && `selector: ${quote(selector.replace(/\s+/g, ' ').trim())}`,
                    exportAs?.length && `exportAs: ${quote(exportAs.join(', '))}`
                ].filter((property): property is string => !!property)
            );
        }
        case EntryType.Pipe: {
            const { pipeName, isPure } = entry as PipeEntry;

            return renderDecorator(
                'Pipe',
                [pipeName && `name: ${quote(pipeName)}`, isPure === false && 'pure: false'].filter(
                    (property): property is string => !!property
                )
            );
        }
        default:
            return entry.isService ? [`@Injectable(${entry.injectableOptions ?? ''})`] : [];
    }
}

function renderClassLike(entry: ClassEntry): string {
    const isInterface = entry.entryType === EntryType.Interface;
    const bases = ([] as string[]).concat(entry.extends ?? []);
    const implemented = (entry.implements ?? []).filter((name) => !LIFECYCLE_INTERFACES.has(name.split('<')[0]));
    const heritage = [
        bases.length ? ` extends ${bases.join(', ')}` : '',
        !isInterface && implemented.length ? ` implements ${implemented.join(', ')}` : ''
    ].join('');
    const keyword = isInterface ? 'interface' : `${entry.isAbstract ? 'abstract ' : ''}class`;
    // Angular's extractor reports no index signature: the source metadata keeps them.
    const body = [...(entry.indexSignatures ?? []).map(indentLine), ...renderBody(entry.members ?? [])];

    return [
        ...(isInterface ? [] : renderClassDecorator(entry)),
        `${keyword} ${entry.name}${renderGenerics(entry.generics)}${heritage} {${body.length ? '' : '}'}`,
        ...(body.length ? [...body, '}'] : [])
    ].join('\n');
}

function renderEnum(entry: DocEntry & { members: EnumMemberEntry[] }): string {
    const members = entry.members.flatMap((member, index) => [
        ...(isDeprecatedEntry(member) ? [`${INDENT}/** @deprecated */`] : []),
        `${INDENT}${member.name}${member.value ? ` = ${member.value}` : ''}${index < entry.members.length - 1 ? ',' : ''}`
    ]);

    return [`enum ${entry.name} {`, ...members, '}'].join('\n');
}

/** The signature of any entry the API tab shows, written the way the module comment above describes. */
export function renderEntrySignature(entry: DocEntry): string {
    switch (entry.entryType) {
        case EntryType.Enum:
            return renderEnum(entry as DocEntry & { members: EnumMemberEntry[] });
        case EntryType.TypeAlias: {
            const alias = entry as TypeAliasEntry;
            const head = `type ${alias.name}${renderGenerics(alias.generics)} =`;
            const { before = '', after = '' } = alias.literal ?? {};

            // An object literal, written out the way an interface is: the list below the signature has the comments.
            // The utility type or the intersection around it is written as the source writes it.
            if (alias.members?.length)
                return [`${head} ${before}{`, ...renderBody(alias.members), `}${after};`].join('\n');

            return `${head} ${alias.type};`;
        }
        case EntryType.Constant: {
            const { declaredType, declaredFunctionType, type } = entry as ConstantEntry;

            if (!declaredFunctionType) return `const ${entry.name}: ${declaredType ?? type};`;

            const { generics, params, returnType } = declaredFunctionType;

            return renderCallSignature(`const ${entry.name}: ${generics}`, { params, returnType }, '', ' =>').join(
                '\n'
            );
        }
        case EntryType.Function:
            return getSignatures(entry as FunctionEntry)
                .flatMap((signature) =>
                    renderCallSignature(`function ${entry.name}${renderGenerics(signature.generics)}`, signature, '')
                )
                .join('\n');
        default:
            return renderClassLike(entry as ClassEntry);
    }
}
