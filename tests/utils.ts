// the never type can be assigned to anything. This type prevent that
export type NotNever<a> = a extends never ? never : true;

export type Option<a> = { kind: 'none' } | { kind: 'some'; value: a };

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
