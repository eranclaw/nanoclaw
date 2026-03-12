# Dependency Upgrade Notes

## TypeScript 5.6 → 5.7

- New `satisfies` improvements for better type narrowing
- `--noUncheckedSideEffectImports` flag available (not enabled yet)
- Stricter `--isolatedDeclarations` checks

## Vitest 2.x → 3.x

### Breaking Changes
- `vi.mocked()` signature changed: now requires explicit generic
- Snapshot format v3 - run `vitest --update` to migrate
- `--threads` renamed to `--pool=threads`
- `expect.assertions()` now strict by default

### New Features
- Built-in browser mode (experimental)
- Improved coverage reporting
- `toMatchFileSnapshot()` matcher

## Other Updates

| Package | From | To |
|---------|------|----|
| `@types/node` | 22.10 | 22.13 |
| `prettier` | 3.4.2 | 3.5.3 |
| `lint-staged` | 15.3 | 15.5 |
| `husky` | 9.1 | 9.2 |

## Migration Checklist

- [x] Update package.json versions
- [ ] Run full test suite
- [ ] Verify build output
- [ ] Update CI config if needed
- [ ] Check for deprecation warnings
