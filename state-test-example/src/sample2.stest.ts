import { unit } from "../../state-test/src";
import { exportedTest } from "./sample.stest";

unit('outer test', 
unit('second file test', exportedTest, async value => {
  console.log(`${value.a} ${value.b}`)
  return value
}), async value => {
  console.log('some test value', value)
})