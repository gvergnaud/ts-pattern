// Compares editor completions in `.with()` patterns between a git ref
// (default: origin/main) and the working tree.
//
//   npm run completions [-- <ref>]
//
// For each case of ./cases.mjs, it opens the file, types the keys one by one
// like an editor (didChange after each key, then a completion request:
// trigger character for a quote, invoked otherwise) and prints the labels
// after each key, for:
// - tsserver, from node_modules/typescript (`completionInfo`),
// - the tsgo LSP (`textDocument/completion`), if found: $TSGO, or the binary
//   of Zed's tsgo extension on macOS.
// The case files are written to scripts/completions/__cases__, in the working
// tree and in a copy of the ref's src/, and import ts-pattern from src/.
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cases } from './cases.mjs';

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const ref = process.argv[2] ?? 'origin/main';
const tsserverPath = path.join(repo, 'node_modules/typescript/lib/tsserver.js');
const zedTsgo = path.join(
  os.homedir(),
  'Library/Application Support/Zed/extensions/work/tsgo/node_modules/@typescript/typescript-darwin-arm64/lib/tsc'
);
const tsgoPath = process.env.TSGO ?? (fs.existsSync(zedTsgo) ? zedTsgo : null);

// A copy of the ref's src/, next to which the cases are written.
function checkoutRef() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'ts-pattern-completions-')
  );
  execSync(`git archive ${ref} src | tar -x -C "${root}"`, { cwd: repo });
  return root;
}

function writeCases(root) {
  // Not a dot folder: tsconfig's `include` skips them.
  const dir = path.join(root, 'scripts/completions/__cases__');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const compilerOptions = {
    strict: true,
    noEmit: true,
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'bundler',
    skipLibCheck: true,
  };
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions, include: ['.'] })
  );
  return cases.map((c, i) => {
    const cursor = c.code.indexOf('§');
    const text = c.code.replace('§', '');
    const file = path.join(dir, `case${i}.ts`);
    fs.writeFileSync(file, text);
    return { file, text, cursor };
  });
}

// The keys of a case. With nothing to type, completions are asked once, at
// the cursor (`null` key).
const keysOf = (c) => (c.type ? [...c.type] : [null]);

// Typing `key` at `cursor`: quotes come in pairs, like editors autoclose them.
function typeKey({ text, cursor }, key) {
  if (key === null) return { text, cursor };
  const insert = `"'\``.includes(key) ? key + key : key;
  return {
    text: text.slice(0, cursor) + insert + text.slice(cursor),
    cursor: cursor + 1,
  };
}

function position(text, offset) {
  const lines = text.slice(0, offset).split('\n');
  return { line: lines.length - 1, character: lines.at(-1).length };
}

function readMessages(stream, onMessage) {
  let buf = Buffer.alloc(0);
  stream.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      const headerEnd = buf.indexOf('\r\n\r\n');
      if (headerEnd < 0) return;
      const length = Number(
        /Content-Length: (\d+)/i.exec(buf.subarray(0, headerEnd))[1]
      );
      if (buf.length < headerEnd + 4 + length) return;
      onMessage(
        JSON.parse(buf.subarray(headerEnd + 4, headerEnd + 4 + length))
      );
      buf = buf.subarray(headerEnd + 4 + length);
    }
  });
}

async function tsserver(items) {
  const proc = spawn(
    'node',
    [tsserverPath, '--disableAutomaticTypingAcquisition'],
    {
      stdio: ['pipe', 'pipe', 'ignore'],
    }
  );
  const pending = new Map();
  let seq = 0;
  readMessages(proc.stdout, (msg) => {
    if (msg.type === 'response') pending.get(msg.request_seq)?.(msg);
  });
  const request = (command, args) =>
    new Promise((resolve) => {
      pending.set(++seq, resolve);
      proc.stdin.write(
        JSON.stringify({ seq, type: 'request', command, arguments: args }) +
          '\n'
      );
    });
  const results = [];
  for (const item of items) {
    let state = item;
    await request('open', { file: item.file, fileContent: item.text });
    const steps = [];
    for (const key of keysOf(cases[results.length])) {
      const prev = state;
      state = typeKey(state, key);
      const end = position(prev.text, prev.text.length);
      await request('updateOpen', {
        changedFiles: [
          {
            fileName: item.file,
            textChanges: [
              {
                start: { line: 1, offset: 1 },
                end: { line: end.line + 1, offset: end.character + 1 },
                newText: state.text,
              },
            ],
          },
        ],
      });
      const { line, character } = position(state.text, state.cursor);
      const isTrigger = `"'\``.includes(key);
      const res = await request('completionInfo', {
        file: item.file,
        line: line + 1,
        offset: character + 1,
        triggerKind: isTrigger ? 2 : 1,
        triggerCharacter: isTrigger ? key : undefined,
      });
      steps.push(res.body?.entries.map((e) => e.name) ?? []);
    }
    await request('close', { file: item.file });
    results.push(steps);
  }
  proc.kill();
  return results;
}

