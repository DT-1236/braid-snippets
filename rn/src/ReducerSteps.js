/** @flow */

type StateWithSteps<Step, State> = { ...State, currentStep: Step };

type StepConfig<Step, State> = {
  nextStep: Step,
  previousStep: null | Step,
  skipWhen: (StateWithSteps<Step, State>) => boolean,
};

type NextStep<Step, State> = $PropertyType<StepConfig<Step, State>, "nextStep">;
type PreviousStep<Step, State> = $PropertyType<
  StepConfig<Step, State>,
  "previousStep"
>;
type SkipCriteria<Step, State> = $PropertyType<
  StepConfig<Step, State>,
  "skipWhen"
>;

type StepsConfig<Step, State> = {
  [Step]: StepConfig<Step, State>,
};

/**
 * A convenience method that configures a step. It will add default `null` value for the previous step
 * and a default skip criterion that never skips the step.
 *
 * @param {*} nextStep The next step following this one.
 * @param {*} previousStep The previous step before this one. Defaults to null.
 * @param {*} skipWhen Accepts a state object and returns a boolean indicating whether this step should be skipped.
 * @returns
 */
export function nextStepPreviousStepSkipWhen<Step, State>(
  nextStep: NextStep<Step, State>,
  previousStep: PreviousStep<Step, State> = null,
  skipWhen: SkipCriteria<Step, State> = () => false
): StepConfig<Step, State> {
  return { nextStep, previousStep, skipWhen };
}

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
  if (nextStepConfig.skipWhen(state)) {
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
    return step;
  }

  const currentStepConfig = config[step];
  if (!currentStepConfig) {
    return step;
  }

  const previousStep = currentStepConfig.previousStep;
  if (!previousStep) {
    return previousStep;
  }
  const previousStepConfig = config[previousStep];
  if (previousStepConfig.skipWhen(state)) {
    return getPreviousStep(state, previousStepConfig.previousStep, config);
  }
  return previousStep;
}

function getFormSteps<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
): Step[] {
  return formStepConfig.filter((step) => !config[step]?.skipWhen(state));
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
  formStepConfig: Step[]
) {
  return (
    getFormSteps(state, config, formStepConfig).indexOf(state.currentStep) + 1
  );
}

function getStepIndicator<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
): string {
  const formSteps = getFormSteps(state, config, formStepConfig);
  if (!formSteps.includes(state.currentStep)) {
    return "";
  }
  return `${getCurrentStepCount(
    state,
    config,
    formStepConfig
  )} of ${getTotalStepCount(state, config, formStepConfig)}`;
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

  getPreviousStep(
    state: StateWithSteps<Step, State>,
    step: Step | null
  ): Step | null {
    return getPreviousStep<Step, State>(state, step, this.stepsConfig);
  }

  getStepIndicator = (state: StateWithSteps<Step, State>): string => {
    return getStepIndicator<Step, State>(
      state,
      this.stepsConfig,
      this.formStepConfig
    );
  };
}
