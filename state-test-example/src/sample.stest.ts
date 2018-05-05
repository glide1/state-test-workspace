import { ITestUnit, unit } from "../../state-test/src";

const initialUnit = unit('initial state', async () => {
  console.log('initial state');
  return { a: 'new' }
});

const nextUnit = unit('next state', initialUnit, async initial => {
  console.log('next state', initial);
  if (!initial) {
    throw new Error('some error')
  }
  return { b: initial.a }
});

unit('final state', nextUnit, async priorState => {
  console.log('final state', priorState)
  return priorState.b
});

unit('some other state', async () => {
  console.log('some other state')
});

export const exportedTest: ITestUnit<{ a: string, b: string }, { a: string, b: string }> =
  unit('exported state', async () => {
    console.log('exported test')
    return { a: '1', b: '2' }
  })