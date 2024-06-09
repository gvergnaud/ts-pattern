import { expect } from "@std/expect";
import type { Equal, Expect } from "../src/types/helpers.ts";
import { match, P } from "../mod.ts";
import type { Option } from "./types-catalog/utils.ts";

Deno.test("should match discriminated unions", () => {
  const val: Option<string> = {
    kind: "some",
    value: "hello",
  };

  const res = match(val as Option<string>)
    .with({ kind: "some" }, (o) => {
      type t = Expect<Equal<typeof o, { kind: "some"; value: string }>>;
      return o.value;
    })
    .with({ kind: "none" }, () => "no value")
    .exhaustive();

  type t = Expect<Equal<typeof res, string>>;

  expect(res).toEqual("hello");
});

Deno.test("should discriminate union types correctly 2", () => {
  type Post = {
    type: "post";
    id: number;
    content: { body: string };
  };
  type Video = { type: "video"; id: number; content: { src: string } };
  type Image = { type: "image"; id: number; content: { src: number } };

  type Input = Post | Video | Image;

  const res = match<Input>({
    type: "post",
    id: 2,
    content: { body: "yo" },
  })
    .with({ type: "post", id: 7 }, (x) => {
      type t = Expect<
        Equal<
          typeof x,
          {
            content: {
              body: string;
            };
            type: "post";
            id: 7;
          }
        >
      >;
      return 1;
    })
    .with({ type: "post", content: P._ }, (x) => {
      type t = Expect<Equal<typeof x, Post>>;
      return 1;
    })
    .with({ type: "video", content: { src: P.string } }, (x) => {
      type t = Expect<Equal<typeof x, Video>>;
      return 2;
    })
    .with({ type: "image" }, (x) => {
      type t = Expect<Equal<typeof x, Image>>;
      return 3;
    })
    .exhaustive();

  expect(res).toEqual(1);
});

Deno.test("should discriminate union types correctly 3", () => {
  type Text = { type: "text"; content: string };
  type Img = { type: "img"; src: string };
  type Video = { type: "video"; src: string };
  type Story = {
    type: "story";
    likes: number;
    views: number;
    author: string;
    src: string;
  };
  type Data = Text | Img | Video | Story;

  type Ok<T> = { type: "ok"; data: T };
  type ResError<T> = { type: "error"; error: T };

  type Result<TError, TOk> = Ok<TOk> | ResError<TError>;

  const result = {
    type: "ok",
    data: { type: "img", src: "hello.com" },
  } as Result<Error, Data>;

  const ouput = match(result)
    .with({ type: "ok", data: { type: "text" } }, (res) => {
      type t = Expect<Equal<typeof res, Ok<Text>>>;
      return `<p>${res.data.content}</p>`;
    })
    .with({ type: "ok", data: { type: "img" } }, (res) => {
      type t = Expect<Equal<typeof res, Ok<Img>>>;
      return `<img src="${res.data.src}" />`;
    })
    .with({ type: "ok", data: { type: "story", likes: 10 } }, (res) => {
      type t = Expect<
        Equal<
          typeof res,
          {
            type: "ok";
            data: {
              author: string;
              src: string;
              views: number;
              type: "story";
              likes: 10;
            };
          }
        >
      >;
      return `<div>story with ${res.data.likes} likes</div>`;
    })
    .with({ type: "error" }, (res) => {
      type t = Expect<Equal<typeof res, ResError<Error>>>;
      return "<p>Oups! An error occured</p>";
    })
    .otherwise(() => "<p>everything else</p>");

  expect(ouput).toEqual('<img src="hello.com" />');
});

Deno.test("Issue #41 — should be possible to pattern match on error objects", () => {
  type ServerError = Error & {
    response: Response;
    result: Record<string, any>;
    statusCode: number;
  };

  type ServerParseError = Error & {
    response: Response;
    statusCode: number;
    bodyText: string;
  };

  type Input = Error | ServerError | ServerParseError | undefined;

  const networkError = new Error() as Input;

  const message = match(networkError)
    .with(
      { statusCode: 401, name: P.string, message: P.string },
      (x) => "Not Authenticated",
    )
    .with(
      { statusCode: 403, name: "", message: "" },
      (x) => "Permission Denied",
    )
    .otherwise(() => "Network Error");

  expect(message).toBe("Network Error");
});
