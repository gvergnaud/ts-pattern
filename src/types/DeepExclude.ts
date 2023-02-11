import { DistributeMatchingUnions } from './DistributeUnions';
import { IsMatching } from './IsMatching';
import { All, Extends, IsLiteral, Length, Not, ValueOf } from './helpers';

export type DeepExclude<a, b> = Exclude<DistributeMatchingUnions<a, b>, b>;
