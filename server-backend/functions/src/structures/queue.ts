/**
 * A simple queue implementation. Not very memory efficient, but quite fast.
 */
export class Queue<T> {
    private data: Array<T>;
    private first: number;
    constructor() {
        this.data = new Array<T>();
        this.first = 0;
    }

    enqueue(element: T) {
        this.data.push(element);
    }

    dequeue() {
        return this.data[this.first++];
    }

    size() {
        return this.data.length - this.first;
    }

    pop_back() {
        return this.data.pop();
    }

    isEmpty() {
        return this.first >= this.data.length;
    }

    back() {
        return this.data[this.data.length - 1];
    }

    front() {
        return this.data[this.first];
    }
}
