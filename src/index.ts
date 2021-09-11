function exhaustToResult<Value, Result>(
  generator: Generator<Value, Result>
): Result {
  while (true) {
    let inner = generator.next();
    if (inner.done) {
      return inner.value;
    }
  }
}

export function itsy<Input, Output>(
  iterable: Iterable<Input>,
  transform: (element: Input, accumulated: void) => Generator<Output, void>,
  initial?: void
): { getResult: () => void } & { [Symbol.iterator](): Generator<Output, void> };

export function itsy<Input, Output, Result>(
  iterable: Iterable<Input>,
  transform: (
    element: Input,
    accumulated: Result
  ) => Result extends void
    ? Generator<Output, void>
    : Generator<Output, Result>,
  initial: Result
): { getResult: () => Result } & {
  [Symbol.iterator](): Generator<Output, Result>;
};

export function itsy<Input, Output, Result>(
  iterable: Iterable<Input>,
  transform: (
    element: Input,
    accumulated: Result
  ) => Result extends void
    ? Generator<Output, void>
    : Generator<Output, Result>,
  initial: Result
): { getResult: () => Result } & {
  [Symbol.iterator](): Generator<Output, Result>;
} {
  function* iterator() {
    let current = initial;
    for (const element of iterable) {
      const innerIterable = transform(element, current);
      const innerIterator = innerIterable[Symbol.iterator]();
      inner: while (true) {
        let inner = innerIterator.next();
        if (inner.done) {
          current = inner.value as Result;
          break inner;
        } else {
          yield inner.value;
        }
      }
    }
    return current;
  }

  function getResult(): Result {
    return exhaustToResult(iterator());
  }

  return Object.freeze({ getResult, [Symbol.iterator]: iterator }) as any;
}

export function where<Element>(
  predicate: (element: Element) => boolean
): (item: Element) => Generator<Element, void, unknown> {
  return function* (item: Element) {
    if (predicate(item)) yield item;
  };
}

export interface BitsyIterate<Input, Output> {
  iterate(iterable: Iterable<Input>): Iterable<Output>;

  then<Next>(
    nextTransform: (
      element: Output,
      accumulated: void
    ) => Generator<Next, void>,
    nextInitial?: void
  ): Bitsy<Input, Next, void>;

  then<Next, NextResult>(
    nextTransform: (
      element: Output,
      accumulated: NextResult
    ) => Generator<Next, NextResult>,
    nextInitial: NextResult
  ): Bitsy<Input, Next, NextResult>;
}

export interface BitsyResult<Input, Output, Result> extends BitsyIterate<Input, Output> {
  result: (iterable: Iterable<Input>) => Result;
}

export type Bitsy<Input, Output, Result> = Result extends void
  ? BitsyIterate<Input, Output>
  : BitsyResult<Input, Output, Result>;

export function bitsy<Input, Output>(
  transform: (element: Input, accumulated: void) => Generator<Output, void>,
  initial?: void
): Bitsy<Input, Output, void>;

export function bitsy<Input, Output, Result>(
  transform: (
    element: Input,
    accumulated: Result
  ) => Result extends void
    ? Generator<Output, void>
    : Generator<Output, Result>,
  initial: Result
): Bitsy<Input, Output, Result>;

export function bitsy<Input, Output, Result>(
  transform: (
    element: Input,
    accumulated: Result
  ) => Result extends void
    ? Generator<Output, void>
    : Generator<Output, Result>,
  initial: Result
): Bitsy<Input, Output, Result> {
  return Object.freeze({
    iterate: (iterable: Iterable<Input>) => itsy(iterable, transform, initial),
    result: (iterable: Iterable<Input>) =>
      itsy(iterable, transform, initial).getResult(),
    then: <Next, NextResult>(
      nextTransform: (
        element: Output,
        accumulated: NextResult
      ) => Generator<Next, NextResult>,
      nextInitial: NextResult
    ) =>
      bitsy(
        function* (element: Input, accumulated: NextResult) {
          const inner = itsy([element], transform, undefined);
          return yield* itsy(inner, nextTransform as any, accumulated);
        } as any,
        nextInitial
      ),
  }) as unknown as Bitsy<Input, Output, Result>;
}
