import { match, __ } from '../src';
import { Option, NotNever } from './utils';

describe('Unions (a | b)', () => {
  it('should match discriminated unions', () => {
    const val: Option<string> = {
      kind: 'some',
      value: 'hello',
    };

    const res = match(val as Option<string>)
      .with({ kind: 'some' }, (o) => {
        const notNever: NotNever<typeof o> = true;
        const inferenceCheck: { kind: 'some'; value: string } = o;
        return o.value;
      })
      .with({ kind: 'none' }, () => 'no value')
      .run();

    const inferenceCheck: [NotNever<typeof res>, string] = [true, res];

    expect(res).toEqual('hello');
  });

  it('should discriminate union types correctly 2', () => {
    type Post = {
      type: 'post';
      id: number;
      content: { body: string };
    };
    type Video = { type: 'video'; id: number; content: { src: string } };
    type Image = { type: 'image'; id: number; content: { src: number } };

    type Input = Post | Video | Image;

    const res = match<Input>({
      type: 'post',
      id: 2,
      content: { body: 'yo' },
    })
      .with({ type: 'post', content: __ }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Post = x;
        return 1;
      })
      .with({ type: 'post', id: 7 }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Post = x;
        return 1;
      })
      .with({ type: 'video', content: { src: __.string } }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Video = x;
        return 2;
      })
      .with({ type: 'image' }, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: Image = x;
        return 3;
      })
      .run();

    expect(res).toEqual(1);
  });

  it('should discriminate union types correctly 3', () => {
    type Text = { type: 'text'; content: string };
    type Img = { type: 'img'; src: string };
    type Video = { type: 'video'; src: string };
    type Story = {
      type: 'story';
      likes: number;
      views: number;
      author: string;
      src: string;
    };
    type Data = Text | Img | Video | Story;

    type Ok<T> = { type: 'ok'; data: T };
    type ResError<T> = { type: 'error'; error: T };

    type Result<TError, TOk> = Ok<TOk> | ResError<TError>;

    const result = {
      type: 'ok',
      data: { type: 'img', src: 'hello.com' },
    } as Result<Error, Data>;

    const ouput = match(result)
      .with({ type: 'ok', data: { type: 'text' } }, (res) => {
        const notNever: NotNever<typeof res> = true;
        const inferenceCheck: Ok<Text> = res;
        return `<p>${res.data.content}</p>`;
      })
      .with({ type: 'ok', data: { type: 'img' } }, (res) => {
        const notNever: NotNever<typeof res> = true;
        const inferenceCheck: Ok<Img> = res;
        return `<img src="${res.data.src}" />`;
      })
      .with({ type: 'ok', data: { type: 'story', likes: 10 } }, (res) => {
        const notNever: NotNever<typeof res> = true;
        const inferenceCheck: Ok<Story> = res;
        return `<div>story with ${res.data.likes} likes</div>`;
      })
      .with({ type: 'error' }, (res) => {
        const notNever: NotNever<typeof res> = true;
        const inferenceCheck: ResError<Error> = res;
        return '<p>Oups! An error occured</p>';
      })
      .otherwise(() => '<p>everything else</p>');

    expect(ouput).toEqual('<img src="hello.com" />');
  });
});
