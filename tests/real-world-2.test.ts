/**
 * Real-world scenario tests complementing real-world.test.ts.
 *
 * Scenario 1: Fetch state machine (idle → loading → success | error)
 * Scenario 2: Command parser (parse and dispatch CLI-like commands)
 * Scenario 3: API response normalizer (unknown JSON → typed domain model)
 */
import { match, P, isMatching } from '../src';
import { Equal, Expect } from '../src/types/helpers';

// ─── Scenario 1: Fetch state machine ─────────────────────────────────────────

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'success'; data: T; duration: number }
  | { status: 'error'; error: Error; retries: number };

type FetchEvent<T> =
  | { type: 'FETCH' }
  | { type: 'RESOLVE'; data: T; duration: number }
  | { type: 'REJECT'; error: Error }
  | { type: 'RETRY' }
  | { type: 'RESET' };

function transition<T>(
  state: FetchState<T>,
  event: FetchEvent<T>
): FetchState<T> {
  return match({ state, event })
    .with(
      { state: { status: 'idle' }, event: { type: 'FETCH' } },
      () => ({ status: 'loading' as const, startedAt: Date.now() })
    )
    .with(
      { state: { status: 'loading' }, event: { type: 'RESOLVE' } },
      ({ event }) => {
        const e = event as { type: 'RESOLVE'; data: T; duration: number };
        return { status: 'success' as const, data: e.data, duration: e.duration };
      }
    )
    .with(
      { state: { status: 'loading' }, event: { type: 'REJECT' } },
      ({ event }) => {
        const e = event as { type: 'REJECT'; error: Error };
        return { status: 'error' as const, error: e.error, retries: 0 };
      }
    )
    .with(
      { state: { status: 'error' }, event: { type: 'RETRY' } },
      ({ state }) => {
        const s = state as { status: 'error'; retries: number };
        return { status: 'loading' as const, startedAt: Date.now(), _retries: s.retries + 1 } as any;
      }
    )
    .with(
      { event: { type: 'RESET' } },
      () => ({ status: 'idle' as const })
    )
    .otherwise(({ state }) => state); // ignore invalid transitions
}

describe('real world: fetch state machine', () => {
  it('idle → loading on FETCH', () => {
    const state: FetchState<string> = { status: 'idle' };
    const next = transition(state, { type: 'FETCH' });
    expect(next.status).toBe('loading');
  });

  it('loading → success on RESOLVE', () => {
    const state: FetchState<string> = { status: 'loading', startedAt: 0 };
    const next = transition(state, { type: 'RESOLVE', data: 'hello', duration: 42 });
    expect(next).toEqual({ status: 'success', data: 'hello', duration: 42 });
  });

  it('loading → error on REJECT', () => {
    const state: FetchState<string> = { status: 'loading', startedAt: 0 };
    const err = new Error('network fail');
    const next = transition(state, { type: 'REJECT', error: err });
    expect(next).toEqual({ status: 'error', error: err, retries: 0 });
  });

  it('ignores invalid transitions (idle + RESOLVE)', () => {
    const state: FetchState<string> = { status: 'idle' };
    const next = transition(state, { type: 'RESOLVE', data: 'x', duration: 0 });
    expect(next).toEqual(state); // unchanged
  });

  it('any state → idle on RESET', () => {
    const states: FetchState<string>[] = [
      { status: 'idle' },
      { status: 'loading', startedAt: 0 },
      { status: 'success', data: 'x', duration: 10 },
      { status: 'error', error: new Error(), retries: 2 },
    ];
    states.forEach((state) => {
      const next = transition(state, { type: 'RESET' });
      expect(next).toEqual({ status: 'idle' });
    });
  });
});

// ─── Scenario 2: Command parser ───────────────────────────────────────────────

type Command =
  | { cmd: 'help' }
  | { cmd: 'quit' }
  | { cmd: 'get'; key: string }
  | { cmd: 'set'; key: string; value: string }
  | { cmd: 'delete'; key: string }
  | { cmd: 'list'; prefix?: string };

