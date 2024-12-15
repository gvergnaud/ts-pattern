import { P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('P.infer', () => {
  describe('array', () => {
    it('should correctly narrow types of arrays containing tuples', () => {
      const QuizValue = P.union('initial', 'correct', 'incorrect');
      const QuizState = {
        answerEntries: P.array([P.string, QuizValue]),
        appendOnlyAnswerEntries: P.array([P.string, P.array(QuizValue)]),
      };

      type QuizValue = P.infer<typeof QuizValue>;
      type expected1 = 'initial' | 'correct' | 'incorrect';
      type test1 = Expect<Equal<QuizValue, expected1>>;

      type QuizState = P.infer<typeof QuizState>;
      type expected2 = {
        answerEntries: [string, QuizValue][];
        appendOnlyAnswerEntries: [string, QuizValue[]][];
      };
      type test2 = Expect<Equal<QuizState, expected2>>;
    });
  });

  it("P.infer shouldn't count as an inference point of the pattern", () => {
    const getValueOfType = <T extends P.Pattern<unknown>>(
      obj: unknown,
      path: string,
      pattern: T,
      defaultValue: P.infer<T>
    ): P.infer<T> => defaultValue;

    getValueOfType(
      null,
      'a.b.c',
      { x: P.string },
      // @ts-expect-error 👇 error should be here
      'oops'
    );
  });
});
