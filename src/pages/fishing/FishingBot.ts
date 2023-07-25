import { Asset } from "../../assets";
import { FarmRPG } from "../../farmrpg";
import { randomNumber, sleep, waitForElm } from "../../utils";

export class FishingBot extends EventTarget {
	static FINISHED = "FINISHED";

	private active: boolean = false;
	private stopRequested: boolean = false;
	private autoBuyWorms: boolean = false;

	constructor() {
		super();
	}

	get isActive(): boolean { return this.active; }
	get isStopRequested(): boolean { return this.stopRequested; }
	get isAutoBuyWorms(): boolean { return this.autoBuyWorms; }

	async start() {
		if (this.active) return;
		this.active = true;

		try {
			if (!$("#fishinwater").length) {
				throw new Error("No fishing area detected");
			}
			while (this.getBaitCount() > 0) {
				await this.fishOne();
				if (this.stopRequested) break;
				await sleep(0.3, 0.4);

				// Random number here probably doesn't help, but meh
				if (this.autoBuyWorms && this.getBaitCount() < randomNumber(50, 100)) {
					// No reason to `await`, just keep fishing.
					FarmRPG.buyItem(18, randomNumber(80, 100));
				}
			}
			this.active = false;
			this.stopRequested = false;
			this.dispatchEvent(new Event(FishingBot.FINISHED));
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

	private async fishOne() {
		const clickResult = await this.clickFish();
		// Meal worms have no catch modal
		if (clickResult === 'mealworm') {
			if (this.stopRequested) { return; }
			return await sleep(0.07, 0.185);
		}
		// We wait for catch modal - but if it doesn't open then we missed the fish and try again
		try {
			await waitForElm(".picker-catch.modal-in", { visible: true, timeout: 0.1 });
		} catch (err) {
			if (this.stopRequested) { return; }
			return await this.fishOne();
		};
		await sleep(0.33); // time for modal to animate in + small buffer
		if (this.stopRequested) { this.catchFish(); return; }
		await sleep(0.23, 0.888);
		await this.catchFish();
		await sleep(0.05, 0.115); // tiny delay before clicking next fish
	}

	private async clickFish() {
		if (!$("#fishinwater").length) {
			throw new Error("No fishing area detected")
		}
		const fish = await waitForElm(".fish.catch, .fish.fishcaught:not([src*='/splash'])", { visible: true });
		fish.click();
		return fish.classList.contains('fishcaught') ? 'mealworm' : true;
	}

	private async catchFish() {
		if (!$(".picker-catch .fishcaught").length) {
			throw new Error("Cannot find fishing to catch")
		}
		$(".picker-catch .fishcaught").trigger("click");
	}

	private getBaitCount() {
		return parseInt($("#baitarea strong").first().text() || "0");
	}

	public toggleAutoBuyWorms(val?: boolean) {
		this.autoBuyWorms = val ?? !this.autoBuyWorms;
	}
}