import { FarmRPG } from '../../farmrpg';
import { ExplorationBot } from './ExplorationBot';
import AutoExplore from './AutoExplore.svelte';

export namespace Exploration {
	export const bot = new ExplorationBot();

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		const $target = $(`<li />`).insertAfter($(container).find(".explorebtn").closest('li'));

		if (!$target.length) { return; }
		return new AutoExplore({ target: $target[0] });
	}

	export function setup() {
		FarmRPG.onPageInit("area", init);
		FarmRPG.onPageInit("*", ({ name }) => {
			if (name !== "area") {
				bot.stop()
			}
		});
	}
}