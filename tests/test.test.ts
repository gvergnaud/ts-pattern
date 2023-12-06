import { P, match } from '../src';
import { DeepExclude } from '../src/types/DeepExclude';
import { DeepExcludeAll } from '../src/types/Match';

type States = 'idle' | 'loading' | 'success' | 'error' | 'partial_result';

const eventStatus = 'success' as States;
const dataStatus = 'loading' as States;
const backgroundStatus = 'loading' as States;
const replaySelectorsStatus = 'idle' as States;

const input = {
  eventStatus,
  dataStatus,
  backgroundStatus,
  replaySelectorsStatus,
  replaySelectorsStatus2: replaySelectorsStatus,
} as const;

type input = typeof input;

const expr = match(input)
  .returnType<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success' }
    | { status: 'error'; error: unknown }
  >()
  .with(
    P.union(
      { eventStatus: P.union('loading', 'partial_result') },
      { dataStatus: P.union('loading', 'partial_result') },
      { backgroundStatus: 'loading' }
    ),
    () => ({ status: 'loading' })
  )
  .with(
    {
      eventStatus: 'success',
      dataStatus: 'success',
      backgroundStatus: 'success',
      replaySelectorsStatus: 'success',
    },
    () => ({ status: 'success' })
  )
  .with(
    {
      replaySelectorsStatus: 'error',
    },
    () => ({
      status: 'error',
      error: new Error('Oops 0'),
    })
  )
  .with(
    {
      eventStatus: 'error',
    },
    () => ({ status: 'error', error: new Error('Oops 1') })
  )
  .with({ dataStatus: 'error' }, () => ({
    status: 'error',
    error: new Error('Oops 2'),
  }))
  .with({ backgroundStatus: 'error' }, () => ({
    status: 'error',
    error: new Error('Oops 3'),
  }))
  .with(
    P.union(
      { eventStatus: 'idle' },
      { dataStatus: 'idle' },
      { backgroundStatus: 'idle' },
      { replaySelectorsStatus: 'idle' }
    ),
    () => ({ status: 'idle' as const })
  );

const handledCases = expr._handleCases;

handledCases;
// ^?

const len = handledCases['length'];
//    ^?

const x0 = handledCases[0];
//    ^?

const x1 = handledCases[1];
//    ^?
const x2 = handledCases[2];
//    ^?
const x3 = handledCases[3];
//    ^?

const x4 = handledCases[4];
//    ^?

const x5 = handledCases[5];
//    ^?

const x6 = handledCases[6];
//    ^?

type t0 = DeepExclude<input, typeof x0>;
//    ^?

type t1 = DeepExclude<t0, typeof x1>;
//    ^?

type t2 = DeepExclude<t1, typeof x2>;
//    ^?

type t3 = DeepExclude<t2, typeof x3>;
//    ^?

type t4 = DeepExclude<t3, typeof x4>;
//    ^?

type t5 = DeepExclude<t4, typeof x5>;
//    ^?

type t6 = DeepExclude<t5, typeof x6>;
//    ^?

// const res = expr.exhaustive;

type trec = DeepExcludeAll<input, typeof handledCases>;
//    ^?
