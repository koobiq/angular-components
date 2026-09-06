/**
 * Data for the `username-pipe-injection` migration.
 *
 * The username review split the pipes' injectable role from their pipe role. Both classes used to carry
 * `@Injectable({ providedIn: 'root' })` on top of `@Pipe`, which produced a root singleton whose
 * `inject(KBQ_PROFILE_MAPPING)` resolved at the root injector — so the documented `inject(KbqUsernamePipe)`
 * pattern silently ignored the component- or route-level mapping the token exists for, and formatted a
 * profile differently from the `kbq-username` right next to it.
 *
 * `providedIn: 'root'` is gone. In a template both pipes work exactly as before; obtained through DI they
 * no longer resolve at all, which is the one breaking call site.
 *
 * Warn-only: the replacement is a different expression (`kbqInjectUsernameFormatter()` returns a
 * function, not an object with `transform`), and it has to be evaluated in an injection context.
 */

/** Import specifier that marks a file as a username consumer. */
export const USERNAME_PACKAGE = '@koobiq/components/username';

/** Identifier and element shapes that mark a consumer without an import. */
export const USERNAME_TYPE = '\\bKbqUsername\\w*\\b|\\bkbq-username\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: USERNAME_TYPE,
        pattern: 'inject\\(\\s*KbqUsernamePipe\\s*\\)',
        message:
            'KbqUsernamePipe is no longer providedIn: "root", so inject(KbqUsernamePipe) throws a ' +
            'NullInjectorError. Replace it with kbqInjectUsernameFormatter(), which returns a ' +
            '(profile, format?) => string bound to the KBQ_PROFILE_MAPPING visible where you call it — ' +
            'that is the mapping kbq-username renders with, which the root singleton could never see.'
    },
    {
        anchor: USERNAME_TYPE,
        pattern: 'inject\\(\\s*KbqUsernameCustomPipe\\s*\\)',
        message:
            'KbqUsernameCustomPipe is no longer providedIn: "root", so inject(KbqUsernameCustomPipe) throws ' +
            'a NullInjectorError. Call kbqFormatUsernameCustom(profile, format, inject(KBQ_PROFILE_MAPPING)) ' +
            'from your own injection context instead.'
    },
    {
        anchor: USERNAME_TYPE,
        pattern: ':\\s*KbqUsername(?:Custom)?Pipe\\b',
        message:
            'A KbqUsernamePipe / KbqUsernameCustomPipe constructor parameter or field is resolved through DI ' +
            'only while the class is providedIn: "root", which it no longer is. Use ' +
            'kbqInjectUsernameFormatter() or the kbqFormatUsername / kbqFormatUsernameCustom functions; the ' +
            'pipes themselves keep working in templates.'
    },
    {
        // The only symbol of the package whose name does not start with `KbqUsername`.
        anchor: USERNAME_PACKAGE,
        pattern: '\\bKbqMappingMissingError\\b',
        message:
            'KbqMappingMissingError is removed. It could never be thrown — KBQ_PROFILE_MAPPING is created ' +
            'with a factory, so the optional inject() never returned null — and both pipes now fall back to ' +
            'the exported kbqDefaultProfileMapping.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The shipped KBQ_PROFILE_MAPPING now maps the uppercase keys F / M / L as well, so ' +
        '{{ user | kbqUsernameCustom }} with the library default format renders the surname instead of a ' +
        'literal capital L. A mapping of your own that only covers f / m / l keeps working; spread ' +
        'kbqDefaultProfileMapping to pick the uppercase keys up.',
    '  kbq-username renders the name of a profile that carries only some of the name fields. It used to ' +
        'require both firstName and lastName, so { lastName, login } rendered the login alone and ' +
        '{ firstName, middleName } rendered an empty element.',
    '  KbqUsernameSecondaryHint is exported by KbqUsernameModule. It was declared, documented and used by ' +
        'the component template, but missing from the module — so inside a <kbq-username-custom-view> the ' +
        'directive silently did not apply, and the hint rendered in the primary color.',
    '  The secondary color no longer depends on an adjacent primary sibling, so a login with no name in ' +
        'front of it renders in the secondary color as intended.',
    '  Initials are taken by code point, so a name starting outside the BMP no longer abbreviates to a ' +
        'lone surrogate.',
    '  The kbq-title directive is not attached in mode="text", which applies no ellipsis for it to detect.',
    '  The site hint carries a visually hidden label from the new `username.siteLabel` locale key.'
];
