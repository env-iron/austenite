import { describe, expectTypeOf, it } from "vitest";
import { initialize, number } from "../../../src/index.js";
import { noop } from "../../helpers.js";

describe("Number declarations", () => {
  describe("when the declaration is required", () => {
    describe(".value()", () => {
      it("returns a number value", () => {
        const declaration = number("AUSTENITE_NUMBER", "<description>");

        process.env.AUSTENITE_NUMBER = "123.456";
        initialize({ onInvalid: noop });
        const actual = declaration.value();

        expectTypeOf(actual).toEqualTypeOf<number>();
      });
    });
  });

  describe("when the declaration is optional", () => {
    describe(".value()", () => {
      it("returns an optional number value", () => {
        const declaration = number("AUSTENITE_NUMBER", "<description>", {
          default: undefined,
        });

        initialize({ onInvalid: noop });
        const actual = declaration.value();

        expectTypeOf(actual).toEqualTypeOf<number | undefined>();
      });
    });
  });

  describe("when valid options are specified", () => {
    it("does not allow unknown options", () => {
      const declaration = number(
        "AUSTENITE_NUMBER",
        "<description>",
        // @ts-expect-error - unknown option
        {
          default: undefined,
          unknown: "unknown",
        },
      );

      expectTypeOf(declaration).toBeObject();
    });
  });
});
