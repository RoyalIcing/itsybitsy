<div align="center">
  <h1>🕷🕸 itsybitsy</h1>
  <p>Map, filter, flat map, reduce — all with the one function</p>
  <a href="https://bundlephobia.com/result?p=itsybitsy">
    <img src="https://badgen.net/bundlephobia/minzip/itsybitsy@0.1.0" alt="minified and gzipped size">
    <img src="https://badgen.net/bundlephobia/min/itsybitsy@0.1.0" alt="minified size">
    <img src="https://badgen.net/bundlephobia/dependency-count/itsybitsy@0.1.0" alt="zero dependencies">
  </a>
</div>

## Install

```console
npm add itsybitsy
```

## Examples

### Map

```ts
import { bitsy } from "itsybitsy";

function* toString(n: number) {
  yield n.toString();
}

const numbers = [1, 2, 3];
const strings = [...bitsy(toString).iterate(numbers)];
// ["1", "2", "3"]
```

### Filter

```ts
import { bitsy } from "itsybitsy";

function* whereEven(item: number) {
  if (item % 2 === 0) yield item;
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = [...bitsy(whereEven).iterate(numbers)];
// [2, 4, 6]
```

### Reduce

```ts
import { bitsy } from "itsybitsy";

function* count(_item: unknown, accum: number) {
  return accum + 1;
}

function* sum(item: number, accum: number) {
  return accum + item;
}

const numbers = [1, 2, 3, 4, 5, 6];
const totalCount = bitsy(count, 0).result(numbers); // 6
const totalSum = bitsy(sum, 0).result(numbers); // 21
```

### Flat map

```ts
import { bitsy } from "itsybitsy";

function* repeatEvens(item: number) {
  if (item % 2 === 0) {
    yield item;
    yield item;
  } else {
    yield item;
  }
}

const numbers = [1, 2, 3, 4, 5, 6];
const withEvensRepeated = [...bitsy(repeatEvens).iterate(numbers)];
// [1, 2, 2, 3, 4, 4, 5, 6, 6]
```

### Compact

```ts
import { bitsy } from "itsybitsy";

function* compact<T>(item: T): Generator<Exclude<T, null | undefined | false>> {
  if (item == null || (typeof item === 'boolean' && item === false)) return;
  yield item as Exclude<T, null | undefined | false>;
}

const itemsWithFalsey = [0, 1, false, 2, true, 3, null, 4, undefined, 5];
const itemsWithoutFalsey = [...bitsy(compact).iterate(itemsWithFalsey)];
// [0, 1, 2, true, 3, 4, 5]
```

### Chunk into pairs

```ts
import { bitsy } from "itsybitsy";

function* chunk2(item: string | number, accum: undefined | unknown) {
  if (accum === undefined) {
    return item;
  } else {
    yield [accum, item];
    return;
  }
}

const pairsFlat = [
  "/",
  8,
  "/about",
  3,
  "/docs/api",
  2,
  "/pricing",
  1,
];
const pairs = [...bitsy(chunk2, undefined).iterate(pairsFlat)];
// [ ["/", 8], ["/about", 3], ["/docs/api", 2], ["/pricing", 1] ]
```

### Chaining with `.then`

```ts
import { bitsy } from "itsybitsy";

function* add1(item: number) {
  yield item + 1;
}

function* toString(item: number) {
  yield item.toString();
}

function* repeatEvens(item: number) {
  if (item % 2 === 0) {
    yield item;
    yield item;
  } else {
    yield item;
  }
}

const numbers = [1, 2, 3, 4, 5];
const strings = [...bitsy(add1).then(repeatEvens).then(toString).iterate(numbers)];
// ["2", "2", "3", "4", "4", "5", "6", "6"]
```

----

Alternative name: forte?

```ts
const strings = [...forte(addOne).then(toString).of(numbers)];

const totalCount = forte(count, 0).reduce(numbers);
```

----

Alternative API

```ts
bitsy({
  *0(n: number) {
    if (n % 2 === 0) yield n;
  },
  *1(n: number) {
    yield n.toString();
  },
  *2(s: string) {
    yield `#${s}`;
  }
}).iterate([1, 2, 3, 4, 5, 6]);
// ["#2", "#4", "#6"]
```
