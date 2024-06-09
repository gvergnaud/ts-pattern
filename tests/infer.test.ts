import { P } from "../mod.ts";
import type { Equal, Expect } from "../src/types/helpers.ts";

Deno.test("should correctly narrow types of arrays containing tuples", () => {
  const QuizValue = P.union("initial", "correct", "incorrect");
  const QuizState = {
    answerEntries: P.array([P.string, QuizValue]),
    appendOnlyAnswerEntries: P.array([P.string, P.array(QuizValue)]),
  };

  type QuizValue = P.infer<typeof QuizValue>;
  type expected1 = "initial" | "correct" | "incorrect";
  type test1 = Expect<Equal<QuizValue, expected1>>;

  type QuizState = P.infer<typeof QuizState>;
  type expected2 = {
    answerEntries: [string, QuizValue][];
    appendOnlyAnswerEntries: [string, QuizValue[]][];
  };
  type test2 = Expect<Equal<QuizState, expected2>>;
});
