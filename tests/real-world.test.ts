import { match, P, Pattern } from '../src';
import * as symbols from '../src/internals/symbols';
import { Compute, Equal, Expect } from '../src/types/helpers';
import {
  Definition,
  FormulaQueries,
  QueryTableDefinitionRequest,
  TimeseriesDefinitionRequest,
} from './types-catalog/definition';

type Elem<xs> = xs extends Array<infer x> ? x : never;

type y = Pattern<
  Elem<
    | Compute<TimeseriesDefinitionRequest>[]
    | Compute<QueryTableDefinitionRequest>[]
  >
>;

type y2 = Pattern<Elem<FormulaQueries>>;

const f = (def: Definition) =>
  match(def)
    .with(
      {
        viz: 'timeseries',
        requests: P.array({
          queries: P.array(
            P.union({ data_source: 'metrics', query: P.select() }, P.__)
          ),
        }),
      },
      (metricQueries) => {
        type t = Expect<Equal<typeof metricQueries, (string | undefined)[][]>>;
      }
    )
    .with(
      {
        requests: P.array(
          P.intersection(
            P.union(
              { response_format: 'timeseries' },
              { response_format: 'scalar' }
            ),
            {
              queries: P.array({ data_source: P.union('metrics', 'events') }),
            }
          )
        ),
      },
      (x) => {
        const format = x.requests[0]?.response_format;
        const dataSource = x.requests[0]?.queries[0]?.data_source;
        type t = Expect<Equal<typeof format, 'timeseries' | 'scalar'>>;
        type t2 = Expect<Equal<typeof dataSource, 'metrics' | 'events'>>;
      }
    )
    .with(
      {
        viz: P.union('timeseries', 'query_table'),
        requests: [
          {
            // This works
            queries: P.array({ data_source: P.union('metrics', 'events') }),
            response_format: P.union('timeseries', 'scalar'),
          },
        ],
      },
      (x) => {}
    )
    .with(
      {
        viz: P.union('timeseries', 'query_table'),
        requests: P.array({
          // @ts-expect-error: FIXME,  P.union  only sees 'timeseries'
          response_format: P.union('timeseries', 'scalar'),
        }),
      },
      () => 'formulas requests'
    )
    .with(
      {
        requests: P.array({ response_format: 'scalar' }),
      },
      () => 'formulas requests'
    )
    .with(
      {
        requests: P.array({ response_format: 'timeseries' }),
      },
      () => 'formulas requests'
    )
    .with(
      {
        requests: [
          P.union(
            { response_format: 'scalar' },
            { response_format: 'timeseries' }
          ),
        ],
      },
      () => 'formulas requests'
    )
    .with(
      {
        requests: [{ response_format: P.union('timeseries', 'scalar') }],
      },
      () => 'formulas requests'
    )
    .with(
      { style: P.optional({ palette: P.__ }) },
      (withPalette) => withPalette.viz
    )
    .with({ autoscale: P.__ }, ({ viz }) => viz)
    .with(
      { requests: P.array({ ddsql_query: P.select() }) },
      (queries) => queries
    )
    .with(
      { viz: 'sunburst', requests: P.array({ response_format: P.select() }) },
      (scalars) => scalars
    )
    .with(
      {
        viz: P.union(
          'alert_graph',
          'alert_value',
          'geomap',
          'funnel',
          'timeseries',
          'heatmap'
        ),
      },
      () => ''
    )
    .with(
      { viz: 'query_table' },
      { viz: 'query_value' },
      { viz: 'image' },
      { viz: 'servicemap' },
      { viz: 'treemap' },
      () => ''
    )
    .otherwise(() => '');
//.exhaustive();
