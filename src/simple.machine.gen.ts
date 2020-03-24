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

export const createMachine = (options: any) => Machine(schema, options);

type Patterns = 
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

export const matches = (pattern: Patterns, state: any): boolean => 
    state.matches(pattern.join("."));