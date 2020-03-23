/** This file is generated! */

import { Machine } from "xstate";

export const schema = (
{
  "context": {},
  "initial": "1",
  "states": {
    "1": {
      "states": {
        "11": {},
        "12": {},
        "13": {
          "states": {
            "131": {},
            "132": {}
          }
        }
      }
    },
    "2": {
      "states": {
        "21": {
          "states": {
            "211": {}
          }
        }
      }
    }
  }
}
);

export const machine = Machine(schema);

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