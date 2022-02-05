import { match, P } from '../src';

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
  ['QueryKeys.METRICS']: MetricQuery;
  preTemplateQuery?: string;
  _query_options?: object;
}
export interface LogRequest {
  ['QueryKeys.LOGS']: LogQuery;
}
export interface ApmRequest {
  ['QueryKeys.APM']: APMQuery;
}
export interface ApmStatsRequest {
  ['QueryKeys.APM_STATS']: ApmStatsQuery;
}
export interface RumRequest {
  ['QueryKeys.RUM']: RumQuery;
}
export interface ProfilingMetricsRequest {
  ['QueryKeys.PROFILING_METRICS']: ProfilingMetricsQuery;
}
export interface SecurityRequest {
  ['QueryKeys.SECURITY']: SecurityQuery;
}
export interface LegacyEventRequest {
  ['QueryKeys.LEGACY_EVENTS']: LegacyEventQuery;
}
export interface EventRequest {
  ['QueryKeys.EVENTS']: EventQuery;
}
export interface MonitorEvaluationRequest {
  ['QueryKeys.MONITOR_EVALUATION']: MonitorEvaluationQuery;
}
export interface ProcessRequest {
  ['QueryKeys.PROCESS']: ProcessQuery;
}
export interface CiPipelineRequest {
  ['QueryKeys.CI_PIPELINE']: CiPipelineQuery;
}
export interface CiTestRequest {
  ['QueryKeys.CI_TEST']: CiTestQuery;
}
export interface ComplianceFindingsRequest {
  ['QueryKeys.COMPLIANCE_FINDINGS']: ComplianceFindingsQuery;
}
export interface DatabaseRequest {
  ['QueryKeys.DATABASE_QUERY']: DatabaseQuery;
}
export interface IssuesRequest {
  ['QueryKeys.ISSUES_QUERY']: IssuesQuery;
}
export interface AuditRequest {
  ['QueryKeys.AUDIT']: AuditQuery;
}
export interface AppsecEventRequest {
  ['QueryKeys.APPSEC_EVENTS']: AppsecEventQuery;
}
export interface AppsecSpanRequest {
  ['QueryKeys.APPSEC_SPANS']: AppsecSpanQuery;
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

export type TimeseriesFormulaRequest = Request<
  {
    response_format: 'timeseries';
    formulas?: Formula[];
    queries: FormulaQueries;
  },
  TimeseriesRequest
>;

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
  ['QueryKeys.DDSQL']: string;
};

