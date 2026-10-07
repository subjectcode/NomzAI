# Contributing to Nomz

Thank you for your interest in contributing to Nomz!

## Development Workflow

1. **Fork and Branch**:
   - Create a feature branch from `main` or `dev`.
   - Keep branch names descriptive (e.g., `feature/xyz` or `fix/abc`).

2. **Code Standards**:
   - **Frontend**: Run `npx tsc --noEmit` from `frontend/` to ensure zero TypeScript errors.
   - **Backend**: Ensure all tests pass by running `pytest tests/` with `PYTHONPATH=backend`.
   - **Security**: Double-check that no `.env`, local database, secrets, or temporary build artifacts are staged.

3. **Submitting a Pull Request**:
   - Provide a clear summary of changes in the PR template.
   - Attach UI screenshots if changes affect visual components.
