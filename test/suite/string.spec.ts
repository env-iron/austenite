import { initialize, string } from "../../src";
import { hasType } from "../helpers";

describe("String variables", () => {
  let env: typeof process.env;

  beforeEach(() => {
    env = process.env;
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  describe("when the variable is required", () => {
    describe("when the value is not empty", () => {
      describe(".value()", () => {
        it.each`
          name                    | value
          ${"AUSTENITE_STRING_A"} | ${"value-a"}
          ${"AUSTENITE_STRING_B"} | ${"value-b"}
        `(
          "returns the value ($name)",
          ({ name, value }: { name: string; value: string }) => {
            const variable = string(name, "description-a", { required: true });

            process.env[name] = value;
            initialize();

            expect(variable.value()).toBe(value);
          }
        );

        it("returns a string value", () => {
          const variable = string("AUSTENITE_STRING_A", "description-a", {
            required: true,
          });

          expect(hasType<string>(variable.value())).toBeNull();
        });
      });
    });

    describe("when the value not empty", () => {
      describe("when there is a default value", () => {
        describe(".value()", () => {
          it.each`
            name                    | default
            ${"AUSTENITE_STRING_A"} | ${"value-a"}
            ${"AUSTENITE_STRING_B"} | ${"value-b"}
          `(
            "returns the default ($name)",
            ({ name, default: d }: { name: string; default: string }) => {
              const variable = string(name, "description-a", {
                required: true,
                default: d,
              });

              initialize();

              expect(variable.value()).toBe(d);
            }
          );

          it("returns a string value", () => {
            const variable = string("AUSTENITE_STRING_A", "description-a", {
              required: true,
              default: "value-a",
            });

            expect(hasType<string>(variable.value())).toBeNull();
          });
        });
      });
    });
  });
});
