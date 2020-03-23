const { Machine, assign, interpret } = require("xstate");
const { readFileSync } = require("fs");
const path = require("path");

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

interpret(simpleGentypeMachine)
    .onTransition(({ value }) => console.log(value))
    .start();
