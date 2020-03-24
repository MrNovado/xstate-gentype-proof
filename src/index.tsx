import React from "react";
import ReactDOM from "react-dom";

import { useMachine } from "@xstate/react";
import {
    createMachine,
    EventEnum,
    matches,
    hasEvent,
} from "./simple.machine.gen";

const simpleMachine = createMachine({ actions: { onEntry: console.log } });

function App() {
    const [state, send] = useMachine(simpleMachine);

    const next = () => send(EventEnum.NEXT);
    const prev = () => send(EventEnum.PREV);
    const inner = () => send(EventEnum.INNER);
    const outer = () => send(EventEnum.OUTER);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{JSON.stringify(state.value, null, 2)}</span>
            <button onClick={next}>{EventEnum.NEXT}</button>
            <button onClick={prev}>{EventEnum.PREV}</button>
            <button onClick={inner}>{EventEnum.INNER}</button>
            <button onClick={outer}>{EventEnum.OUTER}</button>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("app"));
