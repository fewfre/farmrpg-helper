import { FarmRPG } from '../../farmrpg';
import AutoFish from './AutoFish.svelte';
import BaitArea from './BaitArea.svelte';
import { FishingBot } from './FishingBot';

export namespace Fishing {
	export const bot = new FishingBot();

	export interface BaitData { name: string; num: string; imgSrc: string; selected: boolean; }
	async function getAllBaitData() {
		return new Promise<BaitData[]>((resolve) => {
			$('<div/>').load('changebait.php?from=fishing&id=' + $('.zone_id').html(), function () {
				resolve($(this).find(".selectbait").map(function () {
					return {
						name: $(this).data('bait'),
						num: $(this).find(".item-after").text(),
						imgSrc: $(this).find("img").attr('src'),
						selected: $(this).find(".item-title i").text() === 'check',
					}
				}).get());
			});
		});
	}

	let baitListCache: { list: BaitData[], active: string };
	export async function getCachedBaitData(currentBait: string) {
		const baits = baitListCache && currentBait && baitListCache.active === currentBait ? baitListCache.list : await getAllBaitData();
		baitListCache = { list: baits.slice(), active: baits.find(b => b.selected)?.name };
		return baits;
	}

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function initBot(container: Element) {
		const $target = $(container).find(".buttons-row").append('<div />');

		if (!$target.length) { return; }
		return new AutoFish({ target: $target[0] });
	}

	function initBait(container: Element) {
		const $target = $('<div />').insertAfter($(container).find('#baitarea'));

		if (!$target.length) { return; }
		return new BaitArea({ target: $target[0] });
	}

	function init({ container }: FarmRPG.PageData) {
		initBot(container);
		initBait(container);
	}

	export function setup() {
		FarmRPG.onPageInit("fishing", init);
		FarmRPG.onPageExit("fishing", () => {
			bot.stop();
		});
	}
}