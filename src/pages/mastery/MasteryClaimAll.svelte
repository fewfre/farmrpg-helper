<script lang="ts">
	import { Mastery } from ".";
	import { FarmRPG } from "../../farmrpg";
	import { sleep, waitForElm } from "../../utils";

	const allIds = Mastery.getClaimIds();

	$: state = "button";
	$: progress = 0;

	async function onClick() {
		state = "claiming";

		await clickClaimButtonRecursive(allIds.slice());
		state = "done";
		await sleep(0.3);
		FarmRPG.refreshPage();
	}

	async function clickClaimButtonRecursive(ids: string[]) {
		const id = ids.pop();

		await Mastery.claimMastery(id);
		progress++;

		if (ids.length > 0) {
			await sleep(0.5);
			await clickClaimButtonRecursive(ids);
		}
	}
</script>

{#if state === "button"}
	<button style="margin-left:10px;" on:click={onClick}>🤖 QUICK CLAIM ALL</button>
{:else if state === "claiming"}
	<span style="margin-left:10px;">🤖 Claiming - Progress: {progress}/{allIds.length}</span>
{:else if state === "done"}
	<span style="margin-left:10px;">🤖 Claiming - Done!</span>
{/if}
