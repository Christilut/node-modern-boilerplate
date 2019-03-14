export default {
  "compileEnhancements": false,
  "extensions": [
    "ts"
  ],
  "require": [
    "ts-node/register"
  ],
  "files": [
    "tests/*.test.ts"
  ],
  "sources": [
    "server/**/*.ts",
    "config/**/*.ts"
  ]
}
