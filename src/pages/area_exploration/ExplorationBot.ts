import { Asset } from "../../assets";
import { sleep, sleepCancelable } from "../../utils";

export class ExplorationBot extends EventTarget {
	static FINISHED = "FINISHED";

	private active: boolean = false;
	private stopRequested: boolean = false;
	private waitForMoreStamina: boolean = true;

	private listOfCancelFunctions: Array<() => void> = [];

	constructor() {
		super();
	}

	get isActive(): boolean { return this.active; }
	get isStopRequested(): boolean { return this.stopRequested; }
	get isWaitForMoreStamina(): boolean { return this.waitForMoreStamina; }
	set isWaitForMoreStamina(val: boolean) {
		this.waitForMoreStamina = val;
		if (!val) { this.fireAllCancelFunctions(); }
	}

	async start() {
		if (this.active) return;
		this.active = true;
		this.listOfCancelFunctions = [];

		try {
			if (!$(".explorebtn").length) {
				throw new Error("No exploration area detected");
			}
			while (this.getStaminaCount() > 0 || this.waitForMoreStamina) {
				if (this.getStaminaCount() <= 0 && this.waitForMoreStamina) {
					const { promise, cancel } = sleepCancelable(9.5 * 60, 10 * 60);
					this.listOfCancelFunctions.push(cancel);
					await promise;
					// no need to refresh page; even though page still says 0 stamina, clicking the button still works
				}
				await this.exploreOne();
				if (this.stopRequested) { break; }
				await sleep(0.12, 0.28);
			}
			this.active = false;
			this.stopRequested = false;
			this.listOfCancelFunctions = [];
			this.dispatchEvent(new Event(ExplorationBot.FINISHED));
			Asset.SOUND_FINISHED.play();
		}
		catch (e) {
			alert(e.message);
		}
	}

	stop() {
		if (this.stopRequested || !this.active) return;
		this.stopRequested = true;
		this.fireAllCancelFunctions();
	}
	fireAllCancelFunctions() {
		this.listOfCancelFunctions.forEach(fn => fn());
	}

	private async exploreOne() {
		if (!$(".explorebtn").length) {
			throw new Error("No exploration area detected");
		}
		$(".explorebtn").trigger("click");
	}
	private getStaminaCount() {
		return parseInt($("#stamina").text() || "0");
	}
}