interface RequestStyle {
  palette?: string;
}

type AxisBound = string | number;
type Aggregator = 'sum' | 'avg';

interface Axis {
  label?: string;
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
  units?: boolean;
}

interface DistributionXAxis {
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
}

interface DistributionYAxis {
  label?: string;
  scale?: 'linear' | 'log';
  min?: AxisBound;
  max?: AxisBound;
  include_zero?: boolean;
  units?: boolean;
}

interface Marker {
  value?: string;
  time?: string;
  display_type?: string;
  label?: string;
  val?: number;
  min?: number;
  max?: number;
  type?: string;
  from_ts?: string;
  to_ts?: string;
  ts?: string;
  on_right_yaxis?: boolean;
  is_hovered?: boolean;
}

interface Event {
  q: string;
  tags_execution?: 'TagsExecution';
}

type Markers = Marker[];

interface ConditionalFormat {
  comparator: 'Comparator';
  value?: number | string;
  palette: string;
  custom_bg_color?: string;
  custom_fg_color?: string;
  image_url?: string;
  hide_value?: boolean;
  metric?: string;
}

interface ContextMenuLink {
  link?: string;
  is_hidden?: boolean;
}

interface UserDefinedLink {
  label: string;
  link: string;
}

type CustomLink = ContextMenuLink | UserDefinedLink;

type OrderDir = 'a' | 'b';

type EventCompute = {
  aggregation: string;
  interval?: number;
  facet?: string;
};

interface GroupBy {
  facet: string;
  limit?: number;
  sort?: {
    aggregation: string;
    order: OrderDir;
    facet?: string;
  };
  should_exclude_missing?: boolean;
}

type EventQuery = {
  index?: string;
  compute?: EventCompute;
  multi_compute?: EventCompute[];
  search?: {
    query: string;
  };
  group_by?: GroupBy[];
};

type MetricQuery = string;

type ProcessQuery = {
  metric: string;
  search_by?: string;
  filter_by?: string[];
  query_filter?: string;
  limit: number;
  is_normalized_cpu?: boolean;
};

interface QueryTableColumnRequest {
  name: string;
  alias?: string;
  order?: OrderDir;
}

interface ApmStatsQuery {
  service: string;
  env: string;
  name: string;
  resource?: string;
  columns?: QueryTableColumnRequest[];
}

interface MetricRequest {
  metrics_query: MetricQuery;
  preTemplateQuery?: string;
  _query_options?: object;
}
interface LogRequest {
  logs_query: EventQuery;
}
interface ApmRequest {
  apm_query: EventQuery;
}
interface ApmStatsRequest {
  apm_stats_query: ApmStatsQuery;
}
interface RumRequest {
  rum_query: EventQuery;
}
interface EventRequest {
  events_query: EventQuery;
}
interface ProcessRequest {
  process_query: ProcessQuery;
}

interface ComplianceFindingsRequest {
  compliance_findings_query: EventQuery;
}

interface IssuesRequest {
  issues_query_query: EventQuery;
}
interface AuditRequest {
  audit_query: EventQuery;
}

type FormulaEventsDataSource =
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

type FormulaMetricsQuery = {
  name: string;
  data_source: 'metrics' | 'cloud_cost';
  query: string;
  aggregator?: Aggregator;
};

type EventsCompute = {
  aggregation: EventsAggregator;
  metric?: string;
  interval?: number;
};

type EventsAggregator =
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

type EventsGroupBy = {
  facet: string;
  limit?: number;
  sort?: {
    aggregation: EventsAggregator;
    order?: OrderDir;
    metric?: string;
  };
  should_exclude_missing?: boolean;
};

type FormulaEventsQuery = {
  name: string;
  data_source: FormulaEventsDataSource;
  compute: EventsCompute;
  search?: {
    query: string;
  };
  indexes?: string[];
  group_by?: EventsGroupBy[];
};

