<script lang="ts">
	import { Fishing } from ".";
	import { FishingBot } from "./FishingBot";
	const bot = Fishing.bot;

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

	bot.addEventListener(FishingBot.FINISHED, () => {
		active = bot.isActive;
		stopping = bot.isStopRequested;
	});
</script>

<button on:click={onClick} disabled={stopping}>
	{#if stopping}
		🤖❌ STOPPING
	{:else if active}
		🤖❌ STOP FISHING
	{:else}
		🤖 AUTO FISH
	{/if}
</button>
