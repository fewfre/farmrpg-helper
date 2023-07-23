import { FarmRPG } from '../../farmrpg';
import MasteryClaimAll from './MasteryClaimAll.svelte';

export namespace Mastery {
	export function getClaimIds() {
		return $(".claimbtn").map<string>(function () { return $(this).data('id') }).get();
	}

	export function claimMastery(id: string | number) {
		return fetch(`worker.php?go=claimmastery&id=${id}`, { method: 'POST' })
			.then(r => r.text());
	}

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		if (!$(container).find(".claimbtn").length) return; // Skip if nothing to claim

		const $target = $(`<span />`).appendTo($(".claimbtn:first-of-type").closest(".list-block").prev());

		if (!$target.length) { return; }
		return new MasteryClaimAll({ target: $target[0] });
	}

	export function setup() {
		FarmRPG.onPageInit("mastery", init);
	}
}