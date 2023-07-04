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

	const app: FarmRpgApp = (window as any).myApp;

	// export function setup() {
	// 	app = (window as any).myApp;
	// }

	export function onPageInit(page: string, callback: (props: PageData) => void) {
		app.onPageInit(page, callback);
	}
	export function onPageBeforeRemove(page: string, callback: (props: PageData) => void) {
		app.onPageBeforeRemove(page, callback);
	}

	export function refreshPage() {
		app.mainView.router.refreshPage();
	}
}