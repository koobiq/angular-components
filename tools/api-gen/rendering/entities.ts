/** Type of top-level documentation entry. */
export enum EntryType {
    Block = 'block',
    Component = 'component',
    Constant = 'constant',
    Decorator = 'decorator',
    Directive = 'directive',
    Element = 'element',
    Enum = 'enum',
    Function = 'function',
    Interface = 'interface',
    NgModule = 'ng_module',
    Pipe = 'pipe',
    TypeAlias = 'type_alias',
    UndecoratedClass = 'undecorated_class'
}

/** Types of class members */
export enum MemberType {
    Property = 'property',
    Method = 'method',
    Getter = 'getter',
    Setter = 'setter',
    EnumItem = 'enum_item'
}

/** Informational tags applicable to class members. */
export enum MemberTags {
    Abstract = 'abstract',
    Static = 'static',
    Readonly = 'readonly',
    Protected = 'protected',
    Optional = 'optional',
    Input = 'input',
    Output = 'output',
    Inherited = 'override'
}

/** Documentation entity for single JsDoc tag. */
export interface JsDocTagEntry {
    name: string;
    comment: string;
}

/** Documentation entity for single generic parameter. */
export interface GenericEntry {
    name: string;
    constraint: string | undefined;
    default: string | undefined;
}

/** Base type for all documentation entities. */
export interface DocEntry {
    entryType: EntryType;
    name: string;
    description: string;
    rawComment: string;
    jsdocTags: JsDocTagEntry[];
    /** Where the compiler found the declaration; absent for a synthesized entry (a forwarded host-directive input). */
    source?: { filePath: string; startLine: number; endLine: number };
}

/** A function type as the source writes it, in parts, so that a long one can be broken into lines. */
export interface DeclaredFunctionType {
    generics: string;
    params: string[];
    returnType: string;
}

/** Documentation entity for a constant. */
export interface ConstantEntry extends DocEntry {
    type: string;
    /** The type as the source writes it, where the compiler's `type` spells an alias out as its structure. */
    declaredType?: string;
    /** Set when the constant is an arrow function whose signature the source writes out in full. */
    declaredFunctionType?: DeclaredFunctionType;
}

/** Documentation entity for a type alias. */
export type TypeAliasEntry = ConstantEntry;

/** Documentation entity for a TypeScript class. */
export interface ClassEntry extends DocEntry {
    isAbstract: boolean;
    members: MemberEntry[];
    generics: GenericEntry[];
    isService: boolean;
    /** The `extends` clause as written — one class, or several interfaces. */
    extends?: string | string[];
    implements?: string[];
    /** The argument of `@Injectable(...)` as written, for a service. */
    injectableOptions?: string;
    /** Index signatures as written, `[key: string]: T;` — the extractor reports them nowhere else. */
    indexSignatures?: string[];
}

// From an API doc perspective, class and interfaces are identical.

/** Documentation entity for a TypeScript interface. */
export type InterfaceEntry = ClassEntry;

/** Documentation entity for a TypeScript enum. */
export interface EnumEntry extends DocEntry {
    members: EnumMemberEntry[];
}

/** Documentation entity for an Angular directives and components. */
export interface DirectiveEntry extends ClassEntry {
    selector: string;
    exportAs: string[];
    isStandalone: boolean;
}

/** Documentation entity for an Angular pipe. */
export interface PipeEntry extends ClassEntry {
    pipeName: string | null;
    isStandalone: boolean;
    isPure: boolean;
}

export interface FunctionEntry extends DocEntry {
    params: ParameterEntry[];
    returnType: string;
    /**
     * Text of the `@returns` tag. The compiler splits it off `description` for a function but leaves it a
     * tag on a method, where `normalizeFunctionFields` reads it from.
     */
    returnDescription?: string;
    generics: GenericEntry[];
    isNewType: boolean;
}

/** The Angular initializer API a member is declared with, spelled the way the source calls it. */
export type SignalApi = 'input' | 'input.required' | 'model' | 'model.required' | 'output';

/** Sub-entry for a single class or enum member. */
export interface MemberEntry {
    name: string;
    memberType: MemberType;
    memberTags: MemberTags[];
    description: string;
    jsdocTags: JsDocTagEntry[];
    /** Set when the member is written with `input()`, `model()` or `output()` rather than a decorator. */
    signalApi?: SignalApi;
    /**
     * The type as the source writes it: the first type argument of `input<T>()` and the like, or the
     * annotation. The compiler's resolved `type` expands aliases — a locale override reads as a
     * three-thousand-character object literal.
     */
    declaredType?: string;
    /** The default value of an input as the source writes it, in full — line breaks included. */
    defaultValue?: string;
    /** The class or interface the member is declared in, when it is inherited from one. */
    inheritedFrom?: string;
    /**
     * Set when the member is a binding of a host directive the class forwards: the directive, unless the docs
     * leave it out, and the public names of its input and output that the class exposes, under the member's own
     * aliases.
     */
    forwardedFrom?: { directive?: string; input?: string; output?: string };
}

/** Sub-entry for an enum member. */
export interface EnumMemberEntry extends MemberEntry {
    type: string;
    value: string;
}

/** Sub-entry for a class property. */
export interface PropertyEntry extends MemberEntry {
    type: string;
    inputAlias?: string;
    outputAlias?: string;
    isRequiredInput?: boolean;
}

/** Sub-entry for a class method. */
export type MethodEntry = MemberEntry & FunctionEntry;

/** Sub-entry for a single function parameter. */
export interface ParameterEntry {
    name: string;
    description: string;
    type: string;
    isOptional: boolean;
    isRestParam: boolean;
}

export interface FunctionWithOverloads {
    name: string;
    signatures: FunctionEntry[];
    implementation: FunctionEntry | null;
}
