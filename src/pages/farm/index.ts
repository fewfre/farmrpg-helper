import { FarmRPG } from '../../farmrpg';
import QuickSeeds from './QuickSeeds.svelte';

export namespace PlayerFarm {
	export interface SeedProps { name: string; id: number; img: string; }
	const seeds: SeedProps[] = [
		{ name: "Pepper", id: 12, img: "/img/items/seeds_peppers.png" },
		{ name: "Carrot", id: 20, img: "/img/items/seeds_carrots.png" },
		{ name: "Pea", id: 28, img: "/img/items/seeds_peas.png" },
		{ name: "Cucumber", id: 30, img: "/img/items/seeds_cucumber.png" },
		{ name: "Eggplant", id: 14, img: "/img/items/seeds_eggplants.png" },
		{ name: "Radish", id: 32, img: "/img/items/seeds_radish.png" },
		{ name: "Onion", id: 34, img: "/img/items/seeds_onions.png" },
		{ name: "Hops", id: 47, img: "/img/items/seeds_hops.png" },
		{ name: "Potato", id: 49, img: "/img/items/seeds_potato.png" },
		{ name: "Tomato", id: 16, img: "/img/items/seeds_tomato.png" },
		{ name: "Leek", id: 51, img: "/img/items/seeds_leek.png" },
		{ name: "Watermelon", id: 60, img: "/img/items/seeds_watermelon.png" },
		{ name: "Corn", id: 64, img: "/img/items/seeds_corn.png" },
		{ name: "Cabbage", id: 66, img: "/img/items/seeds_cabbage.png" },
		{ name: "Pine", id: 410, img: "/img/items/seeds_pine.png" },
		{ name: "Pumpkin", id: 68, img: "/img/items/seeds_pumpkin.png" },
		{ name: "Wheat", id: 70, img: "/img/items/seeds_wheet.png" },
		{ name: "Mushroom", id: 395, img: "/img/items/seeds_mushroom.png" },
		{ name: "Broccoli", id: 257, img: "/img/items/seeds_broccoli.png" },
		{ name: "Cotton", id: 255, img: "/img/items/seeds_cotton.png" },
		{ name: "Sunflower", id: 374, img: "/img/items/seeds_sunflower.png" },
		{ name: "Beet", id: 449, img: "/img/items/seeds_beet.png" },
		{ name: "Rice", id: 631, img: "/img/items/seeds_rice.png" },
	];

	export function getFarmID() { return $('#croparea [data-farm]').data('farm'); }

	export function getNumberOfPlots() {
		return $("#crops").find(".cropitem,.plantseed").length;
	}

	export function getNumberOfEmptyPlots() {
		return $("#crops").find(".plantseed").length;
	}

	export function getNumberOfHarvestablePlots() {
		return $("#crops").find(".harvest").length;
	}

	export function getOwnedSeedCountMap() {
		return Object.fromEntries(
			$("select.seedid option").map<[number, number]>(function () {
				return [[parseInt($(this).val().toString()), parseInt($(this).data('amt'))]];
			}).get()
				// filter out 
				.filter(([k]) => k !== 0/*none*/ && k !== 238/*shovel*/)
		);
	}

	export async function setCurrentSeed(id: number) {
		return fetch(`worker.php?go=setfarmseedcounts&id=${id}&cachebuster=${Date.now()}`, { method: 'GET' }).then(r => r.text());
	}

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		const $target = $(`<div />`).insertAfter($(container).find("#croparea"));

		if (!$target.length) { return; }
		return new QuickSeeds({ target: $target[0], props: { seeds } });
	}

	export function setup() {
		FarmRPG.onPageInit("xfarm", init);
	}
}