# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Commands

- Build & Prepare: `npm run build`
- Run tests: `npm run test` (all) or `node --test test/rules/[rule-file-path].test.ts` (specific)
- Verify code: `npm run agent:check` (runs typecheck, test, and lint in sequence)
- Lint: `npm run lint` or `npm run lint:fix`
- Generate AST for analysis: `npm run agent:ast:acorn` or `npm run agent:ast:typescript`

## Code Style & Guidelines

- Use TypeScript with strict typing
- Follow named exports pattern with explicit `.ts` extensions in imports
- Rule implementation follows factory pattern with `createRuleV2`
- Rule files follow `[category].[subcategory].[feature].[subfeature].ts` naming
- Thorough test coverage (see devDocs/04-testing-guidelines.md)
- Clean functional approach with minimal side effects

## ESLint Plugin Patterns

- Use appropriate validator based on feature type:
  - `createConstructorValidator` for constructor detection
  - `createInstanceMethodValidator` for instance methods
  - `createStaticMethodValidator` for static methods
  - `createPropertyValidator` for properties

For detailed documentation on design patterns, implementation approach, and testing guidelines, refer to files in the devDocs directory.
