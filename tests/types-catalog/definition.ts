export interface RequestStyle {
  palette?: string;
}

export type AxisBound = string | number;
type Aggregator = 'sum' | 'avg';

export interface Axis {
  label?: string;
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
  units?: boolean;
}

export interface DistributionXAxis {
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
}

export interface DistributionYAxis {
  label?: string;
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
  units?: boolean;
}

/* Markers and Overlays */

export interface Marker {
  value?: string;
  time?: string;
  display_type?: string;
  label?: string;
  // Marker line
  val?: number;
  // Marker range
  min?: number;
  max?: number;
  type?: string;
  // Marker time range
  from_ts?: string;
  to_ts?: string;
  ts?: string;
  // Marker axis
  on_right_yaxis?: boolean;
  // Hover state, used internally only
  is_hovered?: boolean;
}

export interface AnomalySpanMarker extends Marker {
  type: 'correlations' | 'watchdog';
  time: string;
}

export interface Event {
  q: string;
  tags_execution?: 'TagsExecution';
}

export type Markers = Marker[];

export interface ConditionalFormat {
  comparator: 'Comparator';
  value?: number | string;
  palette: string;
  custom_bg_color?: string;
  custom_fg_color?: string;
  image_url?: string;
  hide_value?: boolean;
  metric?: string;
}

/* User-defined custom menu links */

export type ContextMenuLinkLabel =
  | 'logs'
  | 'functions'
  | 'hosts'
  | 'traces'
  | 'profiles'
  | 'processes'
  | 'containers'
  | 'rum';

export interface ContextMenuLink {
  override_label: ContextMenuLinkLabel;
  link?: string;
  is_hidden?: boolean;
}

export interface UserDefinedLink {
  label: string;
  link: string;
}

export type CustomLink = ContextMenuLink | UserDefinedLink;

type OrderDir = 'a' | 'b';

/**
 * Query types
 *
 * Most of the query types defined below are used in the classic query definition format
 */

export type LogsToolkitCompute = {
  aggregation: string;
  interval?: number;
  facet?: string;
};

export interface GroupBy {
  facet: string;
  limit?: number;
  sort?: {
    aggregation: string;
    order: OrderDir;
    facet?: string;
  };
  should_exclude_missing?: boolean;
}

/* Logs toolkit query types */

export type LogsToolkitQuery = {
  // index stores multiple indexes in a comma separate format.
  // For example: index:"index-1,index2", and index="*" stands for all indexes.
  index?: string;
  compute?: LogsToolkitCompute;
  multi_compute?: LogsToolkitCompute[];
  search?: {
    query: string;
  };
  group_by?: GroupBy[];
};

export type LogQuery = LogsToolkitQuery;
export type APMQuery = LogsToolkitQuery;
export type RumQuery = LogsToolkitQuery;
export type IssuesQuery = LogsToolkitQuery;
export type AuditQuery = LogsToolkitQuery;
export type AppsecEventQuery = LogsToolkitQuery;
export type AppsecSpanQuery = LogsToolkitQuery;
export type ProfilingMetricsQuery = LogsToolkitQuery;
export type SecurityQuery = LogsToolkitQuery;
export type EventQuery = LogsToolkitQuery;
export type CiPipelineQuery = LogsToolkitQuery;
export type CiTestQuery = LogsToolkitQuery;
export type DatabaseQuery = LogsToolkitQuery;
export type ComplianceFindingsQuery = LogsToolkitQuery;

export type MetricQuery = string;

export type ProcessQuery = {
  metric: string;
  /** @deprecated to be removed after all saved process widgets are migrated to query_filter field */
  search_by?: string;
  /** @deprecated to be removed after all saved process widgets are migrated to query_filter field */
  filter_by?: string[];
  query_filter?: string;
  limit: number;
  is_normalized_cpu?: boolean;
};

export type LegacyEventQuery = {
  search: string;
  tags_execution: 'TagsExecution';
};

export type MonitorEvaluationQuery = {
  monitor_id: number;
};

export interface QueryTableColumnRequest {
  name: string;
  alias?: string;
  order?: OrderDir;
}

export interface ApmStatsQuery {
  service: string;
  env: string;
  name: string;
  primary_tag: string; // key and value, e.g. datacenter:us1.prod
  resource?: string;
  columns?: QueryTableColumnRequest[];
  // TODO: should we permit arbitrary group_by in the future?
  // We'll start without it since the frontend currently does not let the user change this,
  //  but keep in mind that the API supports it.
}

