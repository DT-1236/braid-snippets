
interface StepEnum {
  [value: string]: string
} 
export interface StateWithSteps<Steps extends StepEnum> { currentStep: keyof Steps };

interface StepPredicate<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>> {
  (state: ReducerState): boolean
}

interface StepConfig<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>> {
  nextStep: keyof StepEnum,
  previousStep?: keyof StepEnum,
  skipWhen?: StepPredicate<ReducerSteps, ReducerState>,
  /** The step will not count towards the step total and has the same step count of the step in this value */
  partialStepOf?: keyof StepEnum,
  canContinue?: StepPredicate<ReducerSteps, ReducerState>,
};

type StepsConfig<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>> = {
  [Property in keyof ReducerSteps]: StepConfig<ReducerSteps, ReducerState>
};

function getNextStep<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  step: keyof ReducerSteps,
  config: StepsConfig<ReducerSteps, ReducerState>
): keyof ReducerSteps {
  const stepConfig = config[step];
  if (!stepConfig) {
    return step;
  }
  const nextStep = stepConfig.nextStep;
  const nextStepConfig = config[nextStep];
  if (nextStepConfig.skipWhen?.(state)) {
    if (nextStepConfig.nextStep === nextStep) {
      console.warn(
          `Terminal step ${(nextStep)} was skipped. Terminal steps should be unskippable.`        
      );
      return step;
    }
    return getNextStep(state, nextStep, config);
  }

  return nextStep;
}

function getPreviousStep<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  step: (keyof ReducerSteps | null | undefined),
  config: StepsConfig<ReducerSteps, ReducerState>
): keyof ReducerSteps | null {
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

function getFormSteps<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  config: StepsConfig<ReducerSteps, ReducerState>,
  formStepConfig: (keyof ReducerSteps)[]
): (keyof ReducerSteps)[] {
  return formStepConfig.filter((step) => !config[step]?.skipWhen?.(state));
}

function getTotalStepCount<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  config: StepsConfig<ReducerSteps, ReducerState>,
  formStepConfig: (keyof ReducerSteps)[]
) {
  return getFormSteps(state, config, formStepConfig).length;
}

function getCurrentStepCount<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  config: StepsConfig<ReducerSteps, ReducerState>,
  formStepConfig: (keyof ReducerSteps)[],
  stepToCheck: keyof ReducerSteps
) {
  return getFormSteps(state, config, formStepConfig).indexOf(stepToCheck) + 1;
}

function getStepIndicator<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  config: StepsConfig<ReducerSteps, ReducerState>,
  formStepConfig: (keyof ReducerSteps)[]
): string {
  const formSteps = getFormSteps(state, config, formStepConfig);
  const { currentStep } = state;
  const { partialStepOf } = config[currentStep];
  if (!formSteps.includes(state.currentStep) && !partialStepOf) {
    return "";
  }

  const totalStepCount = getTotalStepCount(state, config, formStepConfig);
  if (totalStepCount <= 1) {
    // We don't ever want to show "1 of 0" or "1 of 1"
    return "";
  }

  return `${getCurrentStepCount(
    state,
    config,
    formStepConfig,
    partialStepOf || currentStep
  )} of ${totalStepCount}`;
}

function getCanContinue<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>>(
  state: ReducerState,
  config: StepsConfig<ReducerSteps, ReducerState>
): boolean {
  return config[state.currentStep].canContinue?.(state) ?? true;
}

export default class ReducerSteps<ReducerSteps extends StepEnum, ReducerState extends StateWithSteps<ReducerSteps>> {
  stepsConfig: StepsConfig<ReducerSteps, ReducerState>;
  formStepConfig: (keyof ReducerSteps)[];
  constructor(stepsConfig: StepsConfig<ReducerSteps, ReducerState>, formStepConfig: (keyof ReducerSteps)[]) {
    this.stepsConfig = stepsConfig;
    this.formStepConfig = formStepConfig;
  }

  getNextStep(state: ReducerState, step: keyof ReducerSteps): keyof ReducerSteps {
    return getNextStep<ReducerSteps, ReducerState>(state, step, this.stepsConfig);
  }

  getNextStepState(state: ReducerState): ReducerState {
    return {
      ...state,
      currentStep: getNextStep<ReducerSteps, ReducerState>(
        state,
        state.currentStep,
        this.stepsConfig
      ),
    };
  }

  getPreviousStep(
    state: ReducerState,
    step: keyof ReducerSteps | null
  ): keyof ReducerSteps | null {
    return getPreviousStep<ReducerSteps, ReducerState>(state, step, this.stepsConfig);
  }

  getPreviousStepState(state: ReducerState): ReducerState {
    const previousStep = getPreviousStep(
      state,
      state.currentStep,
      this.stepsConfig
    );
    if (!previousStep) {
      console.warn(
          "Previous step not found while trying to go to previous step: " +
            JSON.stringify(state) +
            "\nReturning on current step..."
        );
    }
    return { ...state, currentStep: previousStep ?? state.currentStep };
  }

  getStepIndicator(state: ReducerState): string {
    return getStepIndicator<ReducerSteps, ReducerState>(
      state,
      this.stepsConfig,
      this.formStepConfig
    );
  }

  getCanContinue(state: ReducerState): boolean {
    return getCanContinue<ReducerSteps, ReducerState>(state, this.stepsConfig);
  }
}
