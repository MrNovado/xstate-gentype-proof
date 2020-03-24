import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import { useMachine } from "@xstate/react";
import {
    createMachine,
    eventList,
    state2EventMap,
    matches,
} from "./simple.machine.gen";

const simpleMachine = createMachine({ actions: { onEntry: console.info } });

function App() {
    const [state, send] = useMachine(simpleMachine);
    const controls = eventList.map((event, index) => {
        const pathString = JSON.stringify(state.value);
        const regexp = /\w+/g;

        let path = [];
        let hasMoreNodes = true;
        do {
            const res = regexp.exec(pathString);
            if (res) {
                hasMoreNodes = true;
                path.push(res[0]);
            } else {
                hasMoreNodes = false;
            }
        } while (hasMoreNodes);

        // @ts-ignore
        const hasEvent = (state2EventMap[path.join(".")] || []).includes(event);
        const handler = hasEvent ? () => send(event) : undefined;
        return (
            <button key={index} disabled={!hasEvent} onClick={handler}>
                {event}
            </button>
        );
    });

    useEffect(function logStuff() {
        const is = matches(state);
        switch(true) {
            case is("1.13.131"):
                console.warn("We are in '1.13.131'!");
                break;
            case is("1.13.132"):
                console.warn("We are in '1.13.132'!");
                break;
            default:
                break;
        }
    }, [state, state.value])

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{JSON.stringify(state.value, null, 2)}</span>
            {controls}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("app"));
