import { getContext, setContext } from 'svelte';

const STEPPER_KEY = Symbol('stepper');

export function setStepperContext(props) {
	setContext(STEPPER_KEY, props);
}

export function getStepperContext() {
	return getContext(STEPPER_KEY);
}