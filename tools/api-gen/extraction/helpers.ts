import fs from 'fs';
import { relative } from 'path';
import ts from 'typescript';
import { isPublic } from '../manifest/helpers';
import {
    ClassEntry,
    DeclaredFunctionType,
    DocEntry,
    EntryType,
    FunctionEntry,
    FunctionWithOverloads,
    MemberEntry,
    MemberTags,
    MemberType,
    PropertyEntry,
    SignalApi
} from '../rendering/entities';
import { isClassEntry } from '../rendering/entities/categorization';
import {
    ClassEntryMetadata,
    DeclarationSourceMetadata,
    DeclaredCallable,
    DeclaredSignature,
    HostDirectiveMetadata,
    MemberBinding,
    MemberSourceMetadata,
    PackageMetadata
} from '../types';

const SIGNAL_APIS: readonly string[] = ['input', 'input.required', 'model', 'model.required', 'output'];

const isSignalApi = (callee: string): callee is SignalApi => SIGNAL_APIS.includes(callee);

/** The object without the keys whose value is `undefined`, so spreading it never erases a known value. */
const defined = <T extends object>(object: T): Partial<T> =>
    Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as Partial<T>;

/** A type as the source writes it, on one line: a signature is read line by line, member by member. */
const typeText = (node: ts.Node | undefined, sourceFile: ts.SourceFile): string | undefined =>
    node?.getText(sourceFile).replace(/\s*\n\s*/g, ' ');

/** The initializer of an object-literal property, addressed by name. */
function findProperty(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
    return object.properties.find(
        (property): property is ts.PropertyAssignment =>
            ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && ts.idText(property.name) === name
    )?.initializer;
}

/** `['checked', 'disabled: isDisabled']` becomes `{ checked: 'checked', disabled: 'isDisabled' }`. */
function readForwardedBindings(node: ts.Expression | undefined): Record<string, string> {
    if (!node || !ts.isArrayLiteralExpression(node)) return {};

    return node.elements.reduce<Record<string, string>>((bindings, element) => {
        if (!ts.isStringLiteral(element)) return bindings;

        const [own, exposedAs] = element.text.split(':').map((part) => part.trim());

        return { ...bindings, [own]: exposedAs || own };
    }, {});
}

/** Reads `hostDirectives` off a `@Component`/`@Directive` decorator. */
function readHostDirectives(node: ts.ClassDeclaration): HostDirectiveMetadata[] {
    const config = (ts.getDecorators(node) ?? [])
        .map(({ expression }) => expression)
        .filter(ts.isCallExpression)
        .flatMap(({ arguments: args }) => [...args])
        .find(ts.isObjectLiteralExpression);
    const declared = config && findProperty(config, 'hostDirectives');

    if (!declared || !ts.isArrayLiteralExpression(declared)) return [];

    return declared.elements.reduce<HostDirectiveMetadata[]>((hostDirectives, element) => {
        // `hostDirectives: [KbqCheckable]` — applied without surfacing anything on the host.
        if (ts.isIdentifier(element)) return [...hostDirectives, { name: ts.idText(element), inputs: {} }];

        if (!ts.isObjectLiteralExpression(element)) return hostDirectives;

        const directive = findProperty(element, 'directive');

        if (!directive || !ts.isIdentifier(directive)) return hostDirectives;

        const outputs = readForwardedBindings(findProperty(element, 'outputs'));

        return [
            ...hostDirectives,
            {
                name: ts.idText(directive),
                inputs: readForwardedBindings(findProperty(element, 'inputs')),
                ...(Object.keys(outputs).length && { outputs })
            }
        ];
    }, []);
}

/** `(value as T)!` and the like — the value itself, which is what a reader of a default cares about. */
function unwrapExpression(node: ts.Expression): ts.Expression {
    let current = node;

    while (
        ts.isParenthesizedExpression(current) ||
        ts.isAsExpression(current) ||
        ts.isSatisfiesExpression(current) ||
        ts.isNonNullExpression(current) ||
        ts.isTypeAssertionExpression(current)
    ) {
        current = current.expression;
    }

    return current;
}

/**
 * The default as the source writes it, in full; nothing for `undefined`, which is what an input without one
 * gets. A default spanning lines keeps them, each shifted left by the indentation of the line it starts on.
 */
