/** This file is generated! */

import { Machine } from "xstate";

export const schema = (
{
  "context": {},
  "initial": "1",
  "states": {
    "1": {
      "id": "1",
      "initial": "_1",
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
            "PREV": "11",
            "NEXT": "13",
            "OUTER": "#1"
          }
        },
        "13": {
          "id": "13",
          "initial": "_13",
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
            },
            "_13": {
              "id": "_13",
              "entry": "onEntry",
              "on": {
                "PREV": "#12",
                "INNER": "131",
                "OUTER": "#1"
              }
            }
          },
          "entry": "onEntry"
        },
        "_1": {
          "id": "_1",
          "entry": "onEntry",
          "on": {
            "NEXT": "#2",
            "INNER": "11"
          }
        }
      },
      "entry": "onEntry"
    },
    "2": {
      "id": "2",
      "initial": "_2",
      "states": {
        "21": {
          "id": "21",
          "initial": "_21",
          "states": {
            "211": {
              "id": "211",
              "entry": "onEntry",
              "on": {
                "OUTER": "#21"
              }
            },
            "_21": {
              "id": "_21",
              "entry": "onEntry",
              "on": {
                "OUTER": "#2",
                "INNER": "211"
              }
            }
          },
          "entry": "onEntry"
        },
        "_2": {
          "id": "_2",
          "entry": "onEntry",
          "on": {
            "PREV": "#1",
            "INNER": "21"
          }
        }
      },
      "entry": "onEntry"
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
    | ["1,13,_13"]
    | ["1,_1"]
    | ["2"]
    | ["2,21"]
    | ["2,21,211"]
    | ["2,21,_21"]
    | ["2,_2"]
;

export type EventType = 
    | "NEXT"
    | "OUTER"
    | "PREV"
    | "INNER"
;

export enum EventEnum {
  NEXT = "NEXT",
  OUTER = "OUTER",
  PREV = "PREV",
  INNER = "INNER"
};

export const eventList: EventType[] = [
  "NEXT",
  "OUTER",
  "PREV",
  "INNER"
];

export const state2EventMap = {
  "1": [],
  "2": [],
  "1,11": [
    "NEXT",
    "OUTER"
  ],
  "1,12": [
    "PREV",
    "NEXT",
    "OUTER"
  ],
  "1,13": [],
  "1,13,131": [
    "NEXT",
    "OUTER"
  ],
  "1,13,132": [
    "PREV",
    "OUTER"
  ],
  "1,13,_13": [
    "PREV",
    "INNER",
    "OUTER"
  ],
  "1,_1": [
    "NEXT",
    "INNER"
  ],
  "2,21": [],
  "2,21,211": [
    "OUTER"
  ],
  "2,21,_21": [
    "OUTER",
    "INNER"
  ],
  "2,_2": [
    "PREV",
    "INNER"
  ]
}

export const hasEvent = (event: EventType, path: Paths): boolean => 
    // @ts-ignore 
    state2EventMap[path.join(",")].includes(event);

export const matches = (path: Paths, state: any): boolean => 
    state.matches(path.join("."));