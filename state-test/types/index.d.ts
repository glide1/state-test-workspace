export declare type ITestUnit<TRes, TPrior> = {
    readonly name: string;
    readonly assert: (priorState: TPrior) => Promise<TRes>;
    readonly prior: IPriorState<TPrior>;
};
export declare type IPriorState<TRes> = ITestUnit<TRes, any> | null;
declare global  {
    namespace NodeJS {
        interface Global {
            tests: ITestUnit<any, any>[];
        }
    }
}
export declare function unit<TResult, TPrior>(name: string, priorOrAssert: IPriorState<TPrior> | (() => Promise<TResult>), assertOrUndefined?: (priorState: TPrior) => Promise<TResult>): ITestUnit<TResult, TPrior>;
export declare function runTests(): Promise<void>;
