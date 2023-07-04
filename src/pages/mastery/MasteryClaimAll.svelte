<script lang="ts">
	import { sleep, waitForElm } from "../../utils";

	$: showButton = true;
	function onClick() {
		showButton = false;
		clickClaimBttnRecursive();
	}

	async function clickClaimBttnRecursive() {
		if (!jQuery(".claimbtn").length) return;
		jQuery(".claimbtn").first().click();
		await waitForElm(".modal-button", { timeout: 0.25 });
		await sleep(0.5);
		jQuery(".modal-button").first().click();
		await sleep(0.25);
		await clickClaimBttnRecursive();
	}
</script>

{#if showButton}
	<button style="margin-left:10px;" on:click={onClick}>CLAIM ALL</button>
{/if}