async function tsgo(root, items) {
  const proc = spawn(tsgoPath, ['--lsp', '--stdio'], {
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  const pending = new Map();
  let id = 0;
  const send = (msg) => {
    const body = JSON.stringify({ jsonrpc: '2.0', ...msg });
    proc.stdin.write(
      `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
    );
  };
  readMessages(proc.stdout, (msg) => {
    if (msg.method && msg.id !== undefined) {
      // A request from the server (configuration, registration...).
      const items = msg.params?.items;
      send({
        id: msg.id,
        result: Array.isArray(items) ? items.map(() => null) : null,
      });
    } else if (msg.id !== undefined) pending.get(msg.id)?.(msg);
  });
  const request = (method, params) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      send({ id, method, params });
    });
  const rootUri = 'file://' + root;
  const init = await request('initialize', {
    processId: process.pid,
    rootUri,
    workspaceFolders: [{ uri: rootUri, name: 'ts-pattern' }],
    capabilities: {
      textDocument: {
        completion: {
          contextSupport: true,
          completionItem: { snippetSupport: true, labelDetailsSupport: true },
        },
      },
    },
  });
  const triggers =
    init.result.capabilities.completionProvider?.triggerCharacters ?? [];
  send({ method: 'initialized', params: {} });
  const results = [];
  for (const item of items) {
    const uri = 'file://' + item.file;
    let state = item;
    let version = 1;
    send({
      method: 'textDocument/didOpen',
      params: {
        textDocument: {
          uri,
          languageId: 'typescript',
          version,
          text: item.text,
        },
      },
    });
    const steps = [];
    let incomplete = false;
    for (const key of keysOf(cases[results.length])) {
      state = typeKey(state, key);
      send({
        method: 'textDocument/didChange',
        params: {
          textDocument: { uri, version: ++version },
          contentChanges: [{ text: state.text }],
        },
      });
      const context = triggers.includes(key)
        ? { triggerKind: 2, triggerCharacter: key }
        : { triggerKind: incomplete ? 3 : 1 };
      const res = await request('textDocument/completion', {
        textDocument: { uri },
        position: position(state.text, state.cursor),
        context,
      });
      const list = Array.isArray(res.result)
        ? { items: res.result }
        : res.result ?? { items: [] };
      incomplete = !!list.isIncomplete;
      steps.push(list.items.map((x) => x.label));
    }
    send({
      method: 'textDocument/didClose',
      params: { textDocument: { uri } },
    });
    results.push(steps);
  }
  proc.kill();
  return results;
}

async function run(root) {
  const items = writeCases(root);
  return {
    tsserver: await tsserver(items),
    ...(tsgoPath ? { tsgo: await tsgo(root, items) } : {}),
  };
}

const show = (labels) => {
  const quoted = labels.map((l) => JSON.stringify(l)).sort();
  if (quoted.length === 0) return '(none)';
  if (quoted.length > 8) return `${quoted.length} items (not string literals)`;
  return quoted.join(' ');
};

const refRoot = checkoutRef();
const sides = [
  [ref, await run(refRoot)],
  ['working tree', await run(repo)],
];
fs.rmSync(refRoot, { recursive: true, force: true });

if (!tsgoPath) console.log('tsgo not found (set $TSGO): tsserver only.');
let differences = 0;
const servers = Object.keys(sides[0][1]);
const width = Math.max(...sides.map(([name]) => name.length));
cases.forEach((c, i) => {
  console.log(`\n${c.name}`);
  keysOf(c).forEach((_, step) => {
    const typed = c.type ? c.type.slice(0, step + 1) : '';
    for (const server of servers) {
      const values = sides.map(([, results]) => show(results[server][i][step]));
      const same = values.every((v) => v === values[0]);
      if (!same) differences++;
      sides.forEach(([name], s) => {
        const mark = same ? ' ' : '!';
        console.log(
          `  ${mark} ${typed.padEnd(3)} ${server.padEnd(8)} ${name.padEnd(
            width
          )}  ${values[s]}`
        );
      });
    }
  });
});
console.log(
  differences
    ? `\n${differences} differences between ${ref} and the working tree.`
    : `\nsame completions on ${ref} and the working tree.`
);
process.exitCode = differences ? 1 : 0;
