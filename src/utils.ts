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

export function sleepCancelable(time: number, max?: number) {
	let timeoutId: number, resolveCallback: any;
	const promise = new Promise(resolve => {
		resolveCallback = resolve;
		timeoutId = setTimeout(resolve, max ? randomNumber(time * 1000, max * 1000) : time * 1000);
	});
	return {
		promise,
		timeoutId,
		cancel() {
			clearTimeout(timeoutId);
			resolveCallback();
		}
	};
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