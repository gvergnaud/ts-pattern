import { BuildMany } from './BuildMany';
import { FindUnions } from './DistributeUnions';
import { Cast, Drop, Next, Slice, WithDefault, WithIndex } from './helpers';

/**
 * DistributeExclusionUnions find each union contained in b,
 * and return a union of b where only one union is present at a time
 * and other unions get replaced by the `unknown` type
 * @example
 * type t = DistributeExclusionUnions<['sb' | 'sc', 'eb' | 'ec']>
 * // ['sb' | 'sc', unknown] | [unknown, 'eb' | 'ec']
 */
export type DistributeExclusionUnions<a> = BuildMany<
  a,
  DistributeWithUnknowns<FindUnions<a, a>>
>;

export type DistributeWithUnknowns<unionConfigs extends any[]> = WithDefault<
  ReplaceOtherUnionsWithUnknowns<
    // add the index to recompose the list of unions
    WithIndex<unionConfigs>,
    // map the path of all unions to a [unknown, path] pair
    MapValueToUnknown<unionConfigs>
  >[number],
  []
>;

// ReplaceOtherUnionsWithUnknowns
// :: [UnionConfig, Iterator][]
// -> [unknown, path][]
// -> [unknown | union, path][]
export type ReplaceOtherUnionsWithUnknowns<
  unionConfigsWithIndices,
  unknownValuePathPair
> = unionConfigsWithIndices extends [
  [{ cases: { value: infer value }; path: infer path }, infer index],
  ...infer tail
]
  ? [
      [
        // replace the left with unknowns
        ...Slice<Cast<unknownValuePathPair, any[]>, Cast<index, any[]>>,
        // keep this union
        [value, path],
        // replace the right with unknowns
        ...Drop<Cast<unknownValuePathPair, any[]>, Next<Cast<index, any[]>>>
      ],
      ...ReplaceOtherUnionsWithUnknowns<tail, unknownValuePathPair>
    ]
  : [];

// MapValueToUnknown :: UnionConfig[] -> [[unknown, path]]
type MapValueToUnknown<
  unionConfigs,
  output extends any[] = []
> = unionConfigs extends [{ path: infer path }, ...infer tail]
  ? MapValueToUnknown<tail, [...output, [unknown, path]]>
  : output;
