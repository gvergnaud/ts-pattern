import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Definition } from './types-catalog/definition';

describe('real world example of a complex input type', () => {
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
          type t = Expect<
            Equal<typeof metricQueries, (string | undefined)[][]>
          >;
          return [`timeseries with metrics queries:`, metricQueries];
        }
      )
      .with(
        {
          requests: [{ sql_query: P.select() }],
          viz: 'wildcard',
          specification: {
            type: 'vega',
          },
        },
        (q) => {
          type t = Expect<Equal<typeof q, string>>;

          return 'vega wildcard with sql_query: ' + q;
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

          return [format, dataSource];
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
          requests: [{ response_format: P.union('timeseries', 'scalar') }],
        },
        () => 'formulas requests'
      )
      .with(
        { style: P.optional({ palette: P.__ }) },
        (withPalette) => withPalette.viz
      )
      .with(
        { requests: P.array({ sql_query: P.select() }) },
        (queries) => queries
      )
      .with(
        { viz: 'sunburst', requests: P.array({ response_format: P.select() }) },
        (scalars) => scalars
      )
      .with(
        {
          viz: P.union(
            'geomap',
            'timeseries',
            'heatmap',
            'scatterplot',
            'sunburst',
            'wildcard',
            'query_table'
          ),
        },
        () => ''
      )
      .with(
        { viz: 'servicemap' },
        { viz: 'distribution' },
        { viz: 'treemap' },
        { viz: 'toplist' },
        { viz: 'hostmap' },
        () => ''
      )
      .exhaustive();

  it('should return the correct output', () => {
    expect(
      f({
        viz: 'wildcard',
        requests: [
          {
            sql_query: 'SELECT *',
            request_type: 'ddsql',
            response_format: 'scalar',
          },
        ],
        specification: {
          type: 'vega',
          contents: { something: 'cool' },
        },
      })
    ).toBe('vega wildcard with sql_query: SELECT *');

    expect(
      f({
        viz: 'wildcard',
        requests: [
          {
            sql_query: 'SELECT *',
            request_type: 'ddsql',
            response_format: 'scalar',
          },
        ],
        specification: {
          type: 'vega',
          contents: { something: 'cool' },
        },
      })
    ).toBe('vega wildcard with sql_query: SELECT *');

    expect(
      f({
        viz: 'timeseries',
        requests: [
          {
            response_format: 'timeseries',
            queries: [
              {
                name: 'a',
                data_source: 'metrics',
                query: 'a',
              },
              {
                name: 'b',
                data_source: 'metrics',
                query: 'b',
              },
              {
                name: 'c',
                data_source: 'logs',
                compute: { aggregation: 'avg' },
              },
            ],
          },
          {
            response_format: 'timeseries',
            queries: [
              {
                name: 'd',
                data_source: 'metrics',
                query: 'd',
              },
            ],
          },
        ],
      })
    ).toEqual([
      'timeseries with metrics queries:',
      [['a', 'b', undefined], ['d']],
    ]);
  });
});
