/** @flow */
import ReducerSteps, { type StateWithSteps } from "../../ReducerSteps";
import type { Step, State } from "./Types.flow";

type StateParam = StateWithSteps<Step, State>;

type Amount = $PropertyType<StateParam, "amount">;
type ExceededLimit = $PropertyType<StateParam, "exceededLimit">;
function amountIsValid(amount: Amount, exceededLimit: ExceededLimit) {
  return !!amount && !exceededLimit;
}

function amountValueIsValid({ amount, exceededLimit }: StateParam) {
  return amountIsValid(amount, exceededLimit);
}

function editAmountValueIsValid({ editAmount, exceededLimit }: StateParam) {
  return amountIsValid(editAmount, exceededLimit);
}

function targetIsValid(state: StateParam) {
  return !!state.selected;
}

function editTargetIsValid(state: StateParam) {
  return !!state.editSelected;
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
