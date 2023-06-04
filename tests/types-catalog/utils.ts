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

type AsyncResultStatus = 'idle' | 'loading' | 'error' | 'success';

export interface BaseAsyncResult<TData, TError = Error> {
  status: AsyncResultStatus;
  data?: TData;
  error?: TError;
}

export interface AsyncResultIdleOrLoading<TData, TError = Error>
  extends BaseAsyncResult<TData, TError> {
  status: 'idle' | 'loading';
}

export interface AsyncResultSuccess<TData, TError = Error>
  extends BaseAsyncResult<TData, TError> {
  status: 'success';
  data: TData;
}

export interface AsyncResultError<TData, TError = Error>
  extends BaseAsyncResult<TData, TError> {
  status: 'error';
  error: TError;
}
export type AsyncResult<TData, TError = Error> =
  | AsyncResultIdleOrLoading<TData, TError>
  | AsyncResultSuccess<TData, TError>
  | AsyncResultError<TData, TError>;
