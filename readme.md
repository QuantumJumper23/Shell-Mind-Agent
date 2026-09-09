# Shell Mind

Shell Mind is a terminal-based coding agent, built from scratch in TypeScript on the Bun runtime, inspired by tools like Claude Code. It can read, write, and edit files, run shell commands, search the filesystem, and hold a multi-turn conversation with you, all while enforcing its own safety checks before touching anything destructive.

It started as a small agent loop capable of a single tool call, then grew to include a full set of file and shell tools, a dedicated safety layer, cross-platform support, and a compiled standalone executable.

## What it can do

Shell Mind exposes the following tools to the underlying language model. The model decides when to use each one based on your prompt; your code executes the action and reports the result back.

- **Read** - reads and returns the contents of a file.
- **Write** - creates a file or overwrites an existing one with new content.
- **Edit** - finds a specific string inside a file and replaces it, either the first occurrence or every occurrence, without touching the rest of the file.
- **Bash** - executes a shell command. Automatically uses `sh` on Linux/macOS and `cmd` on Windows, based on the operating system it detects itself running on.
- **Glob** - lists files matching a pattern (for example `*.pdf`) inside a given directory, without needing to know exact filenames in advance.
- **AskUser** - lets the model pause and ask you a direct question when a request is ambiguous, a file looks private, or it needs a decision only you can make.

On top of single-shot prompts, Shell Mind runs as a REPL: start it once, and keep typing follow-up requests in the same session. Conversation history persists for the whole session, so the model remembers earlier context, files it already read, and decisions you already made.

## Safety features

Giving a language model the ability to run arbitrary shell commands is inherently risky, so this project includes a dedicated safety layer rather than executing everything blindly.

- **Blocklist** - a set of patterns for outright destructive operations (recursive deletion of root or home directories, disk-formatting commands, fork bombs, writes to raw disk devices, overwrites of critical system files) are refused unconditionally. Nothing asks for confirmation here; the command simply does not run.
- **Confirmation prompts** - a second set of patterns covers commands that are plausible but risky (deleting or moving specific files, recursive permission changes, killing processes, force-pushing or hard-resetting a git repository, piping a remote script straight into a shell, touching files like `.env` or `.ssh`). Any command matching this list is shown to you directly in the terminal, and only runs if you type `y` to approve it.
- **Iteration cap** - each user turn is limited to a maximum number of tool-call rounds. If the model starts spiraling through repeated, unproductive tool calls, you are asked whether you want to let it keep going or stop there. This exists because, during development, an ambiguous request once caused the agent to make ten shell calls in a row trying to guess a file path, and a separate session grew its own conversation history past one million tokens purely from unfiltered command output.

Neither of these lists claims to catch every possible dangerous command. They meaningfully raise the bar against accidental or careless destructive actions; they are not a substitute for running this tool in an environment you are comfortable experimenting in.

## Setup

### 1. Install Bun

Shell Mind runs on [Bun](https://bun.sh), not plain Node.js.

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal afterward, then confirm it installed correctly:

```bash
bun --version
```

### 2. Install dependencies

From the project root:

```bash
bun install
```

### 3. Get an API key

Shell Mind talks to any OpenAI-compatible chat completions endpoint, so you can point it at OpenRouter, NVIDIA NIM, Groq, or any other compatible provider. The example below uses NVIDIA NIM.

Go to the [NVIDIA NIM APIs website](https://build.nvidia.com) and generate an API key.

### 4. Create your `.env` file

Copy `example.env.txt` to a new file named exactly `.env` in the project root, and fill in your own values:

```
NVIDIA_API_KEY=<insert your api key>
NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

The model name and base URL above are examples; check your provider's documentation for the exact values it expects.

Note for Windows users: File Explorer sometimes silently saves a file named `.env` as `.env.txt`, since it treats a filename with no text before the dot as having no extension of its own. If Shell Mind reports that your API key is not set even though you created the file, run `dir` in the project folder and check the real filename. If it shows `.env.txt`, rename it from the terminal:

```
ren .env.txt .env
```

If you get stuck at any point in this setup, you can paste this README, along with your own error message, into Claude or ChatGPT and ask for help troubleshooting your specific situation.

### 5. Run it

```bash
bun run app/main.ts -p "your first prompt here"
```

Once it responds, you will be dropped into a `>` prompt where you can keep the conversation going. Type `exit` to end the session.

## Using a precompiled executable

A standalone build does not require Bun, Node, or `bun install` to run. It is a single binary with the Bun runtime bundled inside.

To build one yourself:

```bash
# Linux/macOS, for your current machine
bun build ./app/main.ts --compile --outfile my-agent

# Windows, cross-compiled from Linux/macOS
bun build ./app/main.ts --compile --target=bun-windows-x64 --outfile my-agent.exe
```

The compiled binary still reads its configuration from a `.env` file placed in the same folder as the executable at runtime; the `.env` is not baked into the binary. Never place your own real API key inside a binary you intend to share with someone else.

## Project structure

```
app/
  core/
    agent.ts            the main agent loop: calls the model, dispatches tool calls, tracks iterations
  safety/
    Blocked_pattern.ts   the blocklist and risky-command pattern lists
    safety.ts            command-checking and confirmation logic
  tools/                 tool schema definitions sent to the model
  utils/                 shared helpers (e.g. normalizing tool output to a string)
  main.ts                entry point: parses arguments, loads configuration, runs the REPL loop
```

## Known limitations

- The Bash tool's safety patterns are written for Unix-style commands. On Windows, the corresponding dangerous commands look different, and the current blocklist and risky-command list do not yet have Windows-specific equivalents.
- Broad filesystem searches may run into permission errors on Windows when using an unsigned, freshly compiled executable, since Windows restricts what such executables can access by default. This is expected operating system behavior rather than a bug in the tool itself.
- Output quality depends heavily on which model you configure. Smaller, free-tier models are fast and inexpensive but can be less reliable at multi-step reasoning, and none of the tools give the model any way to visually verify its own output (for example, there is no way for it to confirm a web page it wrote actually renders correctly).
- Free API tiers are rate-limited. Limits vary by provider: some cap total requests per day regardless of which model you use, others cap requests per minute with no daily ceiling. Check your provider's current documentation before assuming a particular limit applies.

## What this project involved

Building this involved debugging a handful of real integration issues rather than only writing new features: a conversation that grew past a provider's one-million-token context limit from unfiltered command output, a free-tier rate limit exhausted by a single confused request that spiraled into ten shell calls, a broken external image service that produced no visible error but silently returned unusable content, and a strict-versus-lenient validation difference between two OpenAI-compatible providers that only surfaced once a tool's return value stopped being a plain string. Working through each of these was as much a part of building this project as any individual tool.