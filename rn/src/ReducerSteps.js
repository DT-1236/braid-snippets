/** @flow */

import Bugsnag from "./Bugsnag";

export type StateWithSteps<Step, State> = { ...State, currentStep: Step };

type StepConfig<Step, State> = {
  nextStep: Step,
  previousStep?: Step,
  skipWhen?: (StateWithSteps<Step, State>) => boolean,
  partialStep?: boolean,
  canContinue?: (StateWithSteps<Step, State>) => boolean,
};

type StepsConfig<Step, State> = {
  [Step]: StepConfig<Step, State>,
};

function getNextStep<Step, State>(
  state: StateWithSteps<Step, State>,
  step: Step,
  config: StepsConfig<Step, State>
): Step {
  const stepConfig = config[step];
  if (!stepConfig) {
    return step;
  }
  const nextStep = stepConfig.nextStep;
  const nextStepConfig = config[nextStep];
  if (nextStepConfig.skipWhen?.(state)) {
    return getNextStep(state, nextStep, config);
  }

  return nextStep;
}

function getPreviousStep<Step, State>(
  state: StateWithSteps<Step, State>,
  step: Step | null,
  config: StepsConfig<Step, State>
): Step | null {
  if (!step) {
    return null;
  }

  const currentStepConfig = config[step];
  if (!currentStepConfig) {
    return step;
  }

  const previousStep = currentStepConfig.previousStep;
  if (!previousStep) {
    return null;
  }
  const previousStepConfig = config[previousStep];
  if (previousStepConfig.skipWhen?.(state)) {
    return getPreviousStep(state, previousStepConfig.previousStep, config);
  }
  return previousStep;
}

function getFormSteps<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
): Step[] {
  return formStepConfig.filter((step) => !config[step]?.skipWhen?.(state));
}

function getTotalStepCount<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
) {
  return getFormSteps(state, config, formStepConfig).length;
}

function getCurrentStepCount<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[],
  stepToCheck: Step
) {
  return getFormSteps(state, config, formStepConfig).indexOf(stepToCheck) + 1;
}

function getStepIndicator<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
): string {
  const formSteps = getFormSteps(state, config, formStepConfig);
  const { currentStep } = state;
  const { partialStep } = config[currentStep];
  if (!formSteps.includes(state.currentStep) && !partialStep) {
    return "";
  }

  const totalStepCount = getTotalStepCount(state, config, formStepConfig);
  if (totalStepCount <= 1) {
    // We don't ever want to show "1 of 0" or "1 of 1"
    return "";
  }

  const stepToCheck = partialStep
    ? getPreviousStep(state, currentStep, config)
    : currentStep;
  if (!stepToCheck && partialStep) {
    let stepString = "";
    if (typeof currentStep === "string") {
      stepString = currentStep;
    } else if (typeof currentStep === "number") {
      stepString = "" + currentStep;
    }
    console.warn(
      `partialStep ${stepString} does not have a previousStep configured`
    );
  }

  return `${getCurrentStepCount(
    state,
    config,
    formStepConfig,
    stepToCheck || currentStep
  )} of ${totalStepCount}`;
}

function getCanContinue<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>
): boolean {
  return config[state.currentStep].canContinue?.(state) ?? true;
}

export default class ReducerSteps<Step, State> {
  stepsConfig: StepsConfig<Step, State>;
  formStepConfig: Step[];
  constructor(stepsConfig: StepsConfig<Step, State>, formStepConfig: Step[]) {
    this.stepsConfig = stepsConfig;
    this.formStepConfig = formStepConfig;
  }

  getNextStep(state: StateWithSteps<Step, State>, step: Step): Step {
    return getNextStep<Step, State>(state, step, this.stepsConfig);
  }

  getNextStepState(state: StateWithSteps<Step, State>): State {
    return {
      ...state,
      currentStep: getNextStep<Step, State>(
        state,
        state.currentStep,
        this.stepsConfig
      ),
    };
  }

  getPreviousStep(
    state: StateWithSteps<Step, State>,
    step: Step | null
  ): Step | null {
    return getPreviousStep<Step, State>(state, step, this.stepsConfig);
  }

  getPreviousStepState(state: StateWithSteps<Step, State>): State {
    const previousStep = getPreviousStep(
      state,
      state.currentStep,
      this.stepsConfig
    );
    if (!previousStep) {
      Bugsnag.notify(
        new Error(
          "Previous step not found while trying to go to previous step: " +
            JSON.stringify(state) +
            "\nReturning on current step..."
        )
      );
    }
    return { ...state, currentStep: previousStep ?? state.currentStep };
  }

  getStepIndicator(state: StateWithSteps<Step, State>): string {
    return getStepIndicator<Step, State>(
      state,
      this.stepsConfig,
      this.formStepConfig
    );
  }

  getCanContinue(state: StateWithSteps<Step, State>): boolean {
    return getCanContinue<Step, State>(state, this.stepsConfig);
  }
}
