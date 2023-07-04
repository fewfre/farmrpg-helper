import { FarmRPG } from '../../farmrpg';
import WordleSolveButton from './WordleSolveButton.svelte';

export namespace Vault {
	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		const $target = $(`<div />`).appendTo($(container).find("#vaultcode").closest(".item-inner"));

		if (!$target.length) { return; }
		return new WordleSolveButton({ target: $target[0] });
	}

	export function setup() {
		FarmRPG.onPageInit("crack", init);
	}
}