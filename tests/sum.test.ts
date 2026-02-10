import { describe, it, expect } from "vitest";
import { calculateSum, validateSumInput } from "../src/index.js";

describe("calculateSum", () => {
  describe("basic summation", () => {
    it("sums positive integers", () => {
      expect(calculateSum([1, 2, 3], 2)).toBe("6.00");
    });

    it("sums positive decimals", () => {
      expect(calculateSum([1.5, 2.5, 3.0], 2)).toBe("7.00");
    });

    it("sums negative numbers", () => {
      expect(calculateSum([-1, -2, -3], 2)).toBe("-6.00");
    });

    it("sums mixed positive and negative numbers", () => {
      expect(calculateSum([10.5, -3.25, 7.75, -5.0], 2)).toBe("10.00");
    });

    it("handles a single value", () => {
      expect(calculateSum([42.123], 2)).toBe("42.12");
    });

    it("handles an empty array", () => {
      expect(calculateSum([], 2)).toBe("0.00");
    });

    it("handles all zeros", () => {
      expect(calculateSum([0, 0, 0], 2)).toBe("0.00");
    });

    it("sums to zero with cancelling values", () => {
      expect(calculateSum([5.5, -5.5], 2)).toBe("0.00");
    });
  });

  describe("decimal place rounding", () => {
    it("rounds to 0 decimal places", () => {
      expect(calculateSum([1.7, 2.3], 0)).toBe("4");
    });

    it("rounds to 1 decimal place", () => {
      expect(calculateSum([1.23, 2.34], 1)).toBe("3.6");
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateSum([1.234, 2.345], 2)).toBe("3.58");
    });

    it("rounds to 4 decimal places", () => {
      expect(calculateSum([3.89283829, -539.38390293], 4)).toBe("-535.4911");
    });

    it("rounds to 6 decimal places", () => {
      expect(calculateSum([1.1234567, 2.7654321], 6)).toBe("3.888889");
    });

    it("pads with trailing zeros when needed", () => {
      expect(calculateSum([1, 2], 4)).toBe("3.0000");
    });
  });

  describe("round half away from zero (Excel ROUND behaviour)", () => {
    it("rounds 0.5 up for positive numbers", () => {
      expect(calculateSum([2.125], 2)).toBe("2.13");
    });

    it("rounds 0.5 away from zero for negative numbers", () => {
      expect(calculateSum([-2.125], 2)).toBe("-2.13");
    });

    it("rounds 0.5 up at ones place", () => {
      expect(calculateSum([2.5], 0)).toBe("3");
    });

    it("rounds -0.5 away from zero at ones place", () => {
      expect(calculateSum([-2.5], 0)).toBe("-3");
    });

    it("rounds 0.5 correctly at various decimal places", () => {
      expect(calculateSum([1.0005], 3)).toBe("1.001");
      expect(calculateSum([-1.0005], 3)).toBe("-1.001");
    });

    it("does not round when below midpoint", () => {
      expect(calculateSum([2.124], 2)).toBe("2.12");
      expect(calculateSum([-2.124], 2)).toBe("-2.12");
    });

    it("rounds up when above midpoint", () => {
      expect(calculateSum([2.126], 2)).toBe("2.13");
      expect(calculateSum([-2.126], 2)).toBe("-2.13");
    });
  });

  describe("floating-point precision", () => {
    it("handles 0.1 + 0.2 correctly", () => {
      expect(calculateSum([0.1, 0.2], 2)).toBe("0.30");
    });

    it("handles many small decimals without accumulation errors", () => {
      const values = Array(10).fill(0.1);
      expect(calculateSum(values, 2)).toBe("1.00");
    });

    it("handles large numbers", () => {
      expect(calculateSum([999999.99, 0.01], 2)).toBe("1000000.00");
    });

    it("handles very small numbers", () => {
      expect(calculateSum([0.0001, 0.0002, 0.0003], 4)).toBe("0.0006");
    });
  });

  describe("user-specified examples", () => {
    it("sums the values from the spec example", () => {
      const values = [1.0, -2.5, 3.89283829, -539.38390293];
      expect(calculateSum(values, 2)).toBe("-536.99");
      expect(calculateSum(values, 4)).toBe("-536.9911");
    });
  });
});

describe("validateSumInput", () => {
  describe("valid inputs", () => {
    it("accepts valid values and decimalPlaces", () => {
      const result = validateSumInput({ values: [1, 2, 3], decimalPlaces: 2 });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.input.values).toEqual([1, 2, 3]);
        expect(result.input.decimalPlaces).toBe(2);
      }
    });

    it("accepts an empty values array", () => {
      const result = validateSumInput({ values: [], decimalPlaces: 0 });
      expect(result.valid).toBe(true);
    });

    it("accepts negative numbers", () => {
      const result = validateSumInput({
        values: [-1.5, -2.5],
        decimalPlaces: 2,
      });
      expect(result.valid).toBe(true);
    });

    it("accepts zero decimal places", () => {
      const result = validateSumInput({ values: [1], decimalPlaces: 0 });
      expect(result.valid).toBe(true);
    });
  });

  describe("invalid values", () => {
    it("rejects non-array values", () => {
      const result = validateSumInput({ values: "not-array", decimalPlaces: 2 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("must be an array");
      }
    });

    it("rejects values containing non-numbers", () => {
      const result = validateSumInput({
        values: [1, "two", 3],
        decimalPlaces: 2,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("values[1]");
      }
    });

    it("rejects NaN in values", () => {
      const result = validateSumInput({
        values: [1, NaN],
        decimalPlaces: 2,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("values[1]");
      }
    });

    it("rejects Infinity in values", () => {
      const result = validateSumInput({
        values: [Infinity],
        decimalPlaces: 2,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("values[0]");
      }
    });
  });

  describe("invalid decimalPlaces", () => {
    it("rejects non-number decimalPlaces", () => {
      const result = validateSumInput({
        values: [1],
        decimalPlaces: "two" as unknown,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("decimalPlaces");
      }
    });

    it("rejects negative decimalPlaces", () => {
      const result = validateSumInput({ values: [1], decimalPlaces: -1 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("decimalPlaces");
      }
    });

    it("rejects non-integer decimalPlaces", () => {
      const result = validateSumInput({ values: [1], decimalPlaces: 2.5 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("decimalPlaces");
      }
    });
  });
});
