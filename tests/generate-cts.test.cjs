const { spawnSync } = require('node:child_process');
const {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

it('generates separate ESM and CommonJS declarations with explicit extensions', () => {
  const root = mkdtempSync(join(tmpdir(), 'ts-pattern-declarations-'));
  try {
    mkdirSync(join(root, 'dist'));
    writeFileSync(
      join(root, 'dist', 'index.d.ts'),
      "import { Pattern } from './pattern';\nexport { match } from './match';\n"
    );
    const result = spawnSync(
      'sh',
      [join(process.cwd(), 'scripts/generate-cts.sh')],
      {
        cwd: root,
        encoding: 'utf8',
      }
    );
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(readFileSync(join(root, 'dist', 'index.d.ts'), 'utf8')).toBe(
      "import { Pattern } from './pattern.js';\nexport { match } from './match.js';\n"
    );
    expect(readFileSync(join(root, 'dist', 'index.d.cts'), 'utf8')).toBe(
      "import { Pattern } from './pattern.cjs';\nexport { match } from './match.cjs';\n"
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