/**
 * Slo list widget
 */
export interface SloListRequest {
  query: SloListQuery;
  request_type: 'slo_list';
}

export interface SloListQuery {
  tags_query?: string;
}

// generic query type
export type GenericQuery =
  | MetricQuery
  | LogsToolkitQuery
  | ProcessQuery
  | LegacyEventQuery
  | MonitorEvaluationQuery
  | ApmStatsQuery
  | FormulaQueries;

/**
 * DataSource Requests
 */

/**
 * Classic-Style Request Type Definitions
 *
 * This style of request type (defined by the presence of a specific key) is deprecated.
 * For any new kind of request, use the request_type determinant property
 */
export interface MetricRequest {
  metrics_query: MetricQuery;
  preTemplateQuery?: string;
  _query_options?: object;
}
export interface LogRequest {
  logs_query: LogQuery;
}
export interface ApmRequest {
  apm_query: APMQuery;
}
export interface ApmStatsRequest {
  apm_stats_query: ApmStatsQuery;
}
export interface RumRequest {
  rum_query: RumQuery;
}
export interface ProfilingMetricsRequest {
  profiling_metrics_query: ProfilingMetricsQuery;
}
export interface SecurityRequest {
  security_query: SecurityQuery;
}
export interface LegacyEventRequest {
  legacy_events_query: LegacyEventQuery;
}
export interface EventRequest {
  events_query: EventQuery;
}
export interface MonitorEvaluationRequest {
  monitor_evaluation_query: MonitorEvaluationQuery;
}
export interface ProcessRequest {
  process_query: ProcessQuery;
}
export interface CiPipelineRequest {
  ci_pipeline_query: CiPipelineQuery;
}
export interface CiTestRequest {
  ci_test_query: CiTestQuery;
}
export interface ComplianceFindingsRequest {
  compliance_findings_query: ComplianceFindingsQuery;
}
export interface DatabaseRequest {
  database_query_query: DatabaseQuery;
}
export interface IssuesRequest {
  issues_query_query: IssuesQuery;
}
export interface AuditRequest {
  audit_query: AuditQuery;
}
export interface AppsecEventRequest {
  appsec_events_query: AppsecEventQuery;
}
export interface AppsecSpanRequest {
  appsec_spans_query: AppsecSpanQuery;
}

/* Formulas + Functions Query Definition Format */

export type FormulaResponseFormat = 'timeseries' | 'scalar';

export type FormulaEventsDataSource =
  | 'logs'
  | 'spans'
  | 'rum'
  | 'network'
  | 'security_signals'
  | 'profiles'
  | 'events'
  | 'ci_pipelines'
  | 'ci_tests'
  | 'compliance_findings'
  | 'database_queries'
  | 'synthetics_batches'
  | 'app_sec_events'
  | 'app_sec_spans'
  | 'audit';

// Formulas + Functions Query and Request definitions
export type FormulaDataSource =
  // metrics and metrics-like
  | 'metrics'
  | 'cloud_cost'
  // APM stats sources
  | 'apm_dependency_stats'
  | 'apm_resource_stats'
  // process and process-like
  | 'process'
  | 'container'
  // events-platform tracks as sources
  | FormulaEventsDataSource
  | 'incident_analytics';

export type FormulaMetricsQuery = {
  /** the variable name that will be used in a formula */
  name: string;
  /** data source type determinant */
  data_source: 'metrics' | 'cloud_cost';
  /** the query string, in the format: 'space_aggregator:metric_name{filter} by {grouping}.modifier()' */
  query: string;
  /** a.k.a. "reducer", used for scalar queries to aggregate each timeseries result to a single scalar value */
  aggregator?: Aggregator;
};

export type EventsCompute = {
  aggregation: EventsAggregator;
  metric?: string;
  interval?: number;
};

export type EventsAggregator =
  | 'count'
  | 'cardinality'
  | 'median'
  | 'pc75'
  | 'pc90'
  | 'pc95'
  | 'pc98'
  | 'pc99'
  | 'sum'
  | 'min'
  | 'max'
  | 'avg';

export type EventsGroupBy = {
  /** the facet to use to determine each event's group */
  facet: string;
  /** limit on the number of groups returned */
  limit?: number;
  /** how the groups should be sorted, before applying the limit */
  sort?: {
    aggregation: EventsAggregator;
    order?: OrderDir;
    metric?: string;
  };
  /** whether to exclude an "N/A" group aggregating all events which are missing the grouping facet */
  should_exclude_missing?: boolean;
};

