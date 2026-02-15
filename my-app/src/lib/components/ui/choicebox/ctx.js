import { getContext, setContext } from 'svelte';

const CHOICEBOX_KEY = Symbol('choicebox');

export function setChoiceboxContext(props) {
	setContext(CHOICEBOX_KEY, props);
}

export function getChoiceboxContext() {
	return getContext(CHOICEBOX_KEY);
}