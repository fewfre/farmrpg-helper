import { FarmRPG } from '../../farmrpg';
import QuickSeeds from './QuickSeeds.svelte';

export namespace PlayerFarm {
	export interface SeedProps { name: string; id: number; level: number, img: string; }
	const seeds: SeedProps[] = [
		{ name: "Pepper", id: 12, level: 0, img: "/img/items/seeds_peppers.png" },
		{ name: "Carrot", id: 20, level: 2, img: "/img/items/seeds_carrots.png" },
		{ name: "Pea", id: 28, level: 4, img: "/img/items/seeds_peas.png" },
		{ name: "Cucumber", id: 30, level: 6, img: "/img/items/seeds_cucumber.png" },
		{ name: "Eggplant", id: 14, level: 8, img: "/img/items/seeds_eggplants.png" },
		{ name: "Radish", id: 32, level: 10, img: "/img/items/seeds_radish.png" },
		{ name: "Onion", id: 34, level: 12, img: "/img/items/seeds_onions.png" },
		{ name: "Hops", id: 47, level: 14, img: "/img/items/seeds_hops.png" },
		{ name: "Potato", id: 49, level: 16, img: "/img/items/seeds_potato.png" },
		{ name: "Tomato", id: 16, level: 18, img: "/img/items/seeds_tomato.png" },
		{ name: "Leek", id: 51, level: 20, img: "/img/items/seeds_leek.png" },
		{ name: "Watermelon", id: 60, level: 23, img: "/img/items/seeds_watermelon.png" },
		{ name: "Corn", id: 64, level: 26, img: "/img/items/seeds_corn.png" },
		{ name: "Cabbage", id: 66, level: 30, img: "/img/items/seeds_cabbage.png" },
		{ name: "Pine", id: 410, level: 40, img: "/img/items/seeds_pine.png" },
		{ name: "Pumpkin", id: 68, level: 40, img: "/img/items/seeds_pumpkin.png" },
		{ name: "Wheat", id: 70, level: 50, img: "/img/items/seeds_wheet.png" },
		{ name: "Mushroom", id: 395, level: 60, img: "/img/items/seeds_mushroom.png" },
		{ name: "Broccoli", id: 257, level: 60, img: "/img/items/seeds_broccoli.png" },
		{ name: "Cotton", id: 255, level: 70, img: "/img/items/seeds_cotton.png" },
		{ name: "Sunflower", id: 374, level: 80, img: "/img/items/seeds_sunflower.png" },
		{ name: "Beet", id: 449, level: 90, img: "/img/items/seeds_beet.png" },
		{ name: "Rice", id: 631, level: 91, img: "/img/items/seeds_rice.png" },
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