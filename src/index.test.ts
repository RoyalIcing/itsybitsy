import { where, itsy, bitsy } from "./index";

const numbers = [0, 1, 2, 3, 4, 5];

describe("itsy()", () => {
  function* count(_item: unknown, accum: number) {
    return accum + 1;
  }

  function* sum(item: number, accum: number) {
    return accum + item;
  }

  function* whereEven(item: number) {
    if (item % 2 === 0) yield item;
  }

  function* add1(item: number) {
    yield item + 1;
  }

  function* add2(item: number) {
    yield item + 2;
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

  it("can count", () => {
    const total = itsy(numbers, count, 0).getResult();
    expect(total).toBe(6);
  });

  it("uses initial value", async () => {
    const total = itsy(numbers, count, 100).getResult();
    // const total = await itsy(numbers, count, 100);
    expect(total).toBe(106);
  });

  it("can sum", () => {
    const sumTotal = itsy(numbers, sum, 0).getResult();
    expect(sumTotal).toBe(1 + 2 + 3 + 4 + 5);
  });

  it("can filter", () => {
    const evenNumbers = Array.from(itsy(numbers, whereEven));
    expect(evenNumbers).toEqual([0, 2, 4]);
  });

  it("can map", () => {
    const strings = Array.from(itsy(numbers, toString));
    expect(strings).toEqual(["0", "1", "2", "3", "4", "5"]);
  });

  it("can flat map", () => {
    const strings = Array.from(itsy(numbers, repeatEvens));
    expect(strings).toEqual([0, 0, 1, 2, 2, 3, 4, 4, 5]);
  });

  it("can combine transformations", () => {
    const strings = Array.from(
      itsy(itsy(itsy(numbers, repeatEvens), whereEven), toString)
    );
    expect(strings).toEqual(["0", "0", "2", "2", "4", "4"]);
  });

  describe("where()", () => {
    it("can filter", () => {
      const evenNumbers = Array.from(
        itsy(
          numbers,
          where((n) => n % 2 === 0)
        )
      );
      expect(evenNumbers).toEqual([0, 2, 4]);
    });
  });

  describe("bitsy()", () => {
    it("can count", () => {
      const total = bitsy(count, 0).result(numbers);
      expect(total).toBe(6);
    });

    it("uses initial value", () => {
      const total = bitsy(count, 100).result(numbers);
      expect(total).toBe(106);
    });

    it("can sum", () => {
      const sumTotal = bitsy(sum, 0).result(numbers);
      expect(sumTotal).toBe(1 + 2 + 3 + 4 + 5);
    });

    it("can filter", () => {
      const evenNumbers = Array.from(bitsy(whereEven).iterate(numbers));
      expect(evenNumbers).toEqual([0, 2, 4]);
    });

    it("can filter using where()", () => {
      const evenNumbers = Array.from(
        bitsy(where((n: number) => n % 2 === 0)).iterate(numbers)
      );
      expect(evenNumbers).toEqual([0, 2, 4]);
    });

    it("can combine transformations [a]", () => {
      const i1 = bitsy(repeatEvens);
      const i2 = bitsy(whereEven);
      const i3 = bitsy(toString);

      const strings = Array.from(i3.iterate(i2.iterate(i1.iterate(numbers))));
      expect(strings).toEqual(["0", "0", "2", "2", "4", "4"]);
    });

    it("can combine transformations [b]", () => {
      const strings = Array.from(
        bitsy(toString).iterate(
          bitsy(whereEven).iterate(bitsy(repeatEvens).iterate(numbers))
        )
      );
      expect(strings).toEqual(["0", "0", "2", "2", "4", "4"]);
    });

    it("can combine transformations with then [a]", () => {
      const strings = Array.from(
        bitsy(repeatEvens)
          .then(where((n) => n % 2 === 0))
          .then(toString)
          .iterate(numbers)
      );
      expect(strings).toEqual(["0", "0", "2", "2", "4", "4"]);
    });

    it("can combine transformations with then [b]", () => {
      const strings = Array.from(
        bitsy(add1).then(repeatEvens).then(toString).iterate(numbers)
      );
      expect(strings).toEqual(["1", "2", "2", "3", "4", "4", "5", "6", "6"]);
    });

    it("can combine transformations with then [c]", () => {
      const strings = Array.from(
        bitsy(repeatEvens).then(add1).then(toString).iterate(numbers)
      );
      expect(strings).toEqual(["1", "1", "2", "3", "3", "4", "5", "5", "6"]);
    });
    
    it("can combine transformations with then [d]", () => {
      expect(bitsy(whereEven).then(sum, 0).result(numbers)).toEqual(6);
    });

    it("can combine transformations with then [3]", () => {
      expect(bitsy(whereEven).then(count, 0).result(numbers)).toEqual(3);
    });

    it("can reuse for reducing", () => {
      const counter = bitsy(function* (_item: unknown, accum: number) {
        return accum + 1;
      }, 0);
      expect(counter.result([])).toEqual(0);
      expect(counter.result(["a", "b", "c"])).toEqual(3);
      expect(counter.result(["a", "b", "c", "d", "e"])).toEqual(5);
    });

    it("can reuse for mapping", () => {
      const toString = bitsy(function* (item: number | RegExp) {
        yield item.toString();
      });
      expect(Array.from(toString.iterate([]))).toEqual([]);
      expect(Array.from(toString.iterate([1, 2, 3]))).toEqual(["1", "2", "3"]);
      expect(Array.from(toString.iterate([/a/, /b/, /c/]))).toEqual(["/a/", "/b/", "/c/"]);
    });
  });
});
