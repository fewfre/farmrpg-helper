import { Framework7 } from "./utils/framework7";

export namespace FarmRPG {

	/////////////////////////////////
	// Workers
	/////////////////////////////////
	export async function fetchWorker(go: string, params?: Record<string | number, string | number>, method = 'POST') {
		const paramsString = params ? `&${new URLSearchParams(params as any).toString()}` : ';'
		return fetch(`worker.php?go=${go}${paramsString}`, { method }).then(r => r.text())
	}

	export async function buyItem(id: string | number, qty: number | string) {
		const resp = await fetchWorker('buyitem', { id, qty });
		// If number is returned then we bought to much - buy again at specified amount
		if (!Number.isNaN(Number.parseInt(resp))) { return buyItem(id, resp); }
		return resp;
	}

	/////////////////////////////////
	// Global Helpers
	/////////////////////////////////
	const cachedLevels = {
		farming: 0,
		fishing: 0,
		crafting: 0,
		exploring: 0,
		cooking: 0,
	};
	/**
	 * @returns map of levels; level is 0 if undefined
	 */
	export function getSkillLevels() {
		if ($(`[href="progress.php?type=Farming"]`).length) {
			cachedLevels.farming = parseInt($(`[href="progress.php?type=Farming"]`).parent().text().replaceAll(/[^\d]/g, "") || '0');
			cachedLevels.fishing = parseInt($(`[href="progress.php?type=Fishing"]`).parent().text().replaceAll(/[^\d]/g, "") || '0');
			cachedLevels.crafting = parseInt($(`[href="progress.php?type=Crafting"]`).parent().text().replaceAll(/[^\d]/g, "") || '0');
			cachedLevels.exploring = parseInt($(`[href="progress.php?type=Exploring"]`).parent().text().replaceAll(/[^\d]/g, "") || '0');
			cachedLevels.cooking = parseInt($(`[href="progress.php?type=Cooking"]`).parent().text().replaceAll(/[^\d]/g, "") || '0');
		}
		return cachedLevels;
	}

	/////////////////////////////////
	// Framework7 helper methods
	/////////////////////////////////
	export const onPageInit = Framework7.onPageInit;
	export const onPageBeforeRemove = Framework7.onPageBeforeRemove;
	// Custom - triggers when you leave the specified page.
	export const onPageExit = Framework7.onPageExit;
	export const refreshPage = Framework7.refreshPage;
}