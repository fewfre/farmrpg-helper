<script lang="ts">
	import { Exploration } from ".";
	import { ExplorationBot } from "./ExplorationBot";
	const bot = Exploration.bot;

	$: active = bot.isActive;
	$: stopping = bot.isStopRequested;
	$: autoWaitOnStaminaRegen = Exploration.bot.isWaitForMoreStamina;

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

	function onWaitForStaminaRegenChanged() {
		autoWaitOnStaminaRegen = !autoWaitOnStaminaRegen;
		Exploration.bot.isWaitForMoreStamina = autoWaitOnStaminaRegen;
		autoWaitOnStaminaRegen
			? localStorage.setItem(Exploration.LSKEY_WAIT_FOR_STAMINA_REGEN, "true")
			: localStorage.removeItem(Exploration.LSKEY_WAIT_FOR_STAMINA_REGEN);
	}
</script>

<div class="card bot-card">
	<div class="card-content">
		<div class="list-block disable-select">
			<ul>
				<li>
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
				</li>
				<li>
					<div class="item-content">
						<div class="item-media" />
						<div class="item-inner">
							<div>
								<input
									type="checkbox"
									checked={autoWaitOnStaminaRegen}
									on:change={onWaitForStaminaRegenChanged}
								/>
								<abbr
									title="A biiit on the cheat-y side; but you do have to remain on the page, so semi fair"
									>Keep running</abbr
								>
								-
								<small>
									after stamina runs out, bot auto tries every 10 minutes until stopped or page
									changed. Note: increasing stamina manually during this (such as eating an apple)
									won't currently be detected - either toggle bot off/on or wait out the remaining
									minutes.
								</small>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.bot-card {
		border: 1px dashed currentColor;
		margin: 5px 0;
	}
	.item-content {
		cursor: pointer;
	}
</style>
