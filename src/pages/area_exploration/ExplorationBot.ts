import { Asset } from "../../assets";
import { sleep } from "../../utils";

export class ExplorationBot extends EventTarget {
	static FINISHED = "FINISHED";

	private active: boolean = false;
	private stopRequested: boolean = false;

	constructor() {
		super();
	}

	get isActive(): boolean { return this.active; }
	get isStopRequested(): boolean { return this.stopRequested; }

	async start() {
		if (this.active) return;
		this.active = true;

		try {
			if (!$(".explorebtn").length) {
				throw new Error("No exploration area detected");
			}
			while (this.getStaminaCount() > 0) {
				await this.exploreOne();
				if (this.stopRequested) { break; }
				await sleep(0.12, 0.28);
			}
			this.active = false;
			this.stopRequested = false;
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