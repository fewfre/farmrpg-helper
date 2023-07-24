import { FarmRPG } from '../../farmrpg';
import { ExplorationBot } from './ExplorationBot';
import AutoExplore from './AutoExplore.svelte';

export namespace Exploration {
	export const LSKEY_WAIT_FOR_STAMINA_REGEN = "fewfh-explore-wait-stam-regen";

	export const bot = new ExplorationBot();

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		const $target = $(`<div />`).insertAfter($(container).find("#exploreconsole"));

		if (!$target.length) { return; }
		return new AutoExplore({ target: $target[0] });
	}

	export function setup() {
		bot.isWaitForMoreStamina = localStorage.getItem(LSKEY_WAIT_FOR_STAMINA_REGEN) === 'true';
		FarmRPG.onPageInit("area", init);
		FarmRPG.onPageExit("area", () => {
			bot.stop();
		});
	}
}