function readDefaultValue(node: ts.Expression | undefined, sourceFile: ts.SourceFile): string | undefined {
    if (!node) return undefined;

    const value = unwrapExpression(node);

    if ((ts.isIdentifier(value) && ts.idText(value) === 'undefined') || ts.isVoidExpression(value)) return undefined;

    const { line } = sourceFile.getLineAndCharacterOfPosition(value.getStart(sourceFile));
    const lineStart = sourceFile.getPositionOfLineAndCharacter(line, 0);
    const indent = sourceFile.text.slice(lineStart).search(/\S/);
    const [first, ...rest] = value.getText(sourceFile).split('\n');

    return [first, ...rest.map((text) => text.slice(Math.min(indent, text.search(/\S|$/))))].join('\n');
}

/** The call of a decorator such as `@Input(...)` on a member, if it has one. */
const findDecorator = (node: ts.HasDecorators, name: string): ts.CallExpression | undefined =>
    (ts.getDecorators(node) ?? [])
        .map(({ expression }) => expression)
        .filter(ts.isCallExpression)
        .find((call) => ts.isIdentifier(call.expression) && ts.idText(call.expression) === name);

/** The text of a string-literal property of an options object — `alias` in `{ alias: 'x' }`. */
function readStringOption(node: ts.Expression | undefined, name: string): string | undefined {
    const value = node && ts.isObjectLiteralExpression(node) ? findProperty(node, name) : undefined;

    return value && ts.isStringLiteralLike(value) ? value.text : undefined;
}

/** `@Input('alias')`, `@Input({ alias, required })` or `@Output('alias')` as the names a template binds. */
function readDecoratorBinding(element: ts.HasDecorators, name: string): MemberBinding | undefined {
    const input = findDecorator(element, 'Input');
    const output = findDecorator(element, 'Output');

    if (!input && !output) return undefined;

    const aliasOf = (call: ts.CallExpression): string => {
        const [argument] = call.arguments;

        return (
            (argument && ts.isStringLiteralLike(argument) ? argument.text : readStringOption(argument, 'alias')) ?? name
        );
    };
    const options = input?.arguments[0];
    const required = input
        ? !!options &&
          ts.isObjectLiteralExpression(options) &&
          findProperty(options, 'required')?.kind === ts.SyntaxKind.TrueKeyword
        : undefined;

    return defined({ input: input && aliasOf(input), output: output && aliasOf(output), required });
}

/** The names a signal-based member binds under: `model()` is an input and its `Change` output. */
function readSignalBinding(api: SignalApi, name: string, alias: string | undefined): MemberBinding {
    const bound = alias ?? name;

    if (api === 'output') return { output: bound };

    const required = api.endsWith('.required');

    return api.startsWith('model') ? { input: bound, output: `${bound}Change`, required } : { input: bound, required };
}

/** `new EventEmitter<T>()` as `EventEmitter<T>` — the type its type arguments name. */
function readConstructedType(node: ts.Expression, sourceFile: ts.SourceFile): string | undefined {
    if (!ts.isNewExpression(node) || !node.typeArguments?.length) return undefined;

    return `${node.expression.getText(sourceFile)}<${node.typeArguments.map((type) => typeText(type, sourceFile)).join(', ')}>`;
}

function readSignature(node: ts.SignatureDeclarationBase, sourceFile: ts.SourceFile): DeclaredSignature {
    return {
        params: node.parameters.map(({ type }) => typeText(type, sourceFile)),
        ...defined({ returnType: typeText(node.type, sourceFile) })
    };
}

/** The signatures of a function or method, from all its declarations: the overloads and the one with a body. */
function readCallable(
    declarations: (ts.SignatureDeclarationBase & { body?: ts.Node })[],
    sourceFile: ts.SourceFile
): DeclaredCallable {
    const implementation = declarations.find(({ body }) => body);

    return {
        overloads: declarations.filter(({ body }) => !body).map((node) => readSignature(node, sourceFile)),
        ...(implementation && { implementation: readSignature(implementation, sourceFile) })
    };
}