export type DDSQLTableRequest = {
  request_type: 'ddsql';
  response_format: 'scalar';
  ['QueryKeys.DDSQL']: string;
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

export type DataSourceRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ApmStatsRequest
  | LegacyEventRequest
  | MonitorEvaluationRequest
  | ProcessRequest
  | FormulaRequest
  | ListStreamRequest
  | FunnelRequest
  | DDSQLRequest;

/**
 * Viz Requests
 * These requests are meant to be combined with a DataSource Request and used
 * in a tile def. They describe visual requirements e.g. should be displayed as
 * bars, will be displayed as a distribution graph...
 */

export type VizRequest =
  | TimeseriesRequest
  | DistributionRequest
  | HeatmapRequest
  | ChangeRequest
  | QueryTableRequest
  | QueryValueRequest
  | ScatterplotRequest
  | TopListRequest;

export type Request<D = DataSourceRequest, V = unknown> = D & V;

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

export type TimeseriesTileDefRequest = Request<
  TimeseriesDataSourceRequest,
  TimeseriesRequest
>;

export interface TimeseriesTileDef {
  viz: 'timeseries';
  requests: TimeseriesTileDefRequest[];
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

export type TableFormulaRequest = { formulas?: TableFormula[] };

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

export type QueryTableTileDefRequest = Request<
  QueryTableDataSourceRequest,
  QueryTableRequest
>;

export type HasSearchBar = 'always' | 'never' | 'auto';

export interface QueryTableTileDef {
  viz: 'query_table';
  requests: QueryTableTileDefRequest[];
  has_search_bar?: HasSearchBar;
  custom_links?: CustomLink[];
}

/* Hostmap */

export type HostmapTileDefRequest = Request<MetricRequest>;

export interface HostmapTileDef {
  viz: 'hostmap';
  requests: {
    fill?: HostmapTileDefRequest;
    size?: HostmapTileDefRequest;
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

export type HeatmapDataSourceRequest = MetricRequest | ProcessRequest;

export interface HeatmapRequest {
  style?: RequestStyle;
}

export type HeatmapTileDefRequest = Request<
  MetricRequest | ProcessRequest,
  HeatmapRequest
>;

export interface HeatmapTileDef {
  viz: 'heatmap';
  requests: HeatmapTileDefRequest[];
  yaxis?: Axis;
  events?: Event[];
  custom_links?: CustomLink[];
}

/* Change */

export type CompareToOptions =
  | 'hour_before'
  | 'day_before'
  | 'week_before'
  | 'month_before';

export type ChangeTypeOptions = 'absolute' | 'relative';

export type OrderByOptions = 'change' | 'name' | 'present' | 'past';

export interface ChangeRequest {
  change_type?: ChangeTypeOptions;
  increase_good?: boolean;
  show_present?: boolean;
  order_by?: OrderByOptions;
  order_dir?: OrderDir;
}

export interface ChangeMetricRequest extends MetricRequest {
  compare_to?: CompareToOptions;
}

export type ChangeTileDefRequest = Request<
  ChangeMetricRequest | ScalarFormulaRequest,
  ChangeRequest
>;

export interface ChangeTileDef {
  viz: 'change';
  requests: ChangeTileDefRequest[];
  custom_links?: CustomLink[];
}

/* Service Map */

export interface ServiceMapTileDef {
  viz: 'servicemap';
  // for typescript to correctly handle the TileDef union type, it's important for the requests to be marked as always being undefined
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

export type TreemapTileDefRequest = Request<TreemapDataSourceRequest, {}>;

export type TreemapSizeBy = 'pct_cpu' | 'pct_mem';

export type TreemapColorBy = 'user';

export type TreemapGroupBy = 'family' | 'process' | 'user';

export interface TreemapTileDef {
  viz: 'treemap';
  requests: TreemapTileDefRequest[];
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

export type TopListTileDefRequest = Request<
  TopListDataSourceRequest,
  TopListRequest
>;

export interface TopListTileDef {
  viz: 'toplist';
  requests: TopListTileDefRequest[];
  custom_links?: CustomLink[];
}

/* List Stream */

export type ListStreamColumn<F = string> = {
  width: 'auto' | 'compact' | 'full';
  field: F;
};

export type ListStreamViz = ListStreamTileDef['viz'];

interface BaseListStreamQuery {
  data_source: ListStreamViz;
  query_string: string;
  indexes?: string[];
}

export interface LogsStreamQuery extends BaseListStreamQuery {
  data_source: 'logs_stream';
}

type LogsPatternGroupBy = { facet: string };

export interface LogsPatternStreamQuery extends BaseListStreamQuery {
  data_source: 'logs_pattern_stream';
  group_by?: LogsPatternGroupBy[];
}

export type LogsTransactionGroupBy = { facet: string };
type LogsTransactionCompute = {
  facet: string;
  aggregation: EventsAggregator;
};

export interface LogsTransactionStreamQuery extends BaseListStreamQuery {
  data_source: 'logs_transaction_stream';
  group_by: [LogsTransactionGroupBy];
  compute: LogsTransactionCompute[];
}

export interface AuditStreamQuery extends BaseListStreamQuery {
  data_source: 'audit_stream';
}

export type ListStreamQuery =
  | LogsStreamQuery
  | LogsPatternStreamQuery
  | LogsTransactionStreamQuery
  | AuditStreamQuery;

export interface ListStreamRequest {
  columns: ListStreamColumn[];
  query: ListStreamQuery;
  response_format: 'event_list';
}

export interface LogsStreamRequest extends ListStreamRequest {
  query: LogsStreamQuery;
}

export interface LogsPatternStreamRequest extends ListStreamRequest {
  query: LogsPatternStreamQuery;
}

export interface LogsTransactionStreamRequest extends ListStreamRequest {
  query: LogsTransactionStreamQuery;
}

export interface AuditStreamRequest extends ListStreamRequest {
  query: AuditStreamQuery;
}

export interface LogsStreamTileDef {
  viz: 'logs_stream';
  requests: [LogsStreamRequest];
}

export interface LogsPatternStreamTileDef {
  viz: 'logs_pattern_stream';
  requests: [LogsPatternStreamRequest];
}

export interface LogsTransactionStreamTileDef {
  viz: 'logs_transaction_stream';
  requests: [LogsTransactionStreamRequest];
}

export interface AuditStreamTileDef {
  viz: 'audit_stream';
  requests: [AuditStreamRequest];
}

export type ListStreamTileDef =
  | LogsStreamTileDef
  | LogsPatternStreamTileDef
  | LogsTransactionStreamTileDef
  | AuditStreamTileDef;

/* Distribution */

export type DistributionDataSourceRequest =
  | MetricRequest
  | ProcessRequest
  | ApmStatsRequest
  | LogsToolkitRequest;

export interface DistributionRequest {
  style?: RequestStyle;
}

export type DistributionTileDefRequest = Request<
  DistributionDataSourceRequest,
  DistributionRequest
>;

export interface DistributionTileDef {
  viz: 'distribution';
  requests: DistributionTileDefRequest[];
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

export type ScatterplotTileDefRequest = Request<
  ScatterplotDataSourceRequest,
  ScatterplotRequest
>;

export interface ScatterplotTileDef {
  viz: 'scatterplot';
  requests: ScatterplotTileDefRequest[];
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

export type QueryValueTileDefRequest = Request<
  QueryValueDataSourceRequest,
  QueryValueRequest
>;

export type TimeseriesBackground = {
  type: 'bars' | 'area';
  yaxis?: Axis;
};

export interface QueryValueTileDef {
  viz: 'query_value';
  requests: QueryValueTileDefRequest[];
  autoscale?: boolean;
  custom_unit?: string;
  precision?: number;
  custom_links?: CustomLink[];
  timeseries_background?: TimeseriesBackground;
}

/* Alert Value */
export interface AlertValueRequest {
  request_type: 'alert_value';
  alert_id?: string | undefined;
  alert_name?: string; // Used in the graph editor, not saved to the backend
}
export interface AlertValueTileDef {
  viz: 'alert_value';
  requests: AlertValueRequest[];
  custom_unit?: string;
  precision?: number;
}
/* Geo Map */

export interface GeomapStyle {
  palette_flip: boolean;
}

export interface GeomapView {
  focus: string;
}

export type GeomapTileDefRequest =
  | MetricRequest
  | LogsToolkitRequest
  | ScalarFormulaRequest
  | DDSQLTableRequest;

export interface GeomapTileDef {
  viz: 'geomap';
  requests: GeomapTileDefRequest[];
  custom_links?: CustomLink[];
  style: GeomapStyle;
  view: GeomapView;
}

/* Alert Graph */

export interface AlertGraphRequest {
  alert_id?: string | undefined;
  alert_name?: string; // Used in the graph editor, not saved to the backend
}

export interface AlertGraphTileDef {
  requests: [AlertGraphRequest];
  viz: 'alert_graph';
}

/* Service Summary */

export type ServiceSummaryLayout = 'one_column' | 'two_column' | 'three_column';
export type ServiceSummarySize = 'small' | 'medium' | 'large';

export interface ServiceSummaryTileDef {
  viz: 'trace_service';
  // for typescript to correctly handle the TileDef union type, it's important for the requests to be marked as always being undefined
  requests?: undefined;
  env: string;
  service: string;
  span_name: string;
  show_hits?: boolean;
  show_errors?: boolean;
  show_latency?: boolean;
  show_breakdown?: boolean;
  show_distribution?: boolean;
  show_resource_list?: boolean;
  size_format?: ServiceSummarySize;
  display_format?: ServiceSummaryLayout;
}

/* Funnel */

export type RumFunnelStep = {
  facet: string;
  value: string;
};

export interface RumFunnelQuery {
  data_source: 'rum';
  query_string: string;
  steps: RumFunnelStep[];
}

// Union of all possible Funnel queries
export type FunnelQuery = RumFunnelQuery;

export interface FunnelRequest {
  query: FunnelQuery;
  request_type: 'funnel';
}

export interface FunnelTileDef {
  viz: 'funnel';
  requests: FunnelRequest[];
}

type PlotPaletteName = 'red' | 'blue' | 'orange';

/* Sunburst */

type SunburstRequest = {
  style?: {
    palette?: PlotPaletteName;
  };
};

export type SunburstTileDefRequest = Request<
  ScalarFormulaRequest,
  SunburstRequest
>;

export type SunburstKnownLegend =
  | { type: 'table' }
  | { type: 'inline'; hide_value?: boolean; hide_percent?: boolean }
  | { type: 'none' };

export type SunburstLegend =
  | { type: 'automatic'; hide_value?: boolean; hide_percent?: boolean }
  | SunburstKnownLegend;

export type SunburstTileDef = {
  viz: 'sunburst';
  requests: SunburstTileDefRequest[];
  hide_total?: boolean;
  legend?: SunburstLegend;
};

/* Note Widget */

export interface NoteTileDef {
  viz: 'note';
  content: string;
  background_color?: string;
  font_size?: string;
  text_align?: 'left' | 'center' | 'right';
  vertical_align?: 'top' | 'center' | 'bottom';
  has_padding?: boolean;
  show_tick?: boolean;
  tick_pos?: string;
  tick_edge?: 'bottom' | 'left' | 'right' | 'top';
}

/* Wildcard */

export type WildcardTileDefRequest = DDSQLTableRequest | ScalarFormulaRequest;

export type WildcardTileDef = {
  viz: 'wildcard';
  requests: WildcardTileDefRequest[];
  specification: {
    type: 'vega' | 'vega-lite';
    contents: object;
  };
};

/* IFrame */

export type IFrameTileDef = {
  viz: 'iframe';
  url: string;
};
/* Image */

export type ImageTileDef = {
  viz: 'image';
  url: string;
  url_dark_theme?: string;
  has_background?: boolean;
  has_border?: boolean;
  vertical_align?: 'top' | 'center' | 'bottom';
  horizontal_align?: 'left' | 'center' | 'right';
};

/* SloList */

export type SloListTileDef = {
  viz: 'slo_list';
  requests: SloListRequest[];
};

type TileDef =
  | TimeseriesTileDef
  | QueryTableTileDef
  | HostmapTileDef
  | HeatmapTileDef
  | ChangeTileDef
  | ServiceMapTileDef
  | TreemapTileDef
  | TopListTileDef
  | LogsStreamTileDef
  | LogsPatternStreamTileDef
  | LogsTransactionStreamTileDef
  | AuditStreamTileDef
  | ListStreamTileDef
  | DistributionTileDef
  | ScatterplotTileDef
  | QueryValueTileDef
  | AlertValueTileDef
  | GeomapTileDef
  | AlertGraphTileDef
  | ServiceSummaryTileDef
  | FunnelTileDef
  | SunburstTileDef
  | NoteTileDef
  | WildcardTileDef
  | IFrameTileDef
  | ImageTileDef
  | SloListTileDef;

const f = (td: TileDef) =>
  match(td)
    .with(
      {
        viz: 'timeseries',
        requests: P.array({
          queries: P.array(
            P.union({ data_source: 'metrics', query: P.select() }, P.__)
          ),
        }),
      },
      (metricQueries) => {}
    )
    .with(
      {
        requests: P.array(
          P.union(
            { response_format: 'timeseries' },
            { response_format: 'scalar' }
          )
        ),
      },
      () => 'formulas requests'
    )
    .with(
      {
        //   BUG
        requests: P.array({ response_format: P.union('timeseries', 'scalar') }),
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
      { requests: P.array({ 'QueryKeys.DDSQL': P.select() }) },
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
