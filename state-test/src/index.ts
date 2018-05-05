export type ITestUnit<TRes, TPrior> = {
  readonly name: string
  readonly assert: (priorState: TPrior) => Promise<TRes>
  readonly prior: IPriorState<TPrior>
}

export type IPriorState<TRes> = ITestUnit<TRes, any> | null

declare global {
  namespace NodeJS {
    // noinspection JSUnusedGlobalSymbols
    interface Global {
      tests: ITestUnit<any, any>[];
    }
  }
}

function isPriorState<T>(option: IPriorState<T> | (() => Promise<any>)): option is IPriorState<T> {
  if (option === null) return true
  const casted = <IPriorState<T>>option
  if (casted === null) return true
  return !!casted.name && !!casted.assert
}

if (global.tests === undefined) {
  console.log('defining tests');
  global.tests = []
}
export function unit<TResult, TPrior>(name: string, 
  priorOrAssert: IPriorState<TPrior> | (() => Promise<TResult>), 
  assertOrUndefined?: (priorState: TPrior) => Promise<TResult>): ITestUnit<TResult, TPrior> {
    if (isPriorState(priorOrAssert) && assertOrUndefined) {
      const newTestUnit = {
        assert: assertOrUndefined,
        prior: priorOrAssert,
        name
      }
      global.tests.push(newTestUnit)
      return newTestUnit
    }
    else if (!isPriorState(priorOrAssert)) {
      const newTestUnit: ITestUnit<TResult, any> = {
        assert: priorOrAssert,
        prior: null,
        name
      }
      global.tests.push(newTestUnit)
      return newTestUnit
    }
    throw new Error('invalid unit declaration')
}

// export function unit<TRes, TPrior = void>(name: string,
//   assert: (priorState: TPrior) => Promise<TRes>,
//   prior: IPriorState<TPrior> = null): ITestUnit<TRes, TPrior> {
  
//   const newTestUnit = {
//     assert,
//     name,
//     prior
//   };
//   global.tests.push(newTestUnit);
//   return newTestUnit
// }

type TestResult = {
  result: 'ok',
  value: any
} | {
  result: 'not ok',
  error: Error | 'No valid prior results'
}

class RunTree {
  private requirements: Map<ITestUnit<any, any>, IPriorState<any>[]> = new Map()
  private results: Map<ITestUnit<any, any>, TestResult> = new Map()
  private ranTests: Map<ITestUnit<any, any>, boolean> = new Map()


  addTest(newTest: ITestUnit<any, any>): void {
    this.requirements.set(newTest, [newTest.prior])
    this.ranTests.set(newTest, false)
  }

  async runTests() {

    const runTest = async (test: ITestUnit<any, any>, priorResult: TestResult = { result: 'ok', value: {}}): Promise<TestResult> => {
      try {
        if (priorResult.result === 'ok') {
          const testResult = await test.assert(priorResult.value)
          const returnResult: TestResult = { result: 'ok', value: testResult}
          this.results.set(test, returnResult)
          return returnResult
        } else {
          return { result: 'not ok', error: 'No valid prior results'}
        }
      } catch (e) {
        this.results.set(test, { result: 'not ok', error: e})
        return { result: 'not ok', error: e}
      } finally {
        this.ranTests.set(test, true)
      }
    };

    const recordResult = (testName: string, result: TestResult) => {
      console.log(`Test name: ${testName}`, result)
    };

    for (const test of this.ranTests.keys()) {
      if (test.prior === null) {
        recordResult(test.name, await runTest(test))
      } else {
        const priorResults = this.results.get(test.prior)
        if (priorResults) {
          recordResult(test.name, await runTest(test, priorResults))
        } else {
          throw new Error('could not get prior results')
        }
      }
    }
  }
}

export async function runTests() {
  console.log('available tests', global.tests);
  const initialRunTree = new RunTree();
  for (const test of global.tests) {
    initialRunTree.addTest(test)
  }
  // build up a dependency graph of what tests can be run in order.

  console.log('Running tests \n\n');

  await initialRunTree.runTests()
}
