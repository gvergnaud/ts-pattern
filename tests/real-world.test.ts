import { expect } from "@std/expect";
import { match, P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";
import type { Definition } from "./types-catalog/definition.ts";

const f = (def: Definition) =>
  match(def)
    .with(
      {
        viz: "timeseries",
        requests: P.array({
          queries: P.array(
            P.union({ data_source: "metrics", query: P.select() }, P.any),
          ),
        }),
      },
      (metricQueries) => {
        type t = Expect<
          Equal<typeof metricQueries, (string | undefined)[][]>
        >;
        return [`timeseries with metrics queries:`, metricQueries];
      },
    )
    .with(
      {
        requests: [{ sql_query: P.select() }],
        viz: "wildcard",
        specification: {
          type: "vega",
        },
      },
      (q) => {
        type t = Expect<Equal<typeof q, string>>;

        return "vega wildcard with sql_query: " + q;
      },
    )
    .with(
      {
        requests: P.array(
          P.intersection(
            P.union(
              { response_format: "timeseries" },
              { response_format: "scalar" },
            ),
            {
              queries: P.array({ data_source: P.union("metrics", "events") }),
            },
          ),
        ),
      },
      (x) => {
        const format = x.requests[0]?.response_format;
        const dataSource = x.requests[0]?.queries[0]?.data_source;
        type t = Expect<Equal<typeof format, "timeseries" | "scalar">>;
        type t2 = Expect<Equal<typeof dataSource, "metrics" | "events">>;

        return [format, dataSource];
      },
    )
    .with(
      {
        viz: P.union("timeseries", "query_table"),
        requests: [
          {
            // This works
            queries: P.array({ data_source: P.union("metrics", "events") }),
            response_format: P.union("timeseries", "scalar"),
          },
        ],
      },
      (x) => {},
    )
    .with(
      {
        viz: P.union("timeseries", "query_table"),
        requests: P.array({
          response_format: P.union("timeseries", "scalar"),
        }),
      },
      () => "formulas requests",
    )
    .with(
      {
        requests: P.array({ response_format: "scalar" }),
      },
      () => "formulas requests",
    )
    .with(
      {
        requests: P.array({ response_format: "timeseries" }),
      },
      () => "formulas requests",
    )
    .with(
      {
        requests: [{ response_format: P.union("timeseries", "scalar") }],
      },
      () => "formulas requests",
    )
    .with(
      { style: P.optional({ palette_flip: true }) },
      (withPalette) => withPalette.viz,
    )
    .with(
      { requests: P.array({ sql_query: P.select() }) },
      (queries) => queries,
    )
    .with(
      { viz: "geomap", requests: P.array({ response_format: P.select() }) },
      (scalars) => scalars,
    )
    .with(
      {
        viz: P.union(
          "geomap",
          "timeseries",
          "heatmap",
          "scatterplot",
          "query_table",
        ),
      },
      () => "",
    )
    .with(
      { viz: "servicemap" },
      { viz: "distribution" },
      { viz: "treemap" },
      { viz: "toplist" },
      () => "",
    )
    .exhaustive();

Deno.test("should return the correct output", () => {
  expect(
    f({
      viz: "wildcard",
      requests: [
        {
          sql_query: "SELECT *",
          request_type: "sql",
          response_format: "scalar",
        },
      ],
      specification: {
        type: "vega",
        contents: { something: "cool" },
      },
    }),
  ).toBe("vega wildcard with sql_query: SELECT *");

  expect(
    f({
      viz: "wildcard",
      requests: [
        {
          sql_query: "SELECT *",
          request_type: "sql",
          response_format: "scalar",
        },
      ],
      specification: {
        type: "vega",
        contents: { something: "cool" },
      },
    }),
  ).toBe("vega wildcard with sql_query: SELECT *");

  expect(
    f({
      viz: "timeseries",
      requests: [
        {
          response_format: "timeseries",
          queries: [
            {
              name: "a",
              data_source: "metrics",
              query: "a",
            },
            {
              name: "b",
              data_source: "metrics",
              query: "b",
            },
            {
              name: "c",
              data_source: "logs",
              compute: { aggregation: "avg" },
            },
          ],
        },
        {
          response_format: "timeseries",
          queries: [
            {
              name: "d",
              data_source: "metrics",
              query: "d",
            },
          ],
        },
      ],
    }),
  ).toEqual([
    "timeseries with metrics queries:",
    [["a", "b", undefined], ["d"]],
  ]);
});