// Note that the EventsQuery object works for both timeseries and scalar queries.
export type FormulaEventsQuery = {
  /** the variable name that will be used in a formula */
  name: string;
  /** data source type determinant for this query */
  data_source: FormulaEventsDataSource;
  /** the aggregation to compute for the matching events */
  compute: EventsCompute;
  /** the search to apply to find matching events */
  search?: {
    query: string;
  };
  /** the indexes within which to search for events */
  indexes?: string[];
  /** how results should be grouped */
  group_by?: EventsGroupBy[];
};

export type FormulaProcessQuery = {
  /** the variable name that will be used in a formula */
  name: string;
  data_source: 'process' | 'container';
  metric: string;
  /** @deprecated to be removed after all saved process widgets are migrated to query_filter field */
  text_filter?: string;
  /** @deprecated to be removed after all saved process widgets are migrated to query_filter field */
  tag_filters?: string[];
  query_filter?: string;
  limit?: number;
  sort?: OrderDir;
  is_normalized_cpu?: boolean;
  // used for scalar queries
  aggregator?: Aggregator;
};

export interface FormulaApmDependencyStatsQuery {
  name: string;
  data_source: 'apm_dependency_stats';
  env: string;
  is_upstream?: boolean;
  operation_name: string;
  primary_tag_name?: string;
  primary_tag_value?: string;
  resource_name: string;
  service: string;
}

export interface FormulaApmResourceStatsQuery {
  name: string;
  data_source: 'apm_resource_stats';
  env: string;
  group_by?: string[];
  operation_name: string;
  primary_tag_name?: string;
  primary_tag_value?: string;
  resource_name?: string;
  service: string;
}

export type FormulaApmStatsQuery =
  | FormulaApmDependencyStatsQuery
  | FormulaApmResourceStatsQuery;

export type FormulaIncidentsQuery = {
  name: string;
  data_source: 'incident_analytics';
  compute: EventsCompute;
  search?: {
    query: string;
  };
  indexes?: string[];
  group_by?: EventsGroupBy[];
};

export type FormulaQuery =
  | FormulaMetricsQuery
  | FormulaEventsQuery
  | FormulaProcessQuery
  | FormulaApmStatsQuery
  | FormulaIncidentsQuery;

export type FormulaQueries = FormulaQuery[];

export type Formula = {
  formula: string;
  alias?: string;
  limit?: {
    count?: number;
    order?: OrderDir;
  };
};

export interface TimeseriesFormulaRequest extends TimeseriesRequest {
  response_format: 'timeseries';
  formulas?: Formula[];
  queries: FormulaQueries;
}

export type ScalarFormulaRequest = {
  response_format: 'scalar';
  formulas?: Formula[];
  queries: FormulaQueries;
};

export type FormulaRequest = TimeseriesFormulaRequest | ScalarFormulaRequest;

/* DDSQL queries */
export type DDSQLTimeseriesRequest = {
  request_type: 'ddsql';
  response_format: 'timeseries';
  sql_query: string;
};

export type DDSQLTableRequest = {
  request_type: 'ddsql';
  response_format: 'scalar';
  sql_query: string;
};

export type DDSQLRequest = DDSQLTimeseriesRequest | DDSQLTableRequest;

/* Data Source Request Unions */

export type LogsToolkitRequest =
  | LogRequest
  | ApmRequest
  | RumRequest
  | SecurityRequest
  | ComplianceFindingsRequest
  | EventRequest
  | ProfilingMetricsRequest
  | CiPipelineRequest
  | CiTestRequest
  | IssuesRequest
  | AuditRequest
  | AppsecEventRequest
  | DatabaseRequest;

type DataSourceRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ApmStatsRequest
  | LegacyEventRequest
  | MonitorEvaluationRequest
  | ProcessRequest
  | FormulaRequest
  | DDSQLRequest;

/**
 * Viz Requests
 * These requests are meant to be combined with a DataSource Request and used
 * in a tile def. They describe visual requirements e.g. should be displayed as
 * bars, will be displayed as a distribution graph...
 */

/**
 * Tile Defs
 * These represent user facing format (maybe not entirely?) that will be used
 * to specify visual + data requirements to smart components who will use it
 * in order to fetch the data and render it as required.
 */

/* Timeseries */

