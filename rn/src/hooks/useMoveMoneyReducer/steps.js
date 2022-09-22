/** @flow */
import ReducerSteps, { type StateWithSteps } from "../../ReducerSteps";
import type { Step, State, Target, TargetType } from "./Types.flow";

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

function targetIsValid(target: Target, selectedTargetTypes: TargetType[]) {
  return (
    !!target &&
    target.__typename &&
    selectedTargetTypes.includes(target.__typename)
  );
}

function selectedTargetIsValid({ selected, selectedTargetTypes }: StateParam) {
  return targetIsValid(selected, selectedTargetTypes);
}

function editTargetIsValid({ editSelected, selectedTargetTypes }: StateParam) {
  return targetIsValid(editSelected, selectedTargetTypes);
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
      canContinue: selectedTargetIsValid,
    },
    confirm: { nextStep: "confirm" },
    edit_amount: { nextStep: "confirm", canContinue: editAmountValueIsValid },
    edit_target: { nextStep: "confirm", canContinue: editTargetIsValid },
  },
  ["amount", "target", "confirm"]
);
