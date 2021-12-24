import { not, Pattern, __ } from '../src';

export type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

export const none: Option<never> = { kind: 'none' };
export const some = <a>(value: a): Option<a> => ({
  kind: 'some',
  value,
});

export type Blog = {
  id: number;
  title: string;
};

export type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

export type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string; requestTime?: number }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };

const f = <p extends Pattern<[State, Event]>>(p: p) => p;

const p = f([{ status: 'loading' }, __]);
const p2 = f([{ status: not('loading') }, __]);

const f2 = <p extends Pattern<State['status']>>(p: p) => p;
const p3 = f2(not('loading'));
const p4 = f2('loading');

const f3 = <p extends Pattern<State>>(p: p) => p;
const d1 = f3({ status: 'loading' });
const d2 = f3({ status: not('loading') });

type x = typeof p extends readonly [infer a, any] ? a : never;
type y = x extends object ? keyof x : never;

const y: y = 'status';

export type BigUnion =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
