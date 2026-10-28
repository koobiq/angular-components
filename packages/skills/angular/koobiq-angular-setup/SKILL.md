---
name: koobiq-angular-setup
description: Sets up the Koobiq design system (@koobiq/components) in an Angular project - installs it with ng add, then checks the styles, theme, locale and fonts it needs and builds the project. Use when the project has no @koobiq/components yet, when the user asks to add, install or set up Koobiq, or when Koobiq components render unstyled, without icons or with Russian labels.
license: MIT
compatibility: Angular 21 or later, with the Angular CLI. Reads the installation guide from koobiq.io and its version subdomains, so it needs network access to them.
---

# Setting up Koobiq

Koobiq follows the major version of Angular: Angular 21 takes `@koobiq/components` 21. The installation guide of that version is the reference; this skill says how to apply it and check the result.

## Find the version and its site

1. Read `@angular/core` in `package.json`. Below 21, this skill does not apply: say so, and offer to upgrade Angular first.
2. If `package.json` already lists `@koobiq/components`, skip the installation and go on to the checks.
3. Pick the site: the paragraph under the quote at the top of [llms.txt](https://koobiq.io/llms.txt) names the major version koobiq.io documents. The same major as Angular: `https://koobiq.io`. An older one: `https://v<major>.koobiq.io`. A newer one has no Koobiq release yet: say so and stop. Below, `<site>` stands for that address.
4. Download a file with `curl -fsSL <url>` when you can run commands, rather than with a fetch tool that summarizes pages and may rewrite the code in them.

## Workflow

1. **Read the guide**: `<site>/en/main/installation.md`.
2. **Install**: `ng add @koobiq/components@<major> --skip-confirmation --defaults`; without these flags it waits for answers that only a terminal can give. It installs the packages at the versions the project's Angular needs, adds the styles to `angular.json`, the theme classes to `index.html` and the theme provider to the application. Pass `--project <name>` in a workspace of several applications, and `--theme light`, `dark` or `auto` when the user asked for one. Add the packages by hand only where `ng add` cannot run, by the manual steps of the guide.
3. **Act on what `ng add` prints**: each warning names a step it could not take and the guide that covers it.
4. **Check the wiring** against the guide and fix only what is missing: the styles and their order in `angular.json`, the classes of `<body>`, the providers of the application.
5. **Set the locale**: until the application provides one, the components render their own labels, such as placeholders and the names of icon buttons, in Russian. Provide the language of the application as the guide shows; ask the user when neither the request nor the project makes it clear.
6. **Add the fonts** as `<site>/en/main/typography.md` shows: Fontsource when the application must not load fonts from a CDN.
7. **Add only what the task needs**: the date adapter for the date components, `marked` for markdown, `highlight.js` for code blocks; the guide lists them.
8. **Check that it works**: render the component the guide ends with, then run `ng build`. Where the build cannot run, as in some sandboxes, compile the templates with `npx ngc -p tsconfig.app.json --noEmit` instead.
9. **Offer the MCP server** when the agent supports MCP: `<site>/en/main/ai-agents.md` shows how to add `@koobiq/mcp` to the project. Add it only if the user agrees.

To build UI on top of the setup, use the `koobiq-angular` skill.