export type TimeseriesDataSourceRequest =
  | MetricRequest
  | LegacyEventRequest
  | EventRequest
  | MonitorEvaluationRequest
  | ProcessRequest
  | LogsToolkitRequest
  | TimeseriesFormulaRequest
  | DDSQLTimeseriesRequest;

export type TimeseriesDataSourceQuery =
  | MetricQuery
  | LegacyEventQuery
  | MonitorEvaluationQuery
  | ProcessQuery
  | LogsToolkitQuery
  | FormulaQueries;

export interface TimeseriesRequestStyle {
  palette?: string;
}

// Used for implementing aliases for classic metrics requests
export interface Metadata {
  [key: string]: { alias: string };
}

type DisplayType = 'line' | 'bar' | 'area';

export interface TimeseriesRequest {
  type?: DisplayType;
  metadata?: Metadata;
  style?: TimeseriesRequestStyle;
  on_right_yaxis?: boolean;
}

export type TimeseriesDefinitionRequest = TimeseriesDataSourceRequest &
  TimeseriesRequest;

interface TimeseriesDefinition {
  viz: 'timeseries';
  requests: TimeseriesDefinitionRequest[];
  yaxis?: Axis;
  right_yaxis?: Axis;
  events?: Event[];
  markers?: Marker[];
  custom_links?: CustomLink[];
}

/* Table */

export type TableFormula = Formula & {
  conditional_formats?: ConditionalFormat[];
};

export type TableFormulaRequest = {
  formulas?: TableFormula[];
  response_format: 'scalar';
  queries: FormulaQueries;
};

export type QueryTableDataSourceRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ApmStatsRequest
  | TableFormulaRequest
  | DDSQLTableRequest;

export type QueryTableDataSourceQuery =
  | MetricQuery
  | LogsToolkitQuery
  | ApmStatsQuery
  | FormulaQueries;

export interface QueryTableRequest {
  aggregator?: Aggregator;
  limit?: number;
  order?: OrderDir;
  alias?: string;
  conditional_formats?: ConditionalFormat[];
}

export type QueryTableDefinitionRequest = QueryTableDataSourceRequest &
  QueryTableRequest;

export type HasSearchBar = 'always' | 'never' | 'auto';

interface QueryTableDefinition {
  viz: 'query_table';
  requests: QueryTableDefinitionRequest[];
  has_search_bar?: HasSearchBar;
  custom_links?: CustomLink[];
}

/* Hostmap */

export type HostmapDefinitionRequest = MetricRequest;

interface HostmapDefinition {
  viz: 'hostmap';
  requests: {
    fill?: HostmapDefinitionRequest;
    size?: HostmapDefinitionRequest;
  };
  node_type?: 'ClusterNodeType.host' | 'ClusterNodeType.container';
  no_metric_hosts?: boolean;
  no_group_hosts?: boolean;
  group?: string[];
  scope?: string[];
  style?: {
    palette?: string;
    palette_flip?: boolean;
    fill_min?: string;
    fill_max?: string;
  };
  custom_links?: CustomLink[];
}

/* Heatmap */

export interface HeatmapRequest {
  style?: RequestStyle;
}

interface HeatmapDefinitionRequest extends MetricRequest, HeatmapRequest {}

interface HeatmapDefinition {
  viz: 'heatmap';
  requests: HeatmapDefinitionRequest[];
  yaxis?: Axis;
  events?: Event[];
  custom_links?: CustomLink[];
}

/* Service Map */

interface ServiceMapDefinition {
  viz: 'servicemap';
  // for typescript to correctly handle the Definition union type, it's important for the requests to be marked as always being undefined
  requests?: undefined;
  service: string; // service name
  filters: string[]; // array of filter tags
  custom_links?: CustomLink[];
}

/* Treemap */

// special-case request type used for querying a specific host's memory usage, by process
// the "q" in this request variant is *not* a metrics query string, but it resembles one
// This is used by treemap widgets in default host dashboards and the mini dash, and is not user-configurable
export type TreemapProcessMemoryRequest = { q: string };

export type TreemapDataSourceRequest =
  | ScalarFormulaRequest
  | TreemapProcessMemoryRequest;

export type TreemapSizeBy = 'pct_cpu' | 'pct_mem';

export type TreemapColorBy = 'user';

export type TreemapGroupBy = 'family' | 'process' | 'user';

interface TreemapDefinition {
  viz: 'treemap';
  requests: TreemapDataSourceRequest[];
  size_by?: TreemapSizeBy;
  color_by?: TreemapColorBy;
  group_by?: TreemapGroupBy;
}

