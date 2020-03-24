const { Machine, assign, interpret } = require("xstate");
const { readFileSync, writeFileSync } = require("fs");
const filePath = require("path");

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
 * type Paths = "a" | "a.ab" | "a.ac" | "a.ad" | "b" | "b.bc" | ...;
 *
 * const eventList = [...];
 * const state2EventMap = {...};
 *
 * export const matches
 *  = (state, path: Paths)
 *  => state.matches(path);
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
                context: {
                    paths: [],
                    state2Event: null,
                    events: [],
                    options: null,
                },
                initial: "generatingStateCombinations",
                states: {
                    generatingStateCombinations: {
                        invoke: {
                            src: "generateStateCombinations",
                            onDone: {
                                target: "generatingState2EventMap",
                                actions: "saveCombos",
                            },
                            onError: {
                                target: "#finallizing",
                                actions: "logError",
                            },
                        },
                    },
                    generatingState2EventMap: {
                        invoke: {
                            src: "generateEventTools",
                            onDone: {
                                target: "generatingMachineOptions",
                                actions: "saveEvents",
                            },
                            onError: {
                                target: "#finallizing",
                                actions: "logError",
                            },
                        },
                    },
                    generatingMachineOptions: {
                        invoke: {
                            src: "generateMachineOptions",
                            onDone: {
                                target: "generatingModuleParts",
                                actions: "saveOptions",
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
            saveCombos: assign({ paths: (_, event) => event.data }),
            saveEvents: assign({
                state2Event: (_, event) => event.data.state2Event,
                events: (_, event) => event.data.events,
            }),
            saveOptions: assign({ options: (_, event) => event.data }),
            saveModule: assign({ moduleParts: (_, event) => event.data }),
            logError: (_, event) => console.error(event),
        },
        services: {
            parseSchemaFile: () =>
                new Promise((resolve, reject) => {
                    const file = filePath.resolve(
                        __dirname,
                        "simple.schema.json",
                    );
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
            generateEventTools: ({ schemaJson, paths }) =>
                new Promise((resolve, reject) => {
                    // prettier-ignore
                    try {
                        let state2Event = {};
                        let events = [];
                        for (let path of paths) {
                            /**
                             * All path to all states are already saved into paths!
                             * Every path is a complete path to a specific state-branch.
                             * paths : => [[1],[1,11],[1,11,111],[1,11,112], ...]
                             */
                            const branch = path.reduce(
                                function intoAStateBranch(branch, state) {
                                    return (
                                        schemaJson.states[state] ||
                                        branch.states[state]
                                    );
                                },
                                {},
                            );
                            const pathString = path.join(".");
                            const branchEvents = (state2Event[pathString] = Object.keys(branch.on || {}));
                            events = events.concat(branchEvents);
                        }
                        resolve({ state2Event, events: Array.from(new Set(events)) });
                    } catch (e) {
                        reject(e);
                    }
                }),
            generateMachineOptions: ({ schemaJson, paths }) =>
                new Promise((resolve, reject) => {
                    /**
                     * Looking for entry props in stateNode configs
                     */
                    try {
                        let actions = new Set();
                        for (let path of paths) {
                            /**
                             * All path to all states are already saved into paths!
                             * Every path is a complete path to a specific state-branch.
                             * paths : => [[1],[1,11],[1,11,111],[1,11,112], ...]
                             */
                            const branch = path.reduce(
                                function intoAStateBranch(branch, state) {
                                    return (
                                        schemaJson.states[state] ||
                                        branch.states[state]
                                    );
                                },
                                {},
                            );

                            if (branch.entry) {
                                switch (typeof branch.entry) {
                                    case "string":
                                        actions.add(branch.entry);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        resolve({ actions: Array.from(actions) });
                    } catch (e) {
                        reject(e);
                    }
                }),
            generateMachineModule: ({
                schemaJson,
                paths,
                state2Event,
                events,
                options,
            }) =>
                new Promise((resolve, reject) => {
                    // prettier-ignore
                    try {
                        const header = `/** This file is generated! */`;
                        const imports = `import { Machine } from "xstate";`;
                        const schemaString = JSON.stringify(schemaJson, null, 2);
                        const schema = `export const schema = (\n${schemaString}\n);`;
                        const optionsType = `export type Options = {\n  actions: {\n    ${options.actions.map(a => `${a}: any`).join(";\n")}\n  };\n};`
                        const machine = `export const createMachine = (options: Options) => Machine(schema, options);`;
                        const pathsTypeString = paths.map(p => `    | "${p.join(".")}"\n`).join("");
                        const pathsType = `export type Paths = \n${pathsTypeString};`;
                        const eventType = `export type EventType = \n${events.map(e => `    | "${e}"\n`).join("")};`;
                        const eventEnum = `export enum EventEnum {\n${events.map(e => `  ${e} = "${e}"`).join(",\n")}\n};`;
                        const eventList = `export const eventList: EventType[] = ${JSON.stringify(events, null, 2)};`;
                        const eventMap = `export const state2EventMap = ${JSON.stringify(state2Event, null, 2)}`;
                        const hasEvent = `export const hasEvent = (event: EventType, path: Paths): boolean => \n    // @ts-ignore \n    state2EventMap[path].includes(event);`;
                        const matches = `export const matches = (state: any, path: Paths): boolean => \n    state.matches(path);`;

                        resolve([
                            header,
                            imports,
                            schema,
                            optionsType,
                            machine,
                            pathsType,
                            eventType,
                            eventEnum,
                            eventList,
                            eventMap,
                            hasEvent,
                            matches,
                        ]);
                    } catch (e) {
                        reject(e);
                    }
                }),
            writeMachineModule: ({ moduleParts }) =>
                new Promise((resolve, reject) => {
                    try {
                        const into = filePath.resolve(
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
