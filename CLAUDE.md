# CLI Example Project Guide

## Commands

- Build project: `npm run build`
- Development mode: `npm run dev`
- Run all tests: `npm run test`
- Run tests with UI: `npm run test:ui`
- Run a single test: `npx vitest path/to/test.tsx` or `npx vitest -t "test name"`
- Format code: `npx prettier --write .`

## Code Style

- TypeScript with React and Ink for CLI interfaces
- 2 space indentation, 80 char width, single quotes
- Use named exports for components: `export function Component()`
- Functional components with hooks (no classes)
- Consistent naming: components (PascalCase), hooks (useXxx), utils (camelCase)
- Group imports: external packages first, then internal modules
- Imports should be sorted alphabetically
- Imports need to have extensions: `import useCommand from './hooks/useCommand.js';`
- Tests use .test.tsx suffix with Vitest framework
- Components go in `/source/components/`, hooks in `/srouce/hooks/`, utilities in `/source/utils/`
- Prefer explicit typing over type inference where appropriate
- Follow React best practices for hooks (dependencies array, cleanup)
