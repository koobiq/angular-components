### Custom Injector for Modal Component

A component passed as `kbqComponent` is created from the **root** environment injector, not from the component that called `KbqModalService`. Anything the caller provides itself is therefore invisible inside the modal: component-level services, tokens from a route or a lazily loaded module, and providers that reach the caller only through NgModules listed in its standalone `imports` — `DateAdapter`, `KBQ_DATE_FORMATS` and `DateFormatter` among them.

To make them available, pass the caller's `injector` to `modalService.open`; it becomes the parent of the modal content's injection hierarchy. Content passed as a `TemplateRef` is unaffected — it keeps the injector of the component that declared it.

A missing dependency surfaces as `NullInjectorError: No provider for …`, thrown while the modal content is being created.

<!-- example(modal-component-with-injector) -->
