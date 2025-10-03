# Agent Developer Guide

This document provides guidelines for AI coding agents working on the `mermaid-ast-server` project. Adhering to these conventions will ensure code quality, consistency, and maintainability.

## 1. Project Overview

This project is a simple Node.js HTTP server that provides an API endpoint (`/parse`) to convert Mermaid diagram text into a JSON Abstract Syntax Tree (AST). It uses the `@mermaid-js/parser` library for the core parsing functionality.

## 2. Tech Stack

- **Runtime**: Node.js
- **Package Manager**: pnpm (invoked via `npx corepack pnpm`)
- **Language**: JavaScript (ES Modules)
- **Linter**: ESLint (with Airbnb style guide)
- **Formatter**: Prettier
- **Testing**: Node.js built-in test runner

## 3. Getting Started

1.  **Install dependencies**:
    ```bash
    npx corepack pnpm install
    ```

## 4. Development Workflow

Before submitting any changes, always follow these steps:

1.  **Apply Code Formatting and Linting**:
    Ensure your code adheres to the project's style guide. Run the linter with automatic fixing.
    ```bash
    npx corepack pnpm lint:fix
    ```
    Manually resolve any errors that cannot be fixed automatically.

2.  **Run Tests**:
    Make sure all existing and new tests pass.
    ```bash
    npx corepack pnpm test
    ```

3.  **Start the Server (for manual testing)**:
    ```bash
    npx corepack pnpm start
    ```

## 5. Coding Conventions

- **Respect Existing Code**: Adhere to the patterns, conventions, and style of the existing codebase.
- **ES Modules**: Use `import` and `export` syntax. CommonJS (`require`/`module.exports`) is not used.
- **Error Handling**: Implement robust error handling. The `/parse` endpoint should return a `400` status code for invalid Mermaid syntax, along with a descriptive JSON error message.
- **Testing**:
    - Add new tests for any new features or endpoints.
    - Add tests for bug fixes to prevent regressions.
    - Test files are located in the `tests/` directory and end with `.test.js`.
- **Dependencies**:
    - Add runtime dependencies with `npx corepack pnpm add <package-name>`.
    - Add development dependencies with `npx corepack pnpm add -D <package-name>`.

## 6. Commit Messages

While not strictly enforced by a tool, aim for clear and descriptive commit messages. A good practice is to follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Example: `feat: add new endpoint for diagram validation`

## 7. Final Checklist for Agents

- [ ] Did I install all dependencies with `npx corepack pnpm install`?
- [ ] Does my code follow the existing style and conventions?
- [ ] Did I run `npx corepack pnpm lint:fix` and fix all errors?
- [ ] Did I write new tests for my changes?
- [ ] Did I run `npx corepack pnpm test` and confirm all tests pass?
- [ ] If I added dependencies, did I use the correct `pnpm add` command?
