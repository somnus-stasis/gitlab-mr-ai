# gitlab-mr-ai

![npm version](https://img.shields.io/npm/v/gitlab-mr-ai.svg)
![build status](https://img.shields.io/github/actions/workflow/status/your-org/gitlab-mr-ai/ci.yml?branch=main)

> AI-powered CLI tool to generate GitLab Merge Request summaries using Google Gemini.

Generate clear, structured summaries for your GitLab merge requests in a CI/CD-friendly way. This CLI analyzes MR diffs and uses Gemini to produce a concise description and key file changes.

---

## Table of Contents

- [gitlab-mr-ai](#gitlab-mr-ai)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage (Local)](#usage-local)
  - [Usage (GitLab CI/CD)](#usage-gitlab-cicd)
  - [CLI Parameters](#cli-parameters)
    - [Flag Descriptions](#flag-descriptions)
  - [Branch & Ticket Detection](#branch--ticket-detection)
  - [General Usage & Fallbacks](#general-usage--fallbacks)
  - [Environment Variables](#environment-variables)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)

---

## Installation

```bash
npm install -g gitlab-mr-ai
# or use npx without install
npx gitlab-mr-ai generate --mr 123
```

---

## Usage (Local)

```bash
mr-ai generate --mr <merge-request-id> [options]
```

Example:

```bash
mr-ai generate --mr 927 --output console
```

To load environment variables locally, you can:

```bash
# using dotenv-cli (recommended for simplicity)
npm install -g dotenv-cli
dotenv -e .env -- mr-ai generate --mr 927

# or with native bash
source .env && mr-ai generate --mr 927
```

Example `.env`:

```bash
GEMINI_API_KEY=your-gemini-key
GITLAB_TOKEN=your-gitlab-token
GITLAB_PROJECT_ID=123
MR_AI_TICKET_PREFIXES=PL,OPS,WEB
```

---

## Usage (GitLab CI/CD)

You can configure GitLab CI/CD to run this tool automatically or manually on merge requests.

Example `.gitlab-ci.yml` job:

```yaml
mr-summary:
  stage: quality-gate
  image: node:20
  script:
    - export MR_AI_TICKET_PREFIXES="PL,OPS,WEB"
    - npx gitlab-mr-ai generate --mr "$CI_MERGE_REQUEST_IID" --output post
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: manual
```

`MR_AI_TICKET_PREFIXES` is optional. If omitted, the CLI falls back to `PL`.

---

## CLI Parameters

Below is a list of CLI flags supported by `mr-ai`, including what they do and when to use them.

| Flag | Alias | Required | Description |
|---|---|---|---|
| `--mr` | `-m` | Yes | Merge request IID to summarize |
| `--template` | `-t` | No | Template name (`standard`, `bug-fix`, `general`) or file path to `.md` |
| `--prompt` | `-p` | No | Custom prompt file path (`.txt`) for Gemini |
| `--output` | `-o` | No | `console`, `file`, or `post` (default: `console`) |

### Flag Descriptions

- `--mr`, `-m` (**required**)
  The Merge Request IID (internal ID visible in the GitLab URL, like `/merge_requests/123`). This is used to fetch the diff and identify which MR to summarize.

- `--template`, `-t`
  Optional. Specifies which Markdown template to use. You can:
  - Pass a built-in template name: `standard`, `bug-fix`, or `general`
  - Or pass a file path to a custom template, for example `./my-template.md`

- `--prompt`, `-p`
  Optional. Specify a custom prompt file (`.txt`) to send to Gemini. If not provided, a default prompt will be used.

- `--output`, `-o`
  Optional. Defines where the generated summary goes:
  - `console` (default): print to terminal
  - `file`: write to `mr-summary-<mrId>.md`
  - `post`: update the MR's description directly in GitLab

Examples:

```bash
# Basic usage (console output)
mr-ai generate --mr 1010

# Use general template explicitly
mr-ai generate --mr 1010 --template general

# Use external template and prompt, then write to file
mr-ai generate --mr 1010 --template ./my-template.md --prompt ./my-prompt.txt --output file

# Post directly to GitLab MR
mr-ai generate --mr 1010 --output post
```

---

## Branch & Ticket Detection

If no `--template` is provided, the CLI tries to auto-detect based on your branch name:

- `fix/123-title` -> uses `bug-fix.md`
- `feat/PL-456-feature` -> uses `standard.md`
- `feat/OPS-456-feature` -> uses `standard.md` when `MR_AI_TICKET_PREFIXES` includes `OPS`
- otherwise -> fallback to `general.md`

Ticket ID is also auto-detected and injected into the template:

- `#123` for numeric branches
- `PL-456`, `OPS-456`, or other configured prefixes if allowed by `MR_AI_TICKET_PREFIXES`

Prefix detection rules:

- `MR_AI_TICKET_PREFIXES` accepts comma-separated values, for example `PL,OPS,WEB`
- Prefix matching is normalized internally, so `pl, ops` is treated as `PL,OPS`
- If `MR_AI_TICKET_PREFIXES` is empty, the default prefix is `PL`
- Numeric tickets such as `fix/123-login` remain valid without any prefix config

---

## General Usage & Fallbacks

You do not need to follow any branch naming convention.

To disable smart detection and always use the general fallback:

```bash
mr-ai generate --mr 9001 --template general
```

If you prefer to keep smart detection off by default, you can:

- Use a generic or unmatched branch name, for example `feature/login-screen`
- Pass `--template general` explicitly in every usage

Fallback behavior:

- Use the `general.md` template if the branch format is not recognized
- Skip ticket-specific detection if no valid ticket is found
- Still render valid output from Gemini

You can also:

- Provide your own Markdown template with `--template ./custom.md`
- Provide your own prompt with `--prompt ./custom.txt`

Recommended per-project setup:

- Set `MR_AI_TICKET_PREFIXES` in each repository's `.env`
- Or define it in each GitLab project's CI/CD Variables
- This allows different GitLab projects in the same group to use different ticket prefixes without code changes

---

## Environment Variables

When running in GitLab CI/CD, configure these variables under GitLab `Settings -> CI/CD -> Variables`.

Set via `.env` or CI variables:

| Key | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Generative AI API key |
| `GITLAB_TOKEN` | Yes | GitLab personal access token with project read/write access |
| `GITLAB_PROJECT_ID` | Yes | GitLab project numeric ID |
| `GITLAB_API_URL` | No | GitLab API URL (default: `https://gitlab.com/api/v4`) |
| `GEMINI_MODEL` | No | Gemini model ID (default: `gemini-2.5-flash`) |
| `MR_AI_GENAI_API_VERSION` | No | Gemini API version override, for example `v1` for stable endpoints |
| `MR_AI_TICKET_PREFIXES` | No | Comma-separated ticket prefixes for branch detection (default: `PL`) |

---

## Troubleshooting

**Missing required env variable:**

```text
Missing required .env variables: GEMINI_API_KEY, GITLAB_TOKEN
```

Check your `.env` file or CI settings.

**Template not found:**

```text
Failed to read template at ./custom.md
```

Make sure the file path exists and is valid.

---

## License

[MIT](./LICENSE)
