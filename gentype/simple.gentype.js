const { Machine, assign, interpret } = require("xstate");
const { readFileSync } = require("fs");
const path = require("path");

/**
 * Machine for generating simple machine module
 * with exhaustive matching-tool helper
 *
 * GIVEN SCHEMA:
 * ===
 * ```json
 * {
 *  a: { ab: {}, ac: {}, ad: {} },
 *  b: { bc: {} },
 *  d: { dd: {} }
 * }
 * ```
 *
 * RESULTED MODULE:
 * ===
 * ```typescript
 * export const machine = ...;
 *
 * type ExhaustivePatterns = [a] | [a, ab] | [a, ac] | [a, ad] | [b] | [b, bc] | ...;
 *
 * export const matches
 *  = (pattern: ExhaustivePatterns, state)
 *  => state.matches(pattern.join("."));
 * ```
 */
const simpleGentypeMachine = Machine(
    {
        context: { schemaJson: null },
        initial: "parsingSchema",
        states: {
            parsingSchema: {
                invoke: {
                    src: "parseSchema",
                    onDone: {
                        target: "generatingStateCombinations",
                        actions: "contextifySchema",
                    },
                    onError: "finallizing",
                },
            },
            generatingStateCombinations: {
                invoke: {
                    src: "generateStateCombinations",
                    onDone: "generatingMachineModule",
                    onError: "finallizing",
                },
            },
            generatingMachineModule: {
                invoke: {
                    src: "generateMachineModule",
                    onDone: "finallizing",
                    onError: "finallizing",
                },
            },
            finallizing: { type: "final" },
        },
    },
    {
        actions: {
            contextifySchema: assign({ schemaJson: (_, event) => event.data }),
        },
        services: {
            parseSchema: () =>
                new Promise((resolve, reject) => {
                    const file = path.resolve(__dirname, "simple.schema.json");
                    try {
                        const buffer = readFileSync(file);
                        const schema = JSON.parse(buffer);
                        resolve(schema);
                    } catch (e) {
                        reject(e);
                    }
                }),
            generateStateCombinations: () => Promise.resolve(),
            generateMachineModule: () => Promise.resolve(),
        },
    },
);

/**
 * Machine execution
 */
interpret(simpleGentypeMachine)
    .onTransition(({ value }) => console.log(value))
    .start();