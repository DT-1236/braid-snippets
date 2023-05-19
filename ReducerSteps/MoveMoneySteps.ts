import ReducerSteps, { type StateWithSteps } from "./ReducerSteps";

// Braid had many different target types
type Target = any;

type Step = {
  amount: "amount";
  target: "target";
  edit_amount: "edit_amount";
  edit_target: "edit_target";
  confirm: "confirm";
};

type MoveMoneyLimitType = {
  AVAILABLE_BALANCE: "AVAILABLE_BALANCE";
  DAILY_SPENDING_CAP: "DAILY_SPENDING_CAP";
  WITHDRAW_PERMISSION: "WITHDRAW_PERMISSION";
  BRAID_INSTANT_SEND_MINIMUM: "BRAID_INSTANT_SEND_MINIMUM";
  BRAID_EXTERNAL_OUTBOUND_MINIMUM: "BRAID_EXTERNAL_OUTBOUND_MINIMUM";
  BRAID_EXTERNAL_INBOUND_MINIMUM: "BRAID_EXTERNAL_INBOUND_MINIMUM";
  DAILY_EXTERNAL_INBOUND_MAXIMUM: "DAILY_EXTERNAL_INBOUND_MAXIMUM";
  DAILY_EXTERNAL_OUTBOUND_MAXIMUM: "DAILY_EXTERNAL_OUTBOUND_MAXIMUM";
  DEFAULT_BRAID_TRANSACTION: "DEFAULT_BRAID_TRANSACTION";
  MAXIMUM_PUSH_TO_DEBIT_BALANCE: "MAXIMUM_PUSH_TO_DEBIT_BALANCE";
  MAXIMUM_PUSH_TO_DEBIT_REMAINING_DAILY_SPENDING_CAP: "MAXIMUM_PUSH_TO_DEBIT_REMAINING_DAILY_SPENDING_CAP";
  MAXIMUM_PUSH_TO_DEBIT_REMAINING_TRANSFER_LIMIT: "MAXIMUM_PUSH_TO_DEBIT_REMAINING_TRANSFER_LIMIT";
};

type MoveMoneyLimitResult = {
  type: MoveMoneyLimitType;
  value: number;
  seen: boolean;
  description: string;
};

type ReducerState = {
  amount: number;
  editAmount: number | null;
  exceededLimit: MoveMoneyLimitResult | null;
  selected: Target | null;
  editSelected: Target | null;
  selectedTargetTypes: string[];
} & StateWithSteps<Step>;

function amountIsValid(
  amount: number | null,
  exceededLimit: MoveMoneyLimitResult | null
) {
  return !!amount && !exceededLimit;
}

function amountValueIsValid({ amount, exceededLimit }: ReducerState) {
  return amountIsValid(amount, exceededLimit);
}

function editAmountValueIsValid({ editAmount, exceededLimit }: ReducerState) {
  return amountIsValid(editAmount, exceededLimit);
}

function targetIsValid(target: Target | null, selectedTargetTypes: string[]) {
  return (
    !!target &&
    target.__typename &&
    selectedTargetTypes.includes(target.__typename)
  );
}

function selectedTargetIsValid({
  selected,
  selectedTargetTypes,
}: ReducerState) {
  return targetIsValid(selected, selectedTargetTypes);
}

function editTargetIsValid({
  editSelected,
  selectedTargetTypes,
}: ReducerState) {
  return targetIsValid(editSelected, selectedTargetTypes);
}

export default new ReducerSteps<Step, ReducerState>(
  {
    amount: {
      nextStep: "target",
      canContinue: amountValueIsValid,
    },
    target: {
      nextStep: "confirm",
      previousStep: "amount",
      skipWhen: ({ selectedTargetTypes }) => selectedTargetTypes.length < 1,
      canContinue: selectedTargetIsValid,
    },
    confirm: { nextStep: "confirm" },
    edit_amount: { nextStep: "confirm", canContinue: editAmountValueIsValid },
    edit_target: { nextStep: "confirm", canContinue: editTargetIsValid },
  },
  ["amount", "target", "confirm"]
);
