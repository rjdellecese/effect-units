# Packed-package consumer

This fixture tests the installed tarball, not the repository's source files or self-referencing package imports. CI copies it outside the checkout and runs its Node tests and NodeNext/Bundler typechecks with both the minimum Effect version and the development pin. No test files or configuration are generated at runtime.

Run the same checks locally from the repository root:

```sh
pnpm build
consumer=$(mktemp -d)
trap 'rm -rf "$consumer"' EXIT
cp test/consumer/* "$consumer/"
CI=1 pnpm pack --out "$consumer/effect-units.tgz"
npm --prefix "$consumer" install --ignore-scripts --no-audit --no-fund --package-lock=false
npm --prefix "$consumer" test
npm --prefix "$consumer" install --ignore-scripts --no-audit --no-fund --package-lock=false "effect@$(node -p 'require("./package.json").devDependencies.effect')"
npm --prefix "$consumer" test
```

`public.mts` explicitly imports every public source module. The export test checks that this list matches the top-level JavaScript modules in the installed `dist`, so adding a module requires adding it to the fixture. Both NodeNext and Bundler typecheck literal imports of the private namespace and a representative private subpath with and without its `.js` extension. Node also checks every private module discovered in the installed `dist/internal` at runtime, in both spellings.