/* Top List */

export interface TopListRequest {
  conditional_formats?: ConditionalFormat[];
}

type TopListDataSourceRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ProcessRequest
  | ScalarFormulaRequest
  | DDSQLTableRequest;

export type TopListDefinitionRequest = TopListDataSourceRequest &
  TopListRequest;

interface TopListDefinition {
  viz: 'toplist';
  requests: TopListDefinitionRequest[];
  custom_links?: CustomLink[];
}

/* Distribution */

export type DistributionDataSourceRequest =
  | MetricRequest
  | ProcessRequest
  | ApmStatsRequest
  | LogsToolkitRequest;

export interface DistributionRequest {
  style?: RequestStyle;
}

export type DistributionDefinitionRequest = DistributionDataSourceRequest &
  DistributionRequest;

interface DistributionDefinition {
  viz: 'distribution';
  requests: DistributionDefinitionRequest[];
  xaxis?: DistributionXAxis;
  yaxis?: DistributionYAxis;
  markers?: Markers;
  custom_links?: CustomLink[];
}

/* Scatterplot */

export type ScatterPlotDimension = 'x' | 'y' | 'radius' | 'color';

export type ScatterplotFormula = Formula & {
  dimension: ScatterPlotDimension;
};

export interface ScatterplotScalarFormulaRequest extends ScalarFormulaRequest {
  formulas: ScatterplotFormula[];
}

export type ScatterplotDataSourceRequest =
  | MetricRequest
  | ScatterplotScalarFormulaRequest
  | DDSQLTableRequest;

export interface ScatterplotRequest {
  aggregator?: Aggregator;
}

export type ScatterplotDefinitionRequest = ScatterplotDataSourceRequest &
  ScatterplotRequest;

interface ScatterplotDefinition {
  viz: 'scatterplot';
  requests: ScatterplotDefinitionRequest[];
  custom_links?: CustomLink[];
  xaxis?: Axis;
  yaxis?: Axis;
  color_by_groups?: string[];
}

/* Query Value */

export interface QueryValueRequest {
  aggregator?: Aggregator;
  conditional_formats?: ConditionalFormat[];
}

type QueryValueDataSourceRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ScalarFormulaRequest
  | DDSQLTableRequest;

export type QueryValueDefinitionRequest = QueryValueDataSourceRequest &
  QueryValueRequest;

export type TimeseriesBackground = {
  type: 'bars' | 'area';
  yaxis?: Axis;
};

/* Geo Map */

export interface GeomapStyle {
  palette_flip: boolean;
}

export interface GeomapView {
  focus: string;
}

export type GeomapDefinitionRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ScalarFormulaRequest
  | DDSQLTableRequest;

interface GeomapDefinition {
  viz: 'geomap';
  requests: GeomapDefinitionRequest[];
  custom_links?: CustomLink[];
  style: GeomapStyle;
  view: GeomapView;
}

type PlotPaletteName = 'red' | 'blue' | 'orange';

/* Sunburst */

type SunburstRequest = {
  style?: {
    palette?: PlotPaletteName;
  };
};

export interface SunburstDefinitionRequest
  extends ScalarFormulaRequest,
    SunburstRequest {}

export type SunburstKnownLegend =
  | { type: 'table' }
  | { type: 'inline'; hide_value?: boolean; hide_percent?: boolean }
  | { type: 'none' };

export type SunburstLegend =
  | { type: 'automatic'; hide_value?: boolean; hide_percent?: boolean }
  | SunburstKnownLegend;

type SunburstDefinition = {
  viz: 'sunburst';
  requests: SunburstDefinitionRequest[];
  hide_total?: boolean;
  legend?: SunburstLegend;
};

/* Wildcard */

export type WildcardDefinitionRequest =
  | DDSQLTableRequest
  | ScalarFormulaRequest;

type WildcardDefinition = {
  viz: 'wildcard';
  requests: WildcardDefinitionRequest[];
  specification: {
    type: 'vega' | 'vega-lite';
    contents: object;
  };
};

export type Definition =
  | TimeseriesDefinition
  | QueryTableDefinition
  | HostmapDefinition
  | HeatmapDefinition
  | ServiceMapDefinition
  | TreemapDefinition
  | TopListDefinition
  | DistributionDefinition
  | ScatterplotDefinition
  | GeomapDefinition
  | SunburstDefinition
  | WildcardDefinition;
