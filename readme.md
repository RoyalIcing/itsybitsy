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