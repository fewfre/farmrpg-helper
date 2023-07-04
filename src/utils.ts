function randomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

// time in seconds
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