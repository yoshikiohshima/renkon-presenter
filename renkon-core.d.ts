import { Program } from 'acorn';

export declare const Behaviors:BehaviorsInterface;

declare class BehaviorsInterface {
    keep<T>(variable:T):T;
    collect<I, T>(init:I|Promise<I>, variable:T, updater: (c:I, v:T) => I):I;
    timer(interval:number, toggle?: boolean):number;
    delay<T>(variable:T, delay: number):T;
    resolvePart(object:any):any;
    select<I>(init:I|Promise<I>, ...pairs:Array<[any, (c:I, v:any) => I]>):I;
    or(...variables:any[]):any;
    some(...variables:any[]):any[];
    gather(regexp:string):any[];
    receiver<T>():T;
}

declare const behaviorType = "BehaviorType";

declare const calmType = "CalmType";

declare const changeType = "ChangeType";

declare const collectType = "CollectType";

declare type ComponentKey = string;

declare type ComponentType = {
    params: string[];
    types: Map<string, "Event" | "Behavior"> | null;
    rawTypes: Map<string, string> | null;
    returnValues: {
        [key: string]: string;
    } | null;
    output: string;
};

declare const delayType = "DelayType";

declare type EvaluatorOptions = {
    once?: boolean;
    noAnimationFrame?: boolean;
    ticker?: boolean;
};

export declare const Events:EventsInterface;

declare class EventsInterface {
    listener<T>(dom: HTMLElement|string, eventName:string, handler: (evt:any) => T, options?:any):T;
    delay<T>(variable:T, delay: number):T;
    timer(interval:number, toggle?: boolean):number;
    calm<T>(variable:T, interval:number):T;
    change<T>(variable:T):T;
    once<T>(variable:T):T;
    next<T>(generator:any):T;
    or(...variables:any[]):any;
    some(...variables:any[]):any[];
    collect<I, T>(init:I|Promise<I>, variable:T, updater: (c:I, v:T) => I):I;
    select<I>(init:I|Promise<I>, ...pairs:Array<[any, (c:I, v:any) => I]>):I;
    send<T>(variable:T, value:T):void;
    receiver<T>():T;
    observe(callback:(notifier:(v:any) => void) => () => void):() => void;
    resolvePart(object:any):any;
}

declare const eventType = "EventType";

declare const gatherType = "GatherType";

declare const generatorNextType = "GeneratorNextType";

export declare const globals: {
    [k: string]: boolean;
};

declare const isBehaviorKey: unique symbol;

export declare function loader(programState: ProgramState, docName: string, maybeFetch: (typeof fetch | undefined)): void;

declare type NodeId = string;

declare const onceType = "OnceType";

declare const orType = "OrType";

export declare function parseJSX(input: string): Program;

declare type PendingEvaluationType = {
    handle: any;
    type: "animationFrame" | "setTimeout" | "setInterval";
};

export declare class ProgramState implements ProgramStateType {
    scripts: Array<string>;
    app?: any;
    options?: EvaluatorOptions;
    order: Array<NodeId>;
    types: Map<NodeId, "Behavior" | "Event">;
    nodes: Map<NodeId, ScriptCell>;
    streams: Map<VarName, Stream>;
    scratch: Map<VarName, ValueRecord>;
    resolved: Map<VarName, ResolveRecord>;
    inputArray: Map<NodeId, Array<any>>;
    changeList: Map<VarName, any>;
    nextDeps: Set<VarName>;
    time: number;
    startTime: number;
    errored?: any;
    pendingEvaluation: PendingEvaluationType | null;
    thisNode?: ScriptCell;
    programStates: Map<ComponentKey, SubProgramState>;
    hasComponent: Map<VarName, Set<ComponentKey>>;
    componentParent?: ProgramStateType;
    componentUpdated: boolean;
    noSelfSchedule: boolean;
    evaluationAlarm: Array<number>;
    pendingAnimationFrame: boolean;
    log: (...values: any) => void;
    announcer?: (varName: VarName, value: any) => void;
    futureScripts?: {
        scripts: Array<string>;
        path: string;
    };
    breakpoints: Set<VarName>;
    changedNodeNames: Set<VarName>;
    constructor(startTime: number, app?: any);
    start(): void;
    stop(): void;
    tickingEvaluator(): boolean | undefined;
    requestAlarm(timeOffset: number): void;
    scheduleAlarm(): void;
    scheduler(): number | undefined;
    doEvaluate(): void;
    setupProgram(scriptsArg: (string[] | Array<{
        blockId: string;
        code: string;
    }>), path?: string): void;
    updateProgram(scripts: string[], path?: string): void;
    findDecls(code: string): {
        code: string;
        start: number;
        end: number;
        decls: string[];
    }[];
    getFunctionBody(func: Function | string): (ComponentType | null);
    findDecl(name: string): string | undefined;
    evaluator(now: number, options?: EvaluatorOptions): void;
    evaluate(now: number): Set<string>;
    prelude(): boolean;
    conclude(): void;
    evalCode(arg: {
        id: VarName;
        code: string;
    }, path: string): ScriptCell;
    componentReady(node: ScriptCell): boolean;
    ready(node: ScriptCell): boolean;
    defaultReady(node: ScriptCell): boolean;
    equals(aArray?: Array<any | undefined>, bArray?: Array<any | undefined>): boolean;
    spliceDelayedQueued(record: QueueRecord, t: number): any;
    getEventValue(record: QueueRecord, _t: number): any;
    getEventValues(record: QueueRecord, _t: number): any[] | undefined;
    baseVarName(varName: VarName): string;
    registerEvent(receiver: VarName, value: any): void;
    setResolved(varName: VarName, value: {
        time: number;
        value: any;
    }): void;
    setResolvedForSubgraph(varName: VarName, value: any): void;
    merge(...funcs: Function[]): void;
    loadTS(path: string): Promise<any>;
    component(argFunc: Function | string): (input: any, key: string) => any;
    finalizeComponent(key: string): void;
    finalizeAllComponents(): void;
    spaceURL(partialURL: string): string;
    addBreakpoint(...ids: Array<VarName>): void;
    removeBreakpoint(...ids: Array<VarName>): void;
    resetBreakpoint(): void;
    setLog(func: (...values: any) => void): void;
}

