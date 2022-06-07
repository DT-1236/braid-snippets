/** @flow */

type StateWithSteps<Step, State> = { ...State, currentStep: Step };

export type StepConfig<Step, State> = {
  next: Step,
  previous: null | Step,
  exclusion: (StateWithSteps<Step, State>) => boolean,
};

type NextStep<Step, State> = $PropertyType<StepConfig<Step, State>, "next">;
type PreviousStep<Step, State> = $PropertyType<
  StepConfig<Step, State>,
  "previous"
>;
type ExclusionCriteria<Step, State> = $PropertyType<
  StepConfig<Step, State>,
  "exclusion"
>;

export type StepsConfig<Step, State> = {
  [Step]: StepConfig<Step, State>,
};

export function configureStep<Step, State>(
  next: NextStep<Step, State>,
  previous: PreviousStep<Step, State> = null,
  exclusion: ExclusionCriteria<Step, State> = () => false
): StepConfig<Step, State> {
  return { next, previous, exclusion };
}

export function getNextStep<Step, State>(
  state: StateWithSteps<Step, State>,
  step: Step,
  config: StepsConfig<Step, State>
): Step {
  const stepConfig = config[step];
  if (!stepConfig) {
    return step;
  }
  const nextStep = stepConfig.next;
  const nextStepConfig = config[nextStep];
  if (nextStepConfig.exclusion(state)) {
    return getNextStep(state, nextStep, config);
  }

  return nextStep;
}

export function getPreviousStep<Step, State>(
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

  const previousStep = currentStepConfig.previous;
  if (!previousStep) {
    return previousStep;
  }
  const previousStepConfig = config[previousStep];
  if (previousStepConfig.exclusion(state)) {
    return getPreviousStep(state, previousStepConfig.previous, config);
  }
  return previousStep;
}

function getFormSteps<Step, State>(
  state: StateWithSteps<Step, State>,
  config: StepsConfig<Step, State>,
  formStepConfig: Step[]
): Step[] {
  return formStepConfig.filter((step) => !config[step]?.exclusion(state));
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

export function getStepIndicator<Step, State>(
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
