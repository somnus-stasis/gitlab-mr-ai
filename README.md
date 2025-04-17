# gitlab-mr-ai

![npm version](https://img.shields.io/npm/v/gitlab-mr-ai.svg)
![build status](https://img.shields.io/github/actions/workflow/status/your-org/gitlab-mr-ai/ci.yml?branch=main)

> AI-powered CLI tool to generate GitLab Merge Request summaries using Google Gemini.

Generate clear, structured summaries for your GitLab merge requests — fully automated and CI/CD-friendly. This CLI tool analyzes diffs from your MR and uses Gemini to generate a concise description and key file changes.

---

## 📚 Table of Contents

- [gitlab-mr-ai](#gitlab-mr-ai)
  - [📚 Table of Contents](#-table-of-contents)
  - [🚀 Installation](#-installation)
  - [💻 Usage (Local)](#-usage-local)
  - [⚙️ Usage (GitLab CI/CD)](#️-usage-gitlab-cicd)
  - [🧩 CLI Parameters](#-cli-parameters)
    - [Flag Descriptions](#flag-descriptions)
  - [🧠 Branch \& Ticket Detection](#-branch--ticket-detection)
  - [🌍 General Usage \& Fallbacks](#-general-usage--fallbacks)
  - [🔐 Environment Variables](#-environment-variables)
  - [🧼 Troubleshooting](#-troubleshooting)
  - [📦 License](#-license)

---

## 🚀 Installation

```bash
npm install -g gitlab-mr-ai
# or use npx without install
npx gitlab-mr-ai generate --mr 123
```

---

## 💻 Usage (Local)

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

---

## ⚙️ Usage (GitLab CI/CD)

> 💡 You can configure GitLab CI/CD to run this tool automatically or manually on merge requests.

Example `.gitlab-ci.yml` job:

```yaml
mr-summary:
  stage: quality-gate
  image: node:20
  script:
    - npx gitlab-mr-ai generate --mr "$CI_MERGE_REQUEST_IID" --output post
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: manual
```

---

## 🧩 CLI Parameters

Below is a list of CLI flags supported by `mr-ai`, including what they do and when to use them.

| Flag          | Alias | Required | Description |
|---------------|-------|----------|-------------|
| `--mr`        | `-m`  | ✅ Yes   | Merge request IID to summarize |
| `--template`  | `-t`  | ❌ No    | Template name (`standard`, `bug-fix`, `general`) or file path to `.md` |
| `--prompt`    | `-p`  | ❌ No    | Custom prompt file path (`.txt`) for Gemini |
| `--output`    | `-o`  | ❌ No    | `console`, `file`, or `post` (default: `console`) |

### Flag Descriptions

- `--mr`, `-m` (**required**)  
  The Merge Request IID (internal ID visible in the GitLab URL, like `/merge_requests/123`). This is used to fetch the diff and identify which MR to summarize.

- `--template`, `-t`  
  Optional. Specifies which Markdown template to use. You can:
  - Pass a built-in template name: `standard`, `bug-fix`, or `general`
  - Or pass a file path to a custom template, e.g. `./my-template.md`

- `--prompt`, `-p`  
  Optional. Specify a custom prompt file (`.txt`) to send to Gemini. If not provided, a default prompt will be used.

- `--output`, `-o`  
  Optional. Defines where the generated summary goes:
  - `console` (default): print to terminal
  - `file`: write to `mr-summary-<mrId>.md`
  - `post`: update the MR's description directly in GitLab



```bash
# Basic usage (console output)
mr-ai generate --mr 1010

# Use general template explicitly
mr-ai generate --mr 1010 --template general

# Use external template & prompt, write to file
mr-ai generate --mr 1010 --template ./my-template.md --prompt ./my-prompt.txt --output file

# Post directly to GitLab MR
mr-ai generate --mr 1010 --output post
```

---

## 🧠 Branch & Ticket Detection

If no `--template` is provided, the CLI tries to auto-detect based on your branch name:

- `fix/123-title` → uses `bug-fix.md`
- `feat/PL-456-feature` → uses `standard.md`
- Otherwise → fallback to `general.md`

Ticket ID is also auto-detected and injected into the template:
- `#123` for numeric branches
- `PL-456` if prefixed

---

## 🌍 General Usage & Fallbacks

You do **not** need to follow any branch naming convention.

To disable smart detection and use the general fallback always:
```bash
mr-ai generate --mr 9001 --template general
```

Alternatively, if you prefer to keep smart detection **off by default**, you can:
- Use a generic or unmatched branch name (e.g. `feature/login-screen`)
- Pass the `--template general` flag explicitly in every usage (recommended for general use cases)

Fallbacks will:
- Use the `general.md` template if format isn't recognized
- Skip ticket injection if none detected
- Still render valid output from Gemini

You can also:
- Provide your own Markdown template (`--template ./custom.md`)
- Provide your own prompt (`--prompt ./custom.txt`)

---

## 🔐 Environment Variables

> ❗ When running in GitLab CI/CD, these variables should be configured under **Settings → CI/CD → Variables**.
> You do not need to manually export them in the pipeline script.

Set via `.env` or CI variables:

| Key | Required | Description |
|-----|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Generative AI API key |
| `GITLAB_TOKEN` | ✅ | GitLab personal access token (project read/write) |
| `GITLAB_PROJECT_ID` | ✅ | GitLab project numeric ID |
| `GITLAB_API_URL` | ❌ | GitLab API URL (default: `https://gitlab.com/api/v4`) |
| `GEMINI_MODEL` | ❌ | Gemini model ID (default: `gemini-1.5-flash`) |

---

## 🧼 Troubleshooting

**Missing required env variable:**
```
❌ Missing required .env variables: GEMINI_API_KEY, GITLAB_TOKEN
```
➡️ Check your `.env` or CI settings

**Template not found:**
```
❌ Failed to read template at ./custom.md
```
➡️ Make sure the file path exists and is valid

---

## 📦 License
[MIT](./LICENSE)