declare interface ProgramStateType {
    scripts: Array<string>;
    app?: any;
    order: Array<NodeId>;
    types: Map<NodeId, "Behavior" | "Event">;
    nodes: Map<NodeId, ScriptCell>;
    streams: Map<VarName, Stream>;
    scratch: Map<VarName, ValueRecord>;
    resolved: Map<VarName, ResolveRecord>;
    inputArray: Map<NodeId, Array<any>>;
    changeList: Map<VarName, any>;
    nextDeps: Set<VarName>;
    time: number;
    startTime: number;
    errored?: any;
    thisNode?: ScriptCell;
    programStates: Map<ComponentKey, SubProgramState>;
    hasComponent: Map<VarName, Set<ComponentKey>>;
    componentParent?: ProgramStateType;
    componentUpdated: boolean;
    pendingEvaluation: PendingEvaluationType | null;
    evaluationAlarm: Array<number>;
    changedNodeNames: Set<VarName>;
    updateProgram(scripts: Array<string>): void;
    ready(node: ScriptCell): boolean;
    equals(aArray?: Array<any | undefined>, bArray?: Array<any | undefined>): boolean;
    defaultReady(node: ScriptCell): boolean;
    spliceDelayedQueued(record: QueueRecord, t: number): any;
    getEventValue(record: QueueRecord, _t: number): any;
    getEventValues(record: QueueRecord, _t: number): any;
    baseVarName(varName: VarName): VarName;
    setResolved(varName: VarName, value: {
        time: number;
        value: any;
    }): void;
    requestAlarm: (alarm: number) => void;
    scheduleAlarm: (alarm?: number) => void;
    setLog(func: (...values: any) => void): void;
    log: (...values: any) => void;
}

declare const promiseType = "PromiseType";

declare interface QueueRecord extends ValueRecord {
    queue: Array<ResolveRecord>;
    cleanup?: () => void;
}

declare const receiverType = "ReceiverType";

declare const resolvePartType = "ResolvePart";

declare type ResolveRecord = {
    value: any;
    time: number;
};

declare type ScriptCell = {
    code: string;
    body: (...args: any[]) => Array<any>;
    id: NodeId;
    topType: StreamTypeLabel;
    inputs: Array<VarName>;
    forceVars: Array<VarName>;
    outputs: VarName;
    extraType?: any;
    input?: string;
};

declare const selectType = "SelectType";

declare const sendType = "SendType";

declare class Stream {
    [typeKey]: StreamType;
    [isBehaviorKey]: boolean;
    constructor(type: StreamType, isBehavior: boolean);
    created(_state: ProgramStateType, _id: VarName): Stream;
    ready(node: ScriptCell, state: ProgramStateType): boolean;
    evaluate(_state: ProgramStateType, _node: ScriptCell, _inputArray: Array<any>, _lastInputArray: Array<any> | undefined): void;
    conclude(state: ProgramStateType, varName: VarName): VarName | undefined;
}

declare type StreamType = typeof eventType | typeof userEventType | typeof delayType | typeof timerType | typeof calmType | typeof collectType | typeof selectType | typeof promiseType | typeof behaviorType | typeof onceType | typeof orType | typeof sendType | typeof receiverType | typeof changeType | typeof gatherType | typeof generatorNextType | typeof resolvePartType;

declare type StreamTypeLabel = "Event" | "Behavior" | "";

declare type SubProgramState = {
    programState: ProgramStateType;
    funcString: string;
    outputNames: {
        [key: string]: string;
    } | null;
};

declare const timerType = "TimerType";

export declare function translateTS(text: string, path: string): string;

export declare function transpileJSX(code: string): string;

declare const typeKey: unique symbol;

declare const userEventType = "UserEventType";

declare interface ValueRecord {
}

declare type VarName = string;

export declare const version: string;

export { }
