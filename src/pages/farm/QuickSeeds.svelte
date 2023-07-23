<script lang="ts">
	import { PlayerFarm } from ".";
	import { Asset } from "../../assets";
	import { FarmRPG } from "../../farmrpg";
	import { buyItem } from "../../utils";

	const LSKEY_LAST_BOUGHT = "few-farm-lastbought";
	const LSKEY_COLLAPSED = "few-farm-seeds-collapsed";

	export let seeds: PlayerFarm.SeedProps[];

	$: buying = false;
	$: error = null;
	$: lastBought =
		localStorage.getItem(LSKEY_LAST_BOUGHT) != null && parseInt(localStorage.getItem(LSKEY_LAST_BOUGHT));
	async function onSeedClick(id: number) {
		buying = true;
		error = null;
		const harvestCount = PlayerFarm.getNumberOfHarvestablePlots();
		const emptyCount = PlayerFarm.getNumberOfEmptyPlots();
		const plantablePlotsCount = harvestCount + emptyCount;
		if (plantablePlotsCount <= 0) {
			error = "ERROR: No empty plots found";
			buying = false;
			return;
		}

		const ownedSeedsMap = PlayerFarm.getOwnedSeedCountMap();
		const currentSeedCount = ownedSeedsMap[id] ?? 0;
		const buyCount = currentSeedCount > plantablePlotsCount ? 0 : plantablePlotsCount - currentSeedCount;

		if (harvestCount > 0) {
			try {
				await fetch(`worker.php?go=harvestall&id=${PlayerFarm.getFarmID()}`, { method: "POST" });
			} catch (err) {
				console.error(err);
				error = "ERROR";
				buying = false;
				return;
			}
		}
		try {
			const res = await (buyCount > 0
				? buyItem(id, buyCount)
				: PlayerFarm.setCurrentSeed(id).then(() => "success"));
			if (res === "success") {
				await fetch(`worker.php?go=plantall&id=${PlayerFarm.getFarmID()}`, { method: "POST" });
				lastBought = id;
				localStorage.setItem(LSKEY_LAST_BOUGHT, id.toString());
				FarmRPG.refreshPage();
			} else {
				error = `ERROR: ${res || "blank response; unknown error"}`;
			}
		} catch (err) {
			console.error(err);
			error = "ERROR";
		}
		buying = false;
	}

	$: collapsed = localStorage.getItem(LSKEY_COLLAPSED) === "true";
	function onCollapseClick() {
		collapsed = !collapsed;
		collapsed ? localStorage.setItem(LSKEY_COLLAPSED, "true") : localStorage.removeItem(LSKEY_COLLAPSED);
	}
</script>

<div class="few-seedlist-container card">
	<div class="card-content">
		<div class="list-block">
			<div class="item-content">
				<div class="item-title">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span class="collapse-toggle-row" on:click={onCollapseClick}>
						<img
							class={collapsed ? "collapsed" : undefined}
							src={Asset.IMAGE_CEVRON_RIGHT}
							height="20"
							alt="collapse toggle"
						/>
						Quick buy and plant seeds
					</span>
					<!-- if a seed matches, show it -->
					{#each seeds.filter((s) => s.id === lastBought) as { id, name, img }}
						- Last: <button class="last-bought-button" on:click={() => onSeedClick(id)} disabled={buying}>
							<img src={img} alt={name} height="16" />{name}
						</button>
					{/each}
					{#if !collapsed}
						<br />
						<span style="font-size:11px; margin-left:16px;"
							>also harvests all finished plots to make room</span
						>
					{/if}
				</div>
				{#if error}<div style="color:red;">{error}</div>{/if}
			</div>
			{#if !collapsed}
				<ul>
					<li>
						<div class="item-content">
							<div class="item-inner seed-list">
								{#each seeds as { id, name, img }}
									<button on:click={() => onSeedClick(id)} disabled={buying}>
										<img src={img} alt={name} height="32" />
									</button>
								{/each}
							</div>
						</div>
					</li>
				</ul>
			{/if}
		</div>
	</div>
</div>

<style>
	.few-seedlist-container {
		border-top: 1px solid var(--fewfh-border-color);
		padding-top: 8px;
		padding-bottom: 7px;
	}
	.few-seedlist-container .item-content {
		display: block;
		min-height: auto;
	}

	.collapse-toggle-row:hover {
		text-decoration: underline;
	}
	.collapse-toggle-row img {
		vertical-align: middle;
		transform: rotate(90deg);
		transition: transform 0.35s;
		margin-bottom: 4px;
	}
	.collapse-toggle-row img.collapsed {
		transform: rotate(0);
	}

	.last-bought-button {
		display: inline-flex;
		gap: 2px;
		align-items: center;
		padding: 0 3px;
	}

	.seed-list {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		justify-content: center;
		padding: 8px 5px 7px;
	}
	.seed-list button {
		all: unset;
		border: 1px solid currentColor;
		line-height: 0;
		padding: 3px 8px;
		border-radius: 8px;
		transform: scale(1);
		transition: transform 0.35s;
	}
	.seed-list button:hover {
		transform: scale(1.1);
	}
	.seed-list button img {
		transform: rotate(0);
		transition: transform 0.35s;
	}
	.seed-list button:hover img {
		transform: rotate(8deg);
	}
	.seed-list button[disabled] {
		transform: scale(0);
		filter: grayscale(1);
	}
	.seed-list button[disabled] img {
		transform: rotate(0);
	}
</style>
