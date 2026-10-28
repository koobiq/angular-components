---
name: koobiq-angular-upgrade
description: Upgrades an Angular project to a newer version of the Koobiq design system (@koobiq/components) with ng update - runs its migrations, then works through the warnings and the manual steps they leave. Use when the user asks to update, upgrade or migrate Koobiq or @koobiq/components, to fix what broke after such an update, or to move code off a deprecated or removed Koobiq API.
license: MIT
compatibility: Upgrades projects to @koobiq/components 21 or later; needs the Angular CLI and network access to koobiq.io and its version subdomains.
---

# Upgrading Koobiq

The upgrade guide of the target version is on its site as Markdown, a file per step. This skill says how to find it and work through it.

## Find the target and its site

1. Read the versions of `@koobiq/components` and `@angular/core` in `package.json`, and check that the working tree is clean (`git status`): the migrations rewrite files, and their diff is how you review them.
2. The target is the version the user names, or else the latest: the paragraph under the quote at the top of [llms.txt](https://koobiq.io/llms.txt) names the major version koobiq.io documents. Below 21, this skill does not apply.
3. The site of the target: `https://koobiq.io` for the latest major version, `https://v<major>.koobiq.io` for an older one. Below, `<site>` stands for it.
4. Download a file with `curl -fsSL <url>` when you can run commands, rather than with a fetch tool that summarizes pages and may rewrite the code in them; `-f` makes a missing file an error instead of an HTML page.

## Workflow

1. **Read the guide**: `<site>/en/main/migration.md`, such as [the latest one](https://koobiq.io/en/main/migration.md), lists the steps of the upgrade, each a file of its own, by the version it belongs to. Take the steps between the installed version and the target, in order.
2. **Upgrade Angular first** when the target needs a newer one, a major version at a time, as the steps on upgrading to Angular say.
3. **Run the Koobiq migrations**: `ng update @koobiq/components@<target>`. They rewrite the imports, selectors and inputs that changed, and print a warning for every place they cannot fix.
4. **Work through the warnings** one by one. The list of migrations, `<site>/en/main/migration/ng-update-migrations.md`, says what each one rewrites and what it only warns about; the step of its version has the manual changes.
5. **Review the diff.** The migrations work on the source text: they miss aliased imports, local variables and re-exports.
6. **Build and test**: `ng build` and the project's tests; where the build cannot run, as in some sandboxes, compile the templates with `npx ngc -p tsconfig.app.json --noEmit`. Fix what they report with the same steps and the full lists of breaking changes the guide links.
7. **Report** what the migrations changed, what you changed by hand, and what is left for the user to decide.

To build UI with the upgraded components, use the `koobiq-angular` skill.
