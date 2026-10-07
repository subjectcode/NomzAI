# Security Policy

## Responsible Disclosure

If you discover a security vulnerability in Nomz, please report it privately through GitHub's Security Advisory tab:
**[Report a vulnerability](https://github.com/subjectcode/NomzAI/security/advisories/new)**

Please do not open public issues or pull requests detailing undisclosed security vulnerabilities.

## Policy & Best Practices

1. **Never Commit Secrets or API Keys**:
   - Keep `.env` files strictly gitignored.
   - Do not commit Gemini API keys, Composio keys, YouTube API keys, Langflow tokens, database passwords, or JWT secrets.
   - Use Railway environment variables or secret managers for deployment.

2. **Supported Versions**:
   - Only the latest release on `main` is actively maintained and supported with security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
