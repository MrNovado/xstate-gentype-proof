const { Machine, assign, interpret } = require("xstate");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

/**
 * Machine for generating simple machine moduleParts
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
 * export const schema = { ... };
 * 
 * export const createMachine = 
 *  (options: {actions, services, activities, guards, ...}) => 
 *      Machine(schema, options);
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
        context: { schemaJson: null, patterns: [], moduleParts: [] },
        initial: "parsingSchema",
        states: {
            parsingSchema: {
                invoke: {
                    src: "parseSchema",
                    onDone: {
                        target: "generatingStateCombinations",
                        actions: "saveSchema",
                    },
                    onError: { target: "finallizing", actions: "logError" },
                },
            },
            generatingStateCombinations: {
                invoke: {
                    src: "generateStateCombinations",
                    onDone: {
                        target: "generatingMachineModule",
                        actions: "saveCombos",
                    },
                    onError: { target: "finallizing", actions: "logError" },
                },
            },
            generatingMachineModule: {
                invoke: {
                    src: "generateMachineModule",
                    onDone: {
                        target: "writingMachineModule",
                        actions: "saveModule",
                    },
                    onError: { target: "finallizing", actions: "logError" },
                },
            },
            writingMachineModule: {
                invoke: {
                    src: "writeMachineModule",
                    onDone: "finallizing",
                    onError: { target: "finallizing", actions: "logError" },
                },
            },
            finallizing: { type: "final" },
        },
    },
    {
        actions: {
            saveSchema: assign({ schemaJson: (_, event) => event.data }),
            saveCombos: assign({ patterns: (_, event) => event.data }),
            saveModule: assign({ moduleParts: (_, event) => event.data }),
            logError: (_, event) => console.error(event),
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
            generateMachineModule: ({ schemaJson, patterns }) =>
                new Promise((resolve, reject) => {
                    try {
                        const header = `/** This file is generated! */`;
                        const imports = `import { Machine } from "xstate";`;
                        const schema = `export const schema = (\n${JSON.stringify(schemaJson, null, 2)}\n);`;
                        const machine = `export const createMachine = (options: any) => Machine(schema, options);`;
                        const patternsType = `type Patterns = \n${patterns.map(p => `    | ["${p.join(",")}"]\n`).join("")};`;
                        const matches = `export const matches = (pattern: Patterns, state: any): boolean => \n    state.matches(pattern.join("."));`;

                        resolve([
                            header,
                            imports,
                            schema,
                            machine,
                            patternsType,
                            matches,
                        ]);
                    } catch (e) {
                        reject(e);
                    }
                }),
            writeMachineModule: ({ moduleParts }) =>
                new Promise((resolve, reject) => {
                    try {
                        const into = path.resolve(
                            __dirname,
                            "../src/simple.machine.gen.ts",
                        );
                        writeFileSync(into, moduleParts.join("\n\n"));
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }),
        },
    },
);

/**
 * Machine execution
 */
interpret(simpleGentypeMachine)
    .onTransition(({ value }) => console.log(value))
    .start();
