import { match } from '../../src';
import { Entity } from './shared';

/**
 * Same match as `discriminated-union-exhaustive.ts`, but with one case
 * missing. This simulates the mid-edit state where `.exhaustive()`
 * reports the unhandled case.
 */
export function redact(entity: Entity): Entity | undefined {
  return (
    match(entity)
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
        (e) => ({ ...e, body: '' })
      )
      // @ts-expect-error: the 'thread' case is not handled.
      .exhaustive()
  );
}