/**
 * The type of an exported constant as its declaration writes it — an annotation, the signature of an arrow
 * function, the type arguments of `new InjectionToken<T>()` — or nothing, when only the compiler knows it:
 * an object literal, or a value read from elsewhere, is written out in full by the typings too.
 */
function readConstantType(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
): Pick<DeclarationSourceMetadata, 'declaredType' | 'declaredFunctionType'> {
    if (declaration.type) return defined({ declaredType: typeText(declaration.type, sourceFile) });

    const initializer = declaration.initializer && unwrapExpression(declaration.initializer);

    if (!initializer) return {};

    if (
        (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) &&
        initializer.type &&
        initializer.parameters.every(({ type }) => type)
    ) {
        const functionType: DeclaredFunctionType = {
            generics: initializer.typeParameters
                ? `<${initializer.typeParameters.map((parameter) => typeText(parameter, sourceFile)).join(', ')}>`
                : '',
            params: initializer.parameters.map(
                (parameter) =>
                    `${parameter.dotDotDotToken ? '...' : ''}${parameter.name.getText(sourceFile)}${parameter.questionToken || parameter.initializer ? '?' : ''}: ${typeText(parameter.type, sourceFile)}`
            ),
            returnType: typeText(initializer.type, sourceFile)!
        };

        return {
            declaredType: `${functionType.generics}(${functionType.params.join(', ')}) => ${functionType.returnType}`,
            declaredFunctionType: functionType
        };
    }

    return defined({ declaredType: readConstructedType(initializer, sourceFile) });
}

/** What the source says about one member that the compiler's resolved entry does not. */
function readMemberSource(
    element: ts.ClassElement | ts.TypeElement,
    name: string,
    sourceFile: ts.SourceFile
): MemberSourceMetadata {
    if (ts.isGetAccessorDeclaration(element) || ts.isPropertySignature(element)) {
        return defined({
            declaredType: typeText(element.type, sourceFile),
            binding: ts.isGetAccessorDeclaration(element) ? readDecoratorBinding(element, name) : undefined
        });
    }

    if (ts.isSetAccessorDeclaration(element)) {
        return defined({
            declaredType: typeText(element.parameters[0]?.type, sourceFile),
            binding: readDecoratorBinding(element, name)
        });
    }

    if (!ts.isPropertyDeclaration(element)) return {};

    const annotation = typeText(element.type, sourceFile);
    const initializer = element.initializer && unwrapExpression(element.initializer);
    const callee = initializer && ts.isCallExpression(initializer) && initializer.expression.getText(sourceFile);

    if (initializer && ts.isCallExpression(initializer) && callee && isSignalApi(callee)) {
        // `input()` and `model()` take a default first; `input.required()` and `output()` only options.
        const takesDefault = callee === 'input' || callee === 'model';
        const alias = readStringOption(initializer.arguments[takesDefault ? 1 : 0], 'alias');

        return defined({
            signalApi: callee,
            declaredType: typeText(initializer.typeArguments?.[0], sourceFile) ?? annotation,
            defaultValue: takesDefault ? readDefaultValue(initializer.arguments[0], sourceFile) : undefined,
            binding: readSignalBinding(callee, name, alias)
        });
    }

    // `new EventEmitter<KbqPopUpPlacements>()` names its type where an annotation would; the compiler
    // would spell the alias out as its whole union.
    const constructed = initializer && readConstructedType(initializer, sourceFile);

    return defined({
        declaredType: annotation ?? constructed,
        defaultValue: findDecorator(element, 'Input') ? readDefaultValue(element.initializer, sourceFile) : undefined,
        binding: readDecoratorBinding(element, name)
    });
}

/** The name a member is addressed by, or nothing for a computed or `#private` one. */
function readMemberName(element: ts.ClassElement | ts.TypeElement): string | undefined {
    const name = element.name;

    return name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
}

