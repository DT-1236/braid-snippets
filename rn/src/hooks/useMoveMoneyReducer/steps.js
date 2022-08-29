/** @flow */
import ReducerSteps, { type StateWithSteps } from "../../ReducerSteps";
import type { Step, State } from "./Types.flow";

type StateParam = StateWithSteps<Step, State>;

function amountValueIsValid({ amount, exceededLimit }: StateParam) {
  return !!amount && !exceededLimit;
}

function editAmountValueIsValid(state: StateParam) {
  return amountValueIsValid(state);
}

function targetIsValid(state: StateParam) {
  return !!state.selected;
}

function editTargetIsValid(state: StateParam) {
  return targetIsValid(state);
}

export default new ReducerSteps<Step, State>(
  {
    amount: {
      nextStep: "target",
      canContinue: amountValueIsValid,
    },
    target: {
      nextStep: "confirm",
      previousStep: "amount",
      canContinue: targetIsValid,
    },
    confirm: { nextStep: "confirm" },
    edit_amount: { nextStep: "confirm", canContinue: editAmountValueIsValid },
    edit_target: { nextStep: "confirm", canContinue: editTargetIsValid },
  },
  ["amount", "target", "confirm"]
);
