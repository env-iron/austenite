import { boolean, initialize, string } from "../../src";
import { Declaration, DeclarationOptions } from "../../src/declaration";
import { reset } from "../../src/environment";
import { Results } from "../../src/validation";
import { createMockConsole, MockConsole } from "../helpers";

type DeclarationFactory = (
  options?: DeclarationOptions<unknown>
) => Declaration<unknown, DeclarationOptions<unknown>>;

const booleanFactory = boolean.bind(null, "AUSTENITE_VAR", "<description>");
const stringFactory = string.bind(null, "AUSTENITE_VAR", "<description>");

describe("initialize()", () => {
  let exitCode: number | undefined;
  let env: typeof process.env;
  let mockConsole: MockConsole;

  beforeEach(() => {
    exitCode = undefined;

    jest.spyOn(process, "exit").mockImplementation((code) => {
      exitCode = code ?? 0;

      return undefined as never;
    });

    env = process.env;
    process.env = { ...env };

    mockConsole = createMockConsole();
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = env;
    reset();
  });

  describe("when the environment is valid", () => {
    describe("before being called", () => {
      it.each`
        type         | factory
        ${"boolean"} | ${booleanFactory}
        ${"string"}  | ${stringFactory}
      `(
        "prevents access to $type values",
        ({ factory }: { factory: DeclarationFactory }) => {
          const declaration = factory({
            default: undefined,
          });

          expect(() => {
            declaration.value();
          }).toThrow(
            "AUSTENITE_VAR can not be read until the environment is initialized."
          );
        }
      );
    });

    describe("after being called", () => {
      let declaration: Declaration<string, DeclarationOptions<string>>;

      beforeEach(() => {
        declaration = string("AUSTENITE_VAR", "<description>", {
          default: undefined,
        });

        initialize();
      });

      it("allows access to values", () => {
        expect(() => {
          declaration.value();
        }).not.toThrow();
      });

      it.each`
        type         | factory
        ${"boolean"} | ${booleanFactory}
        ${"string"}  | ${stringFactory}
      `(
        "prevents additional $type declarations",
        ({ factory }: { factory: DeclarationFactory }) => {
          expect(() => {
            factory();
          }).toThrow(
            "AUSTENITE_VAR can not be defined after the environment is initialized."
          );
        }
      );

      describe("when called again", () => {
        it("does nothing", () => {
          expect(() => {
            initialize();
          }).not.toThrow();
        });
      });
    });
  });

  describe("when the environment is invalid", () => {
    describe("before being called", () => {
      it.each`
        type         | factory
        ${"boolean"} | ${booleanFactory}
        ${"string"}  | ${stringFactory}
      `(
        "prevents access to $type values",
        ({ factory }: { factory: DeclarationFactory }) => {
          const declaration = factory();

          expect(() => {
            declaration.value();
          }).toThrow(
            "AUSTENITE_VAR can not be read until the environment is initialized."
          );
        }
      );
    });

    describe("when called", () => {
      beforeEach(() => {
        string("AUSTENITE_STRING", "example string");
        boolean("AUSTENITE_BOOLEAN", "example boolean");

        initialize();
      });

      it("outputs a summary table", () => {
        const actual = mockConsole.readStderr();

        expect(actual).toContain("AUSTENITE_BOOLEAN");
        expect(actual).toContain("AUSTENITE_STRING");
      });

      it("exits the process with a non-zero exit code", () => {
        expect(exitCode).toBeDefined();
        expect(exitCode).toBeGreaterThan(0);
      });
    });

    describe("when a custom invalid environment handler is specified", () => {
      let results: Results | undefined;
      let defaultHandler: () => unknown;

      beforeEach(() => {
        process.env.AUSTENITE_BOOLEAN = "true";

        string("AUSTENITE_STRING", "example string");
        boolean("AUSTENITE_BOOLEAN", "example boolean");

        results = undefined;

        initialize({
          onInvalid(args) {
            results = args.results;
            defaultHandler = args.defaultHandler;
          },
        });
      });

      it("prevents outputting the summary table", () => {
        expect(mockConsole.readStderr()).toBe("");
      });

      it("prevents exiting the process", () => {
        expect(exitCode).toBeUndefined();
      });

      it("provides a result set", () => {
        expect(results).toMatchObject([
          {
            variable: {
              spec: {
                name: "AUSTENITE_BOOLEAN",
              },
            },
            result: {
              maybe: {
                isDefined: true,
                value: {
                  native: true,
                  verbatim: "true",
                  isDefault: false,
                },
              },
            },
          },
          {
            variable: {
              spec: {
                name: "AUSTENITE_STRING",
              },
            },
            result: {
              error: new Error("undefined"),
            },
          },
        ]);
      });

      it("provides a default handler function", () => {
        expect(typeof defaultHandler).toBe("function");
      });

      describe("when the default handler is called", () => {
        beforeEach(() => {
          defaultHandler();
        });

        it("outputs a summary table", () => {
          const actual = mockConsole.readStderr();

          expect(actual).toContain("AUSTENITE_BOOLEAN");
          expect(actual).toContain("AUSTENITE_STRING");
        });

        it("exits the process with a non-zero exit code", () => {
          expect(exitCode).toBeDefined();
          expect(exitCode).toBeGreaterThan(0);
        });
      });
    });
  });
});