function readMembers(
    elements: ts.NodeArray<ts.ClassElement | ts.TypeElement>,
    sourceFile: ts.SourceFile
): Record<string, MemberSourceMetadata> {
    const methods = new Map<string, (ts.MethodDeclaration | ts.MethodSignature)[]>();
    const members = elements.reduce<Record<string, MemberSourceMetadata>>((result, element) => {
        const name = readMemberName(element);

        if (!name) return result;

        if (ts.isMethodDeclaration(element) || ts.isMethodSignature(element)) {
            methods.set(name, [...(methods.get(name) ?? []), element]);
        }

        const source = readMemberSource(element, name, sourceFile);
        const previous = Object.prototype.hasOwnProperty.call(result, name) ? result[name] : {};

        // A getter's type is the one a reader gets back, so it wins over its setter's, whichever comes first.
        return {
            ...result,
            [name]: ts.isSetAccessorDeclaration(element) ? { ...source, ...previous } : { ...previous, ...source }
        };
    }, {});

    for (const [name, declarations] of methods) {
        members[name] = { ...members[name], callable: readCallable(declarations, sourceFile) };
    }

    return members;
}

/** `[key: string]: T;` as written, on one line: the extractor reports no index signature. */
const readIndexSignatures = (
    elements: ts.NodeArray<ts.ClassElement | ts.TypeElement>,
    sourceFile: ts.SourceFile
): string[] =>
    elements
        .filter((element) => ts.isIndexSignatureDeclaration(element))
        .map((element) => `${typeText(element, sourceFile)!.replace(/[;,]\s*$/, '')};`);

/** The names in an `extends` clause, as written. */
function readBases(clauses: ts.NodeArray<ts.HeritageClause> | undefined, sourceFile: ts.SourceFile): string[] {
    return (clauses ?? [])
        .filter(({ token }) => token === ts.SyntaxKind.ExtendsKeyword)
        .flatMap(({ types }) => types.map(({ expression }) => expression.getText(sourceFile)));
}

function readClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): ClassEntryMetadata {
    const decorators = (ts.getDecorators(node) ?? [])
        .map(({ expression }) => expression)
        .filter(ts.isCallExpression)
        .filter((call) => ts.isIdentifier(call.expression));
    const decoratorName = (call: ts.CallExpression): string => ts.idText(call.expression as ts.Identifier);
    const injectable = decorators.find((call) => decoratorName(call) === 'Injectable');
    const bases = readBases(node.heritageClauses, sourceFile);
    const indexSignatures = readIndexSignatures(node.members, sourceFile);

    return {
        decorators: decorators.map(decoratorName),
        bases,
        hostDirectives: readHostDirectives(node),
        members: readMembers(node.members, sourceFile),
        ...(indexSignatures.length && { indexSignatures }),
        ...defined({ injectableOptions: injectable?.arguments[0]?.getText(sourceFile).replace(/\s*\n\s*/g, ' ') })
    };
}

/**
 * The class or interface in `name`'s hierarchy that declares `member` itself, nearest first. Angular's
 * extractor only tags a member as inherited; without this the docs could not say where it comes from.
 */
function findDeclaringClass(
    name: string,
    member: string,
    metadataByName: Record<string, ClassEntryMetadata>
): string | undefined {
    const queue = [...(metadataByName[name]?.bases ?? [])];
    const visited = new Set<string>();

    while (queue.length) {
        const current = queue.shift()!;
        const metadata = metadataByName[current];

        if (visited.has(current) || !metadata) continue;

        visited.add(current);

        if (Object.prototype.hasOwnProperty.call(metadata.members, member)) return current;

        queue.push(...metadata.bases);
    }

    return undefined;
}

/** Adds what the source says about `member` of `className` — its declared type, default, and origin. */
function withSourceMetadata(
    member: MemberEntry,
    className: string,
    metadataByName: Record<string, ClassEntryMetadata>,
    isDirective = false
): MemberEntry {
    const isInherited = member.memberTags.includes(MemberTags.Inherited);
    const declaringClass = isInherited ? findDeclaringClass(className, member.name, metadataByName) : className;
    const members = declaringClass && metadataByName[declaringClass]?.members;
    const { binding, callable, ...source }: MemberSourceMetadata =
        members && Object.prototype.hasOwnProperty.call(members, member.name) ? members[member.name] : {};
    const isBound = member.memberTags.includes(MemberTags.Input) || member.memberTags.includes(MemberTags.Output);

    return withDeclaredSignatures(
        {
            ...member,
            ...source,
            // An unresolved origin still says "not declared here": the base class as the extends clause names it.
            ...(isInherited && { inheritedFrom: declaringClass ?? metadataByName[className]?.bases[0] }),
            // A directive inherits the bindings of its base directive; a service extending one binds nothing.
            ...(isInherited && isDirective && binding && !isBound && withBinding(member, binding))
        },
        callable
    );
}

