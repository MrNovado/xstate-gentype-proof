const { Machine, assign, interpret } = require("xstate");
const path = require("path");
const fs = require("fs");

const simpleGentypeMachine = Machine(
    {
        context: { schemaJson: null },
        initial: "parsingSchema",
        states: {
            parsingSchema: {
                on: {
                    "": {
                        target: "generatingStateCombinations",
                        actions: "parseSchema",
                    },
                },
            },
            generatingStateCombinations: {
                on: {
                    "": {
                        target: "generatingMachineModule",
                        actions: "generateStateCombinations",
                    },
                },
            },
            generatingMachineModule: {
                on: {
                    "": {
                        target: "finallizing",
                        actions: "generateMachineModule",
                    },
                },
            },
            finallizing: { type: "final" },
        },
    },
    {
        actions: {
            parseSchema: assign({
                schemaJson: () => {
                    const simpleSchemaPath = path.resolve(
                        __dirname,
                        "simple.schema.json",
                    );
                    const simpleSchemaBuffer = fs.readFileSync(
                        simpleSchemaPath,
                    );
                    const simpleSchema = JSON.parse(simpleSchemaBuffer);

                    {
                        /**
                         * Checking the schema string
                         */
                        const schemaString = JSON.stringify(
                            simpleSchema,
                            null,
                            2,
                        );
                        console.log(schemaString);
                    }

                    return simpleSchema;
                },
            }),
            generateStateCombinations: () => {},
            generateMachineModule: () => {},
        },
    },
);

interpret(simpleGentypeMachine)
    .onTransition(({ value }) => console.log(value))
    .start();
