export namespace FarmRPG {
	export interface PageData {
		container: Element;
		name: string;
		url: string;
		view: any;
	}

	interface FarmRpgApp {
		onPageInit(page: string, callback: (data: PageData) => void): void;
		onPageBeforeRemove(page: string, callback: (data: PageData) => void): void;
		mainView: {
			router: {
				refreshPage(): void;
			}
		}
	}

	// @ts-ignore ts(2304)
	const app: FarmRpgApp = ((typeof unsafeWindow !== "undefined" ? unsafeWindow : window) as any).myApp;

	export function onPageInit(page: string, callback: (props: PageData) => void) {
		app.onPageInit(page, callback);
	}
	export function onPageBeforeRemove(page: string, callback: (props: PageData) => void) {
		app.onPageBeforeRemove(page, callback);
	}

	// Custom - triggers when you leave the specified page.
	export function onPageExit(page: string, callback: (props: PageData) => void) {
		let lastPage = null;
		FarmRPG.onPageInit("*", (props) => {
			if (lastPage === page && props.name !== page) {
				callback(props);
			}
			lastPage = props.name;
		});
	}

	export function refreshPage() {
		app.mainView.router.refreshPage();
	}
}