/**
 * The parameter and return types of a function or method as the source writes them, over the compiler's:
 * it spells an alias out — a `KbqDeepPartial<KbqInputLocaleConfiguration>` parameter reads as the whole
 * nested object — where the typings, and a reader, keep the name. A missing annotation keeps the compiler's.
 */
function withDeclaredSignatures<T extends object>(entry: T, callable: DeclaredCallable | undefined): T {
    const { signatures, implementation } = entry as Partial<FunctionWithOverloads>;

    if (!callable || (!signatures && !implementation)) return entry;

    const apply = (signature: FunctionEntry, declared: DeclaredSignature | undefined): FunctionEntry =>
        declared
            ? {
                  ...signature,
                  params: (signature.params ?? []).map((param, index) =>
                      declared.params[index] ? { ...param, type: declared.params[index]! } : param
                  ),
                  ...defined({ returnType: declared.returnType })
              }
            : signature;
    // Without overloads the extractor lists the implementation as the one signature.
    const overloads = callable.overloads.length ? callable.overloads : [callable.implementation];

    return {
        ...entry,
        ...(signatures && { signatures: signatures.map((signature, index) => apply(signature, overloads[index])) }),
        ...(implementation && { implementation: apply(implementation, callable.implementation) })
    };
}

/** The input and output marks Angular's extractor gives the bindings a class declares itself. */
function withBinding(member: MemberEntry, { input, output, required }: MemberBinding): Partial<PropertyEntry> {
    return {
        memberTags: [
            ...member.memberTags,
            ...(input ? [MemberTags.Input] : []),
            ...(output ? [MemberTags.Output] : [])
        ],
        ...defined({ inputAlias: input, outputAlias: output, isRequiredInput: input ? !!required : undefined })
    };
}

/**
 * A two-way input that needs a `transform` cannot be a `model()`, which takes none. It is written as a
 * `@docs-private` input aliased to the public name, a signal the class reads and writes under that name,
 * and — for two-way binding — an output named after it with a `Change` suffix. What a template binds is
 * one `[(name)]` member, so the three are shown as that one, declared the way it behaves: a `model()`.
 */
function mergeBackingInputs(members: MemberEntry[]): MemberEntry[] {
    const backingInputs = members.filter(
        (member): member is PropertyEntry => member.memberTags.includes(MemberTags.Input) && !isPublic(member)
    );

    return backingInputs.reduce((result, backing) => {
        const name = backing.inputAlias;
        const target = result.find(
            (member) =>
                member.name === name &&
                // A getter too: one that adds to the bound value what the class knows, a filter say.
                (member.memberType === MemberType.Property || member.memberType === MemberType.Getter) &&
                !member.memberTags.includes(MemberTags.Input) &&
                isPublic(member)
        ) as PropertyEntry | undefined;

        if (!name || name === backing.name || !target) return result;

        const change = result.find(
            (member) =>
                member.memberTags.includes(MemberTags.Output) &&
                ((member as PropertyEntry).outputAlias ?? member.name) === `${name}Change`
        );
        const merged: PropertyEntry = {
            ...target,
            memberType: MemberType.Property,
            memberTags: [...target.memberTags, MemberTags.Input, ...(change ? [MemberTags.Output] : [])],
            inputAlias: name,
            isRequiredInput: backing.isRequiredInput,
            signalApi: `${change ? 'model' : 'input'}${backing.isRequiredInput ? '.required' : ''}` as SignalApi,
            ...defined({
                outputAlias: change && `${name}Change`,
                declaredType: backing.declaredType ?? target.declaredType,
                defaultValue: backing.defaultValue
            })
        };

        return result.filter((member) => member !== change).map((member) => (member === target ? merged : member));
    }, members);
}

/**
 * Adds the inputs and outputs a host directive surfaces on its host to the host's own members.
 *
 * Angular's extractor reports what a class declares, and a forwarded binding is declared on the directive —
 * so without this it is documented nowhere, and somebody writing the markup cannot find the binding they
 * are expected to write.
 */
