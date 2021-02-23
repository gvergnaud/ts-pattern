// the never type can be assigned to anything. This type prevent that
export type NotNever<a> = a extends never ? never : true;

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