function parseCommand(input: string): Command | null {
  const parts = input.trim().split(/\s+/);
  return match(parts)
    .with(['help'], () => ({ cmd: 'help' as const }))
    .with(['quit'], () => ({ cmd: 'quit' as const }))
    .with(
      ['get', P.select('key', P.string)],
      ({ key }) => ({ cmd: 'get' as const, key })
    )
    .with(
      ['set', P.select('key', P.string), P.select('value', P.string)],
      ({ key, value }) => ({ cmd: 'set' as const, key, value })
    )
    .with(
      ['delete', P.select('key', P.string)],
      ({ key }) => ({ cmd: 'delete' as const, key })
    )
    .with(
      ['list'],
      () => ({ cmd: 'list' as const })
    )
    .with(
      ['list', P.select('prefix', P.string)],
      ({ prefix }) => ({ cmd: 'list' as const, prefix })
    )
    .otherwise(() => null);
}

describe('real world: command parser', () => {
  it('parses "help"', () => {
    expect(parseCommand('help')).toEqual({ cmd: 'help' });
  });

  it('parses "get <key>"', () => {
    expect(parseCommand('get mykey')).toEqual({ cmd: 'get', key: 'mykey' });
  });

  it('parses "set <key> <value>"', () => {
    expect(parseCommand('set foo bar')).toEqual({ cmd: 'set', key: 'foo', value: 'bar' });
  });

  it('parses "delete <key>"', () => {
    expect(parseCommand('delete foo')).toEqual({ cmd: 'delete', key: 'foo' });
  });

  it('parses "list" without prefix', () => {
    expect(parseCommand('list')).toEqual({ cmd: 'list' });
  });

  it('parses "list <prefix>"', () => {
    expect(parseCommand('list user:')).toEqual({ cmd: 'list', prefix: 'user:' });
  });

  it('returns null for unrecognized commands', () => {
    expect(parseCommand('unknown')).toBeNull();
    expect(parseCommand('get')).toBeNull(); // missing key
    expect(parseCommand('set foo')).toBeNull(); // missing value
    expect(parseCommand('')).toBeNull();
  });

  it('trims extra whitespace', () => {
    expect(parseCommand('  get   mykey  ')).toEqual({ cmd: 'get', key: 'mykey' });
  });
});

// ─── Scenario 3: API response normalizer ─────────────────────────────────────

type User = { id: number; name: string; email: string };
type ApiError = { code: number; message: string };
type ApiResponse = { ok: true; user: User } | { ok: false; error: ApiError };

const isUser = isMatching({
  id: P.number,
  name: P.string,
  email: P.string,
});

const isApiError = isMatching({
  code: P.number,
  message: P.string,
});

function normalizeResponse(raw: unknown): ApiResponse {
  return match(raw)
    .with(
      { ok: true, user: P.when(isUser) },
      ({ user }) => ({
        ok: true as const,
        user: { id: user.id, name: user.name, email: user.email },
      })
    )
    .with(
      { ok: false, error: P.when(isApiError) },
      ({ error }) => ({
        ok: false as const,
        error: { code: error.code, message: error.message },
      })
    )
    .otherwise(() => ({
      ok: false as const,
      error: { code: 0, message: 'Unknown response format' },
    }));
}

describe('real world: API response normalizer', () => {
  it('normalizes a successful response', () => {
    const raw = { ok: true, user: { id: 1, name: 'Alice', email: 'a@example.com' } };
    const result = normalizeResponse(raw);
    expect(result).toEqual({
      ok: true,
      user: { id: 1, name: 'Alice', email: 'a@example.com' },
    });
  });

  it('normalizes an error response', () => {
    const raw = { ok: false, error: { code: 404, message: 'Not found' } };
    const result = normalizeResponse(raw);
    expect(result).toEqual({
      ok: false,
      error: { code: 404, message: 'Not found' },
    });
  });

  it('returns a fallback for malformed success response (missing email)', () => {
    const raw = { ok: true, user: { id: 1, name: 'Alice' } }; // missing email
    const result = normalizeResponse(raw);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: ApiError }).error.code).toBe(0);
  });

  it('returns a fallback for completely unknown format', () => {
    const result = normalizeResponse('not an object');
    expect(result).toEqual({
      ok: false,
      error: { code: 0, message: 'Unknown response format' },
    });
  });

  it('strips extra fields from the user object', () => {
    const raw = {
      ok: true,
      user: { id: 1, name: 'Alice', email: 'a@b.com', role: 'admin', secret: 'x' },
    };
    const result = normalizeResponse(raw);
    expect(result.ok).toBe(true);
    const user = (result as { ok: true; user: User }).user;
    expect(Object.keys(user)).toEqual(['id', 'name', 'email']);
  });
});