function withHostDirectiveBindings(
    members: MemberEntry[],
    metadata: ClassEntryMetadata | undefined,
    entriesByName: Record<string, DocEntry>,
    metadataByName: Record<string, ClassEntryMetadata>
): MemberEntry[] {
    if (!metadata?.hostDirectives?.length) return members;

    const forwarded = metadata.hostDirectives.flatMap(({ name, inputs, outputs = {} }) =>
        (((entriesByName[name] as ClassEntry | undefined)?.members ?? []) as PropertyEntry[]).flatMap(
            (member): PropertyEntry[] => {
                // Angular matches a forwarded binding by its public name, which is the alias when it has one.
                const input = member.memberTags.includes(MemberTags.Input) ? (member.inputAlias ?? member.name) : '';
                const output = member.memberTags.includes(MemberTags.Output) ? (member.outputAlias ?? member.name) : '';
                const exposedInput = (input && inputs[input]) || undefined;
                const exposedOutput = (output && outputs[output]) || undefined;

                if (!exposedInput && !exposedOutput) return [];

                return [
                    {
                        ...(withSourceMetadata(member, name, metadataByName) as PropertyEntry),
                        name: (exposedInput ?? exposedOutput)!,
                        // The host binds it under the exposed names, and only as what it forwards: a `model()`
                        // whose `Change` output stays behind is an input there. Where it comes from is the
                        // directive, whatever that directive inherits it from.
                        memberTags: member.memberTags.filter(
                            (tag) =>
                                tag !== MemberTags.Inherited &&
                                (tag !== MemberTags.Input || !!exposedInput) &&
                                (tag !== MemberTags.Output || !!exposedOutput)
                        ),
                        inputAlias: exposedInput,
                        outputAlias: exposedOutput,
                        inheritedFrom: undefined,
                        forwardedFrom: {
                            directive: name,
                            ...defined({ input: exposedInput && input, output: exposedOutput && output })
                        }
                    }
                ];
            }
        )
    );

    // A binding the host declares itself is the one that gets bound, so it wins. Another member of the same
    // name — a getter the host reads its state through, say — binds nothing, and does not.
    const boundNames = (tag: MemberTags, alias: (member: PropertyEntry) => string | undefined): Set<string> =>
        new Set(
            members
                .filter((member) => member.memberTags.includes(tag))
                .map((member) => alias(member as PropertyEntry) ?? member.name)
        );
    const hostInputs = boundNames(MemberTags.Input, ({ inputAlias }) => inputAlias);
    const hostOutputs = boundNames(MemberTags.Output, ({ outputAlias }) => outputAlias);

    return [
        ...members,
        ...forwarded.filter(
            ({ inputAlias, outputAlias }) =>
                !(inputAlias && hostInputs.has(inputAlias)) && !(outputAlias && hostOutputs.has(outputAlias))
        )
    ];
}

/**
 * Updates the entries in the documentation with additional information based on class metadata.
 *
 * For each class entry, adds information about its base class,
 * filters member metadata, adds service status, and base class.
 * Returns an updated array of documentation entries with enriched class information.
 */
