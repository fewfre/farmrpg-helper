import { Asset } from "../../assets";
import { sleep, waitForElm } from "../../utils";

export class FishingBot extends EventTarget {
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
			if (!$("#fishinwater").length) {
				throw new Error("No fishing area detected");
			}
			while (this.getBaitCount() > 0) {
				await this.fishOne();
				if (this.stopRequested) break;
				await sleep(0.3, 0.4);
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
		await this.clickFish();
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

	private async catchFish() {
		if (!$(".fishcaught").length) {
			throw new Error("Cannot find fishing to catch")
		}
		$(".fishcaught").trigger("click");
	}

	private async clickFish() {
		if (!$("#fishinwater").length) {
			throw new Error("No fishing area detected")
		}
		const fish = await waitForElm(".fish.catch");
		fish.click();
		/*     var triesLeft = 500;
			while (triesLeft-- > 0) {
			  if($(".fish.catch").length) {
				$(".fish.catch").click();
					return;
			  }
			  await sleep(0.05);
			} */
		/*     if(triesLeft <= 0) {
			  throw new Error("Script gave up, couldn't find fish")
			} */
	}
	private getBaitCount() {
		return parseInt($("#baitarea strong").first().text() || "0");
	}
}