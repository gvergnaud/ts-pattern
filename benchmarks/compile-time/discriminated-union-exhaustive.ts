import { match } from '../../src';
import { Entity } from './shared';

/**
 * A wide discriminated union of object types matched per-discriminant,
 * with refined patterns on a nested boolean discriminant, a 2-pattern
 * `.with()` and a large variadic `.with()`.
 */
export function redact(entity: Entity): Entity {
  return match(entity)
    .with({ kind: 'document', inlined: true }, (e) => ({
      ...e,
      body: '',
    }))
    .with({ kind: 'document', inlined: false }, (e) => ({
      ...e,
      comments: e.comments.map((comment) => ({ ...comment, body: '' })),
    }))
    .with({ kind: 'user' }, (e) => ({
      ...e,
      posts: e.posts.map((comment) => ({ ...comment, body: '' })),
      comments: e.comments.map((comment) => ({ ...comment, body: '' })),
    }))
    .with({ kind: 'group' }, (e) => ({
      ...e,
      posts: e.posts.map((comment) => ({ ...comment, body: '' })),
      comments: e.comments.map((comment) => ({ ...comment, body: '' })),
    }))
    .with({ kind: 'folder' }, { kind: 'config' }, (e) => e)
    .with(
      { kind: 'member' },
      { kind: 'article' },
      { kind: 'website' },
      { kind: 'image' },
      { kind: 'video' },
      { kind: 'audio' },
      { kind: 'link' },
      { kind: 'note' },
      { kind: 'message' },
      { kind: 'reaction' },
      { kind: 'bookmark' },
      { kind: 'task' },
      { kind: 'label' },
      { kind: 'draft' },
      { kind: 'thread' },
      (e) => ({ ...e, body: '' })
    )
    .exhaustive();
}
