# critical-import-5e

FoundryVTT import module for monsters, NPCs, items, spells, and so on.

## Development

### Development environment

For a simple development environment add a symlink from the "dist/PROJECT_NAME" directory of this repository into your FoundryVTT modules dir.

#### MacOS example

```
ln -s ~/src/critical-import-5e/dist/critical-import-5e/ /Users/Beaver/Library/Application\ Support/FoundryVTT/Data/modules
```

To build the project execute `yarn run build` or for a distribution build `yarn run build-dist`.