type FormulaProcessQuery = {
  name: string;
  data_source: 'process' | 'container';
  metric: string;
  text_filter?: string;
  tag_filters?: string[];
  query_filter?: string;
  limit?: number;
  sort?: OrderDir;
  is_normalized_cpu?: boolean;
  aggregator?: Aggregator;
};

interface FormulaApmDependencyStatsQuery {
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

interface FormulaApmResourceStatsQuery {
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

type FormulaApmStatsQuery =
  | FormulaApmDependencyStatsQuery
  | FormulaApmResourceStatsQuery;

type FormulaIncidentsQuery = {
  name: string;
  data_source: 'incident_analytics';
  compute: EventsCompute;
  search?: {
    query: string;
  };
  indexes?: string[];
  group_by?: EventsGroupBy[];
};

type FormulaQuery =
  | FormulaMetricsQuery
  | FormulaEventsQuery
  | FormulaProcessQuery
  | FormulaApmStatsQuery
  | FormulaIncidentsQuery;

type FormulaQueries = FormulaQuery[];

type Formula = {
  formula: string;
  alias?: string;
  limit?: {
    count?: number;
    order?: OrderDir;
  };
};

interface TimeseriesFormulaRequest extends TimeseriesRequest {
  response_format: 'timeseries';
  formulas?: Formula[];
  queries: FormulaQueries;
}

type ScalarFormulaRequest = {
  response_format: 'scalar';
  formulas?: Formula[];
  queries: FormulaQueries;
};

type SQLTimeseriesRequest = {
  request_type: 'sql';
  response_format: 'timeseries';
  sql_query: string;
};

type SQLTableRequest = {
  request_type: 'sql';
  response_format: 'scalar';
  sql_query: string;
};

type EventPlatformRequest =
  | LogRequest
  | ApmRequest
  | RumRequest
  | ComplianceFindingsRequest
  | EventRequest
  | IssuesRequest
  | AuditRequest;

type TimeseriesDataSourceRequest =
  | MetricRequest
  | EventRequest
  | ProcessRequest
  | EventPlatformRequest
  | TimeseriesFormulaRequest
  | SQLTimeseriesRequest;

interface TimeseriesRequestStyle {
  palette?: string;
}

interface Metadata {
  [key: string]: { alias: string };
}

type DisplayType = 'line' | 'bar' | 'area';

interface TimeseriesRequest {
  type?: DisplayType;
  metadata?: Metadata;
  style?: TimeseriesRequestStyle;
  on_right_yaxis?: boolean;
}

type TimeseriesDefinitionRequest = TimeseriesDataSourceRequest &
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

type TableFormula = Formula & {
  conditional_formats?: ConditionalFormat[];
};

type TableFormulaRequest = {
  formulas?: TableFormula[];
  response_format: 'scalar';
  queries: FormulaQueries;
};

type QueryTableDataSourceRequest =
  | MetricRequest
  | EventPlatformRequest
  | ApmStatsRequest
  | TableFormulaRequest
  | SQLTableRequest;

interface QueryTableRequest {
  aggregator?: Aggregator;
  limit?: number;
  order?: OrderDir;
  alias?: string;
  conditional_formats?: ConditionalFormat[];
}

type QueryTableDefinitionRequest = QueryTableDataSourceRequest &
  QueryTableRequest;

type HasSearchBar = 'always' | 'never' | 'auto';

interface QueryTableDefinition {
  viz: 'query_table';
  requests: QueryTableDefinitionRequest[];
  has_search_bar?: HasSearchBar;
  custom_links?: CustomLink[];
}

interface HeatmapRequest {
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

interface ServiceMapDefinition {
  viz: 'servicemap';
  requests?: undefined;
  custom_links?: CustomLink[];
}

type TreemapProcessMemoryRequest = { q: string };

type TreemapDataSourceRequest =
  | ScalarFormulaRequest
  | TreemapProcessMemoryRequest;

type TreemapSizeBy = 'pct_cpu' | 'pct_mem';

type TreemapColorBy = 'user';

type TreemapGroupBy = 'family' | 'process' | 'user';

interface TreemapDefinition {
  viz: 'treemap';
  requests: TreemapDataSourceRequest[];
  size_by?: TreemapSizeBy;
  color_by?: TreemapColorBy;
  group_by?: TreemapGroupBy;
}

interface TopListRequest {
  conditional_formats?: ConditionalFormat[];
}

type TopListDataSourceRequest =
  | MetricRequest
  | EventPlatformRequest
  | ProcessRequest
  | ScalarFormulaRequest
  | SQLTableRequest;

type TopListDefinitionRequest = TopListDataSourceRequest & TopListRequest;

interface TopListDefinition {
  viz: 'toplist';
  requests: TopListDefinitionRequest[];
  custom_links?: CustomLink[];
}

type DistributionDataSourceRequest =
  | MetricRequest
  | ProcessRequest
  | ApmStatsRequest
  | EventPlatformRequest;

interface DistributionRequest {
  style?: RequestStyle;
}

type DistributionDefinitionRequest = DistributionDataSourceRequest &
  DistributionRequest;

interface DistributionDefinition {
  viz: 'distribution';
  requests: DistributionDefinitionRequest[];
  xaxis?: DistributionXAxis;
  yaxis?: DistributionYAxis;
  markers?: Markers;
  custom_links?: CustomLink[];
}

type ScatterPlotDimension = 'x' | 'y' | 'radius' | 'color';

type ScatterplotFormula = Formula & {
  dimension: ScatterPlotDimension;
};

interface ScatterplotScalarFormulaRequest extends ScalarFormulaRequest {
  formulas: ScatterplotFormula[];
}

type ScatterplotDataSourceRequest =
  | MetricRequest
  | ScatterplotScalarFormulaRequest
  | SQLTableRequest;

interface ScatterplotRequest {
  aggregator?: Aggregator;
}

type ScatterplotDefinitionRequest = ScatterplotDataSourceRequest &
  ScatterplotRequest;

interface ScatterplotDefinition {
  viz: 'scatterplot';
  requests: ScatterplotDefinitionRequest[];
  custom_links?: CustomLink[];
  xaxis?: Axis;
  yaxis?: Axis;
  color_by_groups?: string[];
}

interface GeomapStyle {
  palette_flip: boolean;
}

interface GeomapView {
  focus: string;
}

type GeomapDefinitionRequest =
  | MetricRequest
  | EventPlatformRequest
  | ScalarFormulaRequest
  | SQLTableRequest;

interface GeomapDefinition {
  viz: 'geomap';
  requests: GeomapDefinitionRequest[];
  custom_links?: CustomLink[];
  style: GeomapStyle;
  view: GeomapView;
}

type PlotPaletteName = 'red' | 'blue' | 'orange';

type SunburstRequest = {
  style?: {
    palette?: PlotPaletteName;
  };
};

interface SunburstDefinitionRequest
  extends ScalarFormulaRequest,
    SunburstRequest {}

type SunburstKnownLegend =
  | { type: 'table' }
  | { type: 'inline'; hide_value?: boolean; hide_percent?: boolean }
  | { type: 'none' };

type SunburstLegend =
  | { type: 'automatic'; hide_value?: boolean; hide_percent?: boolean }
  | SunburstKnownLegend;

type SunburstDefinition = {
  viz: 'sunburst';
  requests: SunburstDefinitionRequest[];
  hide_total?: boolean;
  legend?: SunburstLegend;
};

type WildcardDefinitionRequest = SQLTableRequest | ScalarFormulaRequest;

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
  | HeatmapDefinition
  | ServiceMapDefinition
  | TreemapDefinition
  | TopListDefinition
  | DistributionDefinition
  | ScatterplotDefinition
  | GeomapDefinition
  | SunburstDefinition
  | WildcardDefinition;
