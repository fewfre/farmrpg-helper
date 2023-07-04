<script lang="ts">
	import { Exploration } from ".";
	import { ExplorationBot } from "./ExplorationBot";
	const bot = Exploration.bot;

	$: active = bot.isActive;
	$: stopping = bot.isStopRequested;

	function onClick() {
		if (bot.isActive) {
			bot.stop();
		} else {
			bot.start();
		}
		active = bot.isActive;
		stopping = bot.isStopRequested;
	}

	bot.addEventListener(ExplorationBot.FINISHED, () => {
		active = bot.isActive;
		stopping = bot.isStopRequested;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="item-content {stopping ? 'disabled' : ''}" on:click={onClick}>
	<div class="item-media">🤖</div>
	<div class="item-inner">
		{#if stopping}
			❌ STOPPING
		{:else if active}
			❌ STOP EXPLORING
		{:else}
			AUTO EXPLORE
		{/if}
	</div>
</div>

<style>
	.item-content {
		cursor: pointer;
	}
</style>