export function updateEntries(
    entries: DocEntry[],
    classMetadata: Record<string, ClassEntryMetadata>,
    entriesByName: Record<string, DocEntry> = {},
    metadataByName: Record<string, ClassEntryMetadata> = classMetadata,
    declarationsByName: Record<string, DeclarationSourceMetadata> = {}
): DocEntry[] {
    return entries.reduce((res: DocEntry[], entry: DocEntry) => {
        const declaration = Object.prototype.hasOwnProperty.call(declarationsByName, entry.name)
            ? declarationsByName[entry.name]
            : undefined;

        if (entry.entryType === EntryType.Constant || entry.entryType === EntryType.Function) {
            // Another name for a constant has its type; the typings write it with that constant's annotations.
            const aliased = declaration?.aliasOf ? declarationsByName[declaration.aliasOf] : undefined;

            const typed = declaration?.declaredType ? declaration : aliased;

            res.push(
                withDeclaredSignatures(
                    {
                        ...entry,
                        ...defined({
                            declaredType: typed?.declaredType,
                            declaredFunctionType: typed?.declaredFunctionType
                        })
                    },
                    declaration?.callable
                )
            );

            return res;
        }

        if (entry.entryType === EntryType.Interface) {
            const members = ((entry as ClassEntry).members ?? []).map((member) =>
                withSourceMetadata(member, entry.name, metadataByName)
            );
            const indexSignatures = (metadataByName[entry.name] ?? classMetadata[entry.name])?.indexSignatures;

            res.push({ ...entry, members, ...defined({ indexSignatures }) } as ClassEntry);

            return res;
        }

        // A function, a constant or an interface has none of what is added below, and grafting `members`,
        // `isService` onto it produced a second, class-shaped copy of the same entry.
        if (!isClassEntry(entry)) {
            res.push(entry);

            return res;
        }

        const metadata = metadataByName[entry.name] ?? classMetadata[entry.name];
        const isDirective = entry.entryType === EntryType.Component || entry.entryType === EntryType.Directive;
        const ownMembers = mergeBackingInputs(
            (entry.members ?? []).map((member) => withSourceMetadata(member, entry.name, metadataByName, isDirective))
        );

        res.push({
            ...entry,
            members: withHostDirectiveBindings(ownMembers, metadata, entriesByName, metadataByName),
            isService: metadata?.decorators?.includes('Injectable'),
            ...defined({ injectableOptions: metadata?.injectableOptions, indexSignatures: metadata?.indexSignatures })
        } as ClassEntry);

        return res;
    }, []);
}

/**
 * Reads what Angular's extractor does not report from one source file: per class and interface, its
 * decorators, bases, host directives and the declared form of every member; per exported constant and
 * function, its declared type or signatures.
 */
export function readSourceFile(entrySrc: string): {
    classes: Record<string, ClassEntryMetadata>;
    declarations: Record<string, DeclarationSourceMetadata>;
} {
    const fileContent = fs.readFileSync(entrySrc, 'utf8');
    const sourceFile = ts.createSourceFile(entrySrc, fileContent, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const classes: Record<string, ClassEntryMetadata> = {};
    const declarations: Record<string, DeclarationSourceMetadata> = {};
    const functions = new Map<string, ts.FunctionDeclaration[]>();

    sourceFile.forEachChild((node) => {
        if (ts.isClassDeclaration(node) && node.name) {
            classes[ts.idText(node.name)] = readClass(node, sourceFile);
        }

        if (ts.isInterfaceDeclaration(node)) {
            const indexSignatures = readIndexSignatures(node.members, sourceFile);

            classes[ts.idText(node.name)] = {
                decorators: [],
                bases: readBases(node.heritageClauses, sourceFile),
                hostDirectives: [],
                members: readMembers(node.members, sourceFile),
                ...(indexSignatures.length && { indexSignatures })
            };
        }

        if (ts.isFunctionDeclaration(node) && node.name) {
            functions.set(ts.idText(node.name), [...(functions.get(ts.idText(node.name)) ?? []), node]);
        }

        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                if (ts.isIdentifier(declaration.name)) {
                    const initializer = declaration.initializer && unwrapExpression(declaration.initializer);

                    declarations[ts.idText(declaration.name)] = {
                        ...readConstantType(declaration, sourceFile),
                        ...defined({
                            aliasOf: initializer && ts.isIdentifier(initializer) ? ts.idText(initializer) : undefined
                        })
                    };
                }
            }
        }
    });

    for (const [name, overloads] of functions) declarations[name] = { callable: readCallable(overloads, sourceFile) };

    return { classes, declarations };
}

/** Merge paths for ts-compiler */
export function prepareMergedMetadata(modules: { [moduleName: string]: PackageMetadata[] }): {
    rootNames: string[];
    paths: ts.MapLike<string[]>;
} {
    const paths: { [key: string]: any } = {};
    const rootNames: string[] = [];

    for (const packages of Object.values(modules)) {
        packages.forEach(({ tsCompilerPath, resolvedPath }) => {
            // Update paths object with entry point path mapping to index path
            paths![tsCompilerPath] = [resolvedPath];

            rootNames.push(resolvedPath);
        });
    }

    // Set a default path mapping for all modules
    paths!['*'] = [relative('packages', 'external/npm/node_modules/*')];

    return { paths, rootNames };
}
