<script lang="ts">
	import { PlayerFarm } from ".";
	import { FarmRPG } from "../../farmrpg";
	import { buyItem } from "../../utils";

	export let seeds: PlayerFarm.SeedProps[];

	$: buying = false;
	$: error = null;
	async function onSeedClick(id: number) {
		buying = true;
		error = null;
		const buyCount = PlayerFarm.getNumberOfEmptyPlots();
		if (buyCount <= 0) {
			error = "ERROR: No empty plots found";
			buying = false;
			return;
		}
		try {
			const res = await buyItem(id, buyCount);
			if (res === "success") {
				await fetch(`worker.php?go=plantall&id=${PlayerFarm.getFarmID()}`, { method: "POST" });
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
					Quick buy and plant seeds
					<span style="font-size:11px;">(empty plots: {PlayerFarm.getNumberOfEmptyPlots()})</span>
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
	}
	.seed-list button {
		display: flex;
		align-items: center;
	}
</style>
