<script lang="ts">
	import { PlayerFarm } from ".";
	import { FarmRPG } from "../../farmrpg";
	import { buyItem } from "../../utils";

	export let seeds: PlayerFarm.SeedProps[];

	$: buying = false;
	$: error = null;
	$: lastBought =
		localStorage.getItem("few-farm-lastbought") != null && parseInt(localStorage.getItem("few-farm-lastbought"));
	async function onSeedClick(id: number) {
		buying = true;
		error = null;
		const harvestCount = PlayerFarm.getNumberOfHarvestablePlots();
		const emptyCount = PlayerFarm.getNumberOfEmptyPlots();
		const buyCount = harvestCount + emptyCount;
		if (buyCount <= 0) {
			error = "ERROR: No empty plots found";
			buying = false;
			return;
		}
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
			const res = await buyItem(id, buyCount);
			if (res === "success") {
				await fetch(`worker.php?go=plantall&id=${PlayerFarm.getFarmID()}`, { method: "POST" });
				lastBought = id;
				localStorage.setItem("few-farm-lastbought", id.toString());
				FarmRPG.refreshPage();
			} else {
				error = `ERROR: ${res || "blank response; inventory already full?"}`;
			}
		} catch (err) {
			console.error(err);
			error = "ERROR";
		}
		buying = false;
	}
</script>

<div class="card">
	<div class="card-content">
		<div class="list-block">
			<div class="item-content" style="display:block; min-height: auto;">
				<div class="item-title">
					Quick buy and plant seeds<!-- if a seed matches, show it -->
					{#each seeds.filter((s) => s.id === lastBought) as { id, name, img }}
						- Last: <button class="last-bought-button" on:click={() => onSeedClick(id)} disabled={buying}>
							<img src={img} alt={name} height="16" />{name}
						</button>
					{/each}
					<br />
					<span style="font-size:11px;">also harvests all finished plots to make room</span>
				</div>
				{#if error}<div style="color:red;">{error}</div>{/if}
			</div>
			<ul>
				<li>
					<div class="item-content">
						<div class="item-inner seed-list">
							{#each seeds as { id, name, img }}
								<button on:click={() => onSeedClick(id)} disabled={buying}>
									<img src={img} alt={name} height="20" />{name}
								</button>
							{/each}
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.seed-list {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		justify-content: center;
		padding: 8px 5px 7px;
	}
	.seed-list button {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.last-bought-button {
		display: inline-flex;
		gap: 2px;
		align-items: center;
		padding: 0 3px;
	}
</style>
