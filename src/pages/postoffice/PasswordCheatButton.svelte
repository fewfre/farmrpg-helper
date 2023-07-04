<script lang="ts">
	import { PostOfficePasswords } from ".";

	$: loading = false;
	$: noneLeft = false;

	async function onClick() {
		loading = true;
		const { allPasswords, usedPasswords } = await PostOfficePasswords.getPasswordData();
		loading = false;
		const passwords = allPasswords.filter((pw) => !usedPasswords.includes(pw));
		if (passwords.length <= 0) {
			noneLeft = true;
			return;
		}
		jQuery("#popw").val(passwords[0]);
	}
</script>

<button on:click={onClick} disabled={noneLeft || loading}>
	{#if loading}
		Loading...
	{:else if noneLeft}
		ALL USED
	{:else}
		🤖 CHEAT
		<abbr title="Passwords fetched from the buddy.farm passwords list: https://buddy.farm/passwords/">ⓘ</abbr>
	{/if}
</button>

<style>
	button {
		white-space: nowrap;
	}
</style>
