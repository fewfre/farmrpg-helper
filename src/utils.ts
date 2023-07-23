export function randomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

/**
 * `async` function to sleep for x seconds
 * @param time in seconds
 * @param max in seconds - will cause sleep to be a random number between `time` and `max` seconds
 */
export async function sleep(time: number, max?: number) {
	return new Promise(resolve => {
		setTimeout(resolve, max ? randomNumber(time * 1000, max * 1000) : time * 1000);
	});
}

// https://stackoverflow.com/a/61511955
interface WaitForElmOptions { target?: Element, config?: MutationObserverInit, timeout?: number, visible?: boolean }
export function waitForElm(selector, options: WaitForElmOptions = {}) {
	return new Promise<HTMLElement>((resolve, reject) => {
		const isVisible = (selector) => $(selector).is(':visible') && parseInt($(selector).css('opacity')) > 0.1;

		if ($(selector).length && (!options.visible || isVisible(selector))) {
			return resolve($(selector + ':visible').first()[0]);
		}

		const observer = new MutationObserver(mutations => {
			if ($(selector).length && (!options.visible || isVisible(selector))) {
				resolve($(selector + ':visible').first()[0]);
				observer.disconnect();
			}
		});

		if (options.timeout) {
			sleep(options.timeout).then(() => {
				observer.disconnect();
				reject(new Error("observer timed out"));
			});
		}

		observer.observe(options.target || document.body, {
			attributes: true,
			childList: true,
			subtree: true,
			...options.config
		});
	});
}

export async function buyItem(id, qty) {
	return fetch(`worker.php?go=buyitem&id=${id}&qty=${qty}`, { method: 'POST' })
		.then(r => r.text())
		.then(data => {
			// If number is returned then we bought to much - buy again at specified amount
			if (!Number.isNaN(Number.parseInt(data))) { return buyItem(id, data); }
			return data;
		});
}

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