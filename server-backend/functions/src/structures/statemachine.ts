/**
 * A statemachine is a data structure that holds a variety of states and transition functions
 * that handle transitions between various states.
 */
export class Statemachine {
    states: Map<string, State>;
    currentState: State | null;
    constructor() {
        this.states = new Map<string, State>();
        this.currentState = null;
    }

    transitionTo(typename: string) {
        this.currentState?.uninitialize();
        this.currentState = this.states.get(typename) || null;
        this.currentState?.initialize();
    }

    update() {
        this.currentState?.update();
    }
}

/**
 * An abstract state within the state machine. This serves as a parent class for all
 * different states that an entity can be in.
 */
export class State {
    uninitialize() {
        // empty
    }
    initialize() {
        // empty
    }
    update() {
        // empty
    }
}
