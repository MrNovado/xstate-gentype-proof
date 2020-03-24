const { Machine, assign, interpret } = require("xstate");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

/**
 * A machine for generating a simple machine module
 * - with a strict creator (tips you on what options you have avaliable)
 * - with exhaustive matching-tool helper
 * - with a strict event 2 state matching tool
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
        context: { schemaJson: null, moduleParts: [] },
        initial: "parsingSchema",
        states: {
            parsingSchema: {
                invoke: {
                    src: "parseSchemaFile",
                    onDone: {
                        target: "generatingMachineModule",
                        actions: "saveSchema",
                    },
                    onError: { target: "#finallizing", actions: "logError" },
                },
            },
            generatingMachineModule: {
                context: { patterns: [], event2State: null },
                initial: "generatingStateCombinations",
                states: {
                    generatingStateCombinations: {
                        invoke: {
                            src: "generateStateCombinations",
                            onDone: {
                                target: "generatingEvent2StateMap",
                                actions: "saveCombos",
                            },
                            onError: {
                                target: "#finallizing",
                                actions: "logError",
                            },
                        },
                    },
                    generatingEvent2StateMap: {
                        invoke: {
                            src: "generateEvent2StateMap",
                            onDone: {
                                target: "generatingModuleParts",
                                actions: "saveEvents",
                            },
                            onError: {
                                target: "#finallizing",
                                actions: "logError",
                            },
                        },
                    },
                    generatingModuleParts: {
                        invoke: {
                            src: "generateMachineModule",
                            onDone: {
                                target: "#writingMachineModule",
                                actions: "saveModule",
                            },
                            onError: {
                                target: "#finallizing",
                                actions: "logError",
                            },
                        },
                    },
                },
            },
            writingMachineModule: {
                id: "writingMachineModule",
                invoke: {
                    src: "writeMachineModule",
                    onDone: "#finallizing",
                    onError: { target: "#finallizing", actions: "logError" },
                },
            },
            finallizing: { id: "finallizing", type: "final" },
        },
    },
    {
        actions: {
            saveSchema: assign({ schemaJson: (_, event) => event.data }),
            saveCombos: assign({ patterns: (_, event) => event.data }),
            saveEvents: assign({ event2State: (_, event) => event.data }),
            saveModule: assign({ moduleParts: (_, event) => event.data }),
            logError: (_, event) => console.error(event),
        },
        services: {
            parseSchemaFile: () =>
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
            generateEvent2StateMap: ({ schemaJson, patterns }) =>
                new Promise((resolve, reject) => {
                    resolve();
                }),
            generateMachineModule: ({ schemaJson, patterns, event2State }) =>
                new Promise((resolve, reject) => {
                    // prettier-ignore
                    try {
                        const header = `/** This file is generated! */`;
                        const imports = `import { Machine } from "xstate";`;
                        const schemaString = JSON.stringify(schemaJson, null, 2);
                        const schema = `export const schema = (\n${schemaString}\n);`;
                        const machine = `export const createMachine = (options: any) => Machine(schema, options);`;
                        const patternsString = patterns.map(p => `    | ["${p.join(",")}"]\n`).join("");
                        const patternsType = `type Patterns = \n${patternsString};`;
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
