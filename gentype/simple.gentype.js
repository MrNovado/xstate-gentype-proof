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
        context: { schemaJson: null, patterns: [] },
        initial: "parsingSchema",
        states: {
            parsingSchema: {
                invoke: {
                    src: "parseSchema",
                    onDone: {
                        target: "generatingStateCombinations",
                        actions: "saveSchema",
                    },
                    onError: "finallizing",
                },
            },
            generatingStateCombinations: {
                invoke: {
                    src: "generateStateCombinations",
                    onDone: {
                        target: "generatingMachineModule",
                        actions: "saveCombos",
                    },
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
            saveSchema: assign({ schemaJson: (_, event) => event.data }),
            saveCombos: assign({ patterns: (_, event) => event.data }),
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
            generateStateCombinations: ({ schemaJson }) =>
                new Promise((resolve, reject) => {
                    /**
                     * Recursive state parsing
                     * @param {*} states is a states object of a machine
                     */
                    function parse(states = {}) {
                        let res = [];
                        for (let branch in states) {
                            res.push([branch]);
                            const inner = parse(states[branch].states);
                            inner.forEach(b => res.push([branch, ...b]));
                        }
                        return res;
                    }

                    try {
                        const combinations = parse(schemaJson.states);
                        resolve(combinations);
                    } catch (e) {
                        reject(e);
                    }
                }),
            generateMachineModule: () => Promise.resolve(),
        },
    },
);

/**
 * Machine execution
 */
interpret(simpleGentypeMachine)
    .onTransition(({ value, context }) => console.log(value, context))
    .start();
