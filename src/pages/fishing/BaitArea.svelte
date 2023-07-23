<script lang="ts">
	import { Fishing } from ".";
	import { FarmRPG } from "../../farmrpg";
	import { buyItem, waitForElm } from "../../utils";

	$: buyingWorms = false;
	$: wormErrorText = null;
	$: autoBuyWorms = Fishing.bot.isAutoBuyWorms;

	async function onBuyWorms() {
		try {
			buyingWorms = true;
			const response = await buyItem(18, 200);
			buyingWorms = false;
			if (response == "success" || response === "") {
				FarmRPG.refreshPage();
			} else {
				wormErrorText = response;
			}
		} catch (err) {
			wormErrorText = "ERROR";
			console.error(err);
		}
	}

	function onChangeAutoBuyWorms() {
		autoBuyWorms = !autoBuyWorms;
		Fishing.bot.toggleAutoBuyWorms(autoBuyWorms);
		autoBuyWorms
			? localStorage.setItem(Fishing.LSKEY_AUTO_WORMS, "true")
			: localStorage.removeItem(Fishing.LSKEY_AUTO_WORMS);
	}

	$: loadingBaitList = true;
	let baits: Fishing.BaitData[];
	$: baits = [];
	$: currentBait = Fishing.getLastBait();
	waitForElm("#last_bait").then(async () => {
		currentBait = Fishing.getLastBait();
		try {
			loadingBaitList = false;
			baits = await Fishing.getCachedBaitData(Fishing.getLastBait());
			baits = baits.filter((b) => !b.selected);
		} catch (err) {
			console.error(err);
		}
	});

	$: baitListError = null;
	async function onBaitQuickSwapClicked(name: string) {
		try {
			const res = await fetch(`worker.php?go=selectbait&bait=${name}`, { method: "POST" }).then((r) => r.text());
			if (res === "success") {
				FarmRPG.refreshPage();
			} else {
				baitListError = `ERROR: ${res}`;
			}
		} catch (err) {
			baitListError = "ERROR";
			console.error(err);
		}
	}
</script>

<div class="card-content-inner" style="padding:5px">
	<div class="row" style="margin-bottom: 0">
		<div style="display:flex;">
			<div class="quick-swap-area">
				Quick Swap:
				{#if loadingBaitList}Loading...
				{:else if baitListError}{baitListError}
				{:else if baits.length <= 0}No other baits available
				{:else}
					{#each baits as { name, num, imgSrc }}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span class="quick-swap-bttn" title={name} on:click={() => onBaitQuickSwapClicked(name)}>
							<img src={imgSrc} height="14" alt={name} />&thinsp;{num}
						</span>
					{/each}
				{/if}
			</div>
			{#if currentBait === "Worms"}
				<button on:click={onBuyWorms} disabled={buyingWorms}>
					{#if wormErrorText}{wormErrorText}{:else}BUY 200 WORMS{/if}
				</button>

				<input type="checkbox" id="infiniteWorms" checked={autoBuyWorms} on:change={onChangeAutoBuyWorms} />
				<abbr title="Kinda EXTRA cheat-y; up to you. Will randomly buy somewhere between 50-100 left.">
					Auto buy worms
				</abbr>
			{/if}
		</div>
	</div>
</div>

<style>
	.quick-swap-area {
		display: flex;
		gap: 10px;
		margin-right: 30px;
	}
	.quick-swap-bttn {
		cursor: pointer;
	}
</style>
