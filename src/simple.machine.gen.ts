/** This file is generated! */

import { Machine } from "xstate";

export const schema = (
{
  "context": {},
  "initial": "1",
  "states": {
    "1": {
      "id": "1",
      "states": {
        "11": {
          "id": "11",
          "entry": "onEntry",
          "on": {
            "NEXT": "12",
            "OUTER": "#1"
          }
        },
        "12": {
          "id": "12",
          "entry": "onEntry",
          "on": {
            "PREV": "12",
            "NEXT": "13",
            "OUTER": "#1"
          }
        },
        "13": {
          "id": "13",
          "states": {
            "131": {
              "id": "131",
              "entry": "onEntry",
              "on": {
                "NEXT": "132",
                "OUTER": "#13"
              }
            },
            "132": {
              "id": "132",
              "entry": "onEntry",
              "on": {
                "PREV": "131",
                "OUTER": "#13"
              }
            }
          },
          "entry": "onEntry",
          "on": {
            "PREV": "12",
            "INNER": ".131",
            "OUTER": "#1"
          }
        }
      },
      "entry": "onEntry",
      "on": {
        "NEXT": "2",
        "INNER": ".11"
      }
    },
    "2": {
      "id": "2",
      "states": {
        "21": {
          "id": "21",
          "states": {
            "211": {
              "id": "211",
              "entry": "onEntry",
              "on": {
                "OUTER": "#21"
              }
            }
          },
          "entry": "onEntry",
          "on": {
            "OUTER": "#2",
            "INNER": ".211"
          }
        }
      },
      "entry": "onEntry",
      "on": {
        "PREV": "1",
        "INNER": ".21"
      }
    }
  }
}
);

export type Options = {
  actions: {
    onEntry: any
  };
};

export const createMachine = (options: Options) => Machine(schema, options);

export type Paths = 
    | ["1"]
    | ["1,11"]
    | ["1,12"]
    | ["1,13"]
    | ["1,13,131"]
    | ["1,13,132"]
    | ["2"]
    | ["2,21"]
    | ["2,21,211"]
;

export type EventType = 
    | "NEXT"
    | "INNER"
    | "OUTER"
    | "PREV"
;

export const eventList: EventType[] = [
  "NEXT",
  "INNER",
  "OUTER",
  "PREV"
];

export const state2EventMap = {
  "1": [
    "NEXT",
    "INNER"
  ],
  "2": [
    "PREV",
    "INNER"
  ],
  "1,11": [
    "NEXT",
    "OUTER"
  ],
  "1,12": [
    "PREV",
    "NEXT",
    "OUTER"
  ],
  "1,13": [
    "PREV",
    "INNER",
    "OUTER"
  ],
  "1,13,131": [
    "NEXT",
    "OUTER"
  ],
  "1,13,132": [
    "PREV",
    "OUTER"
  ],
  "2,21": [
    "OUTER",
    "INNER"
  ],
  "2,21,211": [
    "OUTER"
  ]
}

export const hasEvent = (event: EventType, path: Paths): boolean => 
    // @ts-ignore 
    state2EventMap[path.join(",")].includes(event);

export const matches = (path: Paths, state: any): boolean => 
    state.matches(path.join("."));