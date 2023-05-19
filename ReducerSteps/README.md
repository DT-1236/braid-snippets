# ReducerSteps

A way to reuse common step-based logic in form reducers

## Instantiating ReducerSteps

The class is instantiated in a separate file and imported to the places where the reducer is updated

### stepsConfig

This will have keys corresponding to each step of the form

#### nextStep

The next step in the form sequence. The final step should have itself as the next step to safeguard against successive calls to advance to the next step. If this does not make sense, consider creating a sort of "complete" step

#### previousStep (optional)

The previous step in the form sequence. It will be the `currentStep` after a call to go to the previous step. Attempting to go to the previous step without a configured `previousStep` may cause unexpected behavior

#### skipWhen (optional)

A callback accepting the state of the reducer and returning a boolean. When the callback evaluates to true, the step will be removed from the flow. It will not count towards the step indicator values, and the configured `nextStep` will be used for `currentStep` instead

#### partialStepOf (optional)

The step will not count towards the step total and will display the same step count as the step entered for this field. This is used when a particular step requires additional information such as a primer to be displayed

#### canContinue (optional)

A callback accepting the state of the reducer and returning a boolean. Populates the reducer's `canContinue` value which usually dictates whether a cta is enabled

### formStepConfig

An array indicating the order of the form's steps

## Consuming ReducerSteps

#### getNextStep

Returns the next step of the form. Used by getNextStepState. Not usually used directly

#### getNextStepState

A convenience method. The reducer will usually return `getNextStepState(state)` when processing a `NEXT_STEP` action

#### getPreviousStep

Returns the previous step of the form. Used by getPreviousStepState. Not usually used directly

#### getPreviousStepState

A convenience method. The reducer will usually return `getPreviousStepState(state)` when processing a `PREVIOUS_STEP` action

#### getStepIndicator

A string of the format `x of y` where x is the current step count and y is the total step count. It is most frequently used when updating navigation headers to indicate form progress

#### getCanContinue

A boolean indicating whether the form can progress to the next step. This will likely be used every time the state is updated, so it may be wise to use it in the "emergent property calculation" for Braid's reducers