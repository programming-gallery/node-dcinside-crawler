import Queue from 'denque';
export declare class AsyncQueue {
    resolverQ: Queue;
    q: Queue;
    constructor();
    push(val: any): void;
    pop(): Promise<any>;
}
export declare function PromiseIterator(promises: Promise<any>[]): AsyncGenerator<any, void, unknown>;
