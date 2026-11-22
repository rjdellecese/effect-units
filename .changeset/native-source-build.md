---
"effect-units": patch
---

Source builds and Git installs now use the TypeScript 7 compiler bundled with `@effect/tsgo`. On platforms without its native `tsrs` binary, including Alpine Linux and 32-bit Windows, install the prebuilt npm package instead. The npm package's runtime requirements and public API are unchanged.
