// Node >= 22.18 strips TypeScript types natively, and Mocha's `import()`-first loader would then
// bypass ts-node entirely: tests would run without type-checking and fail on TS-only syntax.
// Disabling native stripping makes Mocha fall back to `require`, which ts-node handles.
const nativeTypeScript = Boolean(process.features && process.features.typescript)

module.exports = {
    require: ["ts-node/register", "./test/setup.ts"],
    spec: ["test/**/*.ts"],
    ignore: ["test/setup.ts", "test/helpers.ts"],
    "node-option": nativeTypeScript ? ["no-experimental-strip-types"] : [],
}
