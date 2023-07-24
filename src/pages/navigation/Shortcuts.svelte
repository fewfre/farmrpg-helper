<script lang="ts">
	import { Navigation } from ".";

	$: mode = "view";
	export let sections: Navigation.ShortcutSection[];

	const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

	$: mySections = clone(sections);
	$: editSections = clone(mySections);

	// Title functions
	function onStartEdit() {
		editSections = clone(mySections);
		mode = "edit";
	}
	function onSave() {
		mySections = clone(editSections); // update `sections` so cancel works as expected
		Navigation.saveUserShortcuts(editSections);
		mode = "view";
	}
	function onCancel() {
		editSections = clone(mySections);
		mode = "view";
	}
	function onReset() {
		mySections = editSections = Navigation.getDefaultSections();
		Navigation.saveUserShortcuts(mySections);
		mode = "view";
	}

	// Section functions
	function onSectionLabelChange(si: number, e: any) {
		editSections[si].section = e.target.value;
	}
	function shiftSection(i: number, up: boolean) {
		const sect = editSections.splice(i, 1)[0];
		editSections.splice(i + (up ? -1 : 1), 0, sect);
		editSections = clone(editSections);
	}
	function onSectionDelete(i: number) {
		editSections.splice(i, 1);
		editSections = clone(editSections);
	}
	function onAddSection() {
		editSections.push({ section: "", links: [] });
		editSections = clone(editSections);
	}

	// Link functions
	function onLinkFieldChange(si: number, li: number, field: keyof Navigation.ShortcutSection["links"][0], e: any) {
		editSections[si].links[li][field] = e.target.value;
	}

	function shiftLink(si: number, li: number, up: boolean) {
		const links = editSections[si].links;
		const sect = links.splice(li, 1)[0];
		links.splice(li + (up ? -1 : 1), 0, sect);
		editSections = clone(editSections);
	}
	function onLinkDelete(si: number, li: number) {
		const links = editSections[si].links;
		links.splice(li, 1);
		editSections = clone(editSections);
	}
	function onAddLink(si: number) {
		const links = editSections[si].links;
		links.push({ text: "", link: "" });
		editSections = clone(editSections);
	}
</script>

<div class="item-content">
	<div class="item-inner">
		<div style="display:grid; grid-template-columns: auto 1fr; width:100%;">
			<div><i class="fa fa-fw fa-lightbulb-o" /></div>
			<div>
				<div class="item-title">
					&nbsp; Shortcuts
					<span class="action-tray hlist">
						{#if mode === "edit"}
							<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
							<a on:click={onReset} style="color:red;">reset</a>
							<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
							<a on:click={onCancel}>cancel</a>
							<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
							<a on:click={onSave}>save</a>
						{:else}
							<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
							<a class="start-edit-button" on:click={onStartEdit}>edit</a>
						{/if}
					</span>
				</div>
				{#if mode === "edit"}
					<div class="edit-section" style="font-size: 14px;">
						{#each editSections as { section, links }, i}
							<div>
								<div class="edit-section-title">
									<input
										value={section ?? ""}
										placeholder="Section Name (optional)"
										on:change={(e) => onSectionLabelChange(i, e)}
									/>
									<span class="action-tray">
										(<span class="hlist">
											{#if i !== 0}
												<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
												<a on:click={() => shiftSection(i, true)}>↑</a>
											{/if}
											{#if i !== editSections.length - 1}
												<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
												<a on:click={() => shiftSection(i, false)}>↓</a>
											{/if}
											<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
											<a on:click={() => onSectionDelete(i)}>DEL</a>
										</span>)
									</span>
								</div>
								<ul class="edit-link-list">
									{#each links as { link, text, params }, j}
										<li>
											<input
												value={text ?? ""}
												placeholder="Label"
												on:change={(e) => onLinkFieldChange(i, j, "text", e)}
											/>
											<input
												value={link ?? ""}
												placeholder="URL page"
												on:change={(e) => onLinkFieldChange(i, j, "link", e)}
											/>
											<input
												value={params ?? ""}
												placeholder="Params"
												on:change={(e) => onLinkFieldChange(i, j, "params", e)}
											/>
											<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
											<a
												class="icon-btn {j == 0 ? 'hide' : ''}"
												on:click={() => shiftLink(i, j, true)}>↑</a
											>
											<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
											<a
												class="icon-btn {j == links.length - 1 ? 'hide' : ''}"
												on:click={() => shiftLink(i, j, false)}>↓</a
											>
											<!-- svelte-ignore a11y-missing-attribute a11y-click-events-have-key-events -->
											<a class="icon-btn" style="color:red;" on:click={() => onLinkDelete(i, j)}
												>⨯</a
											>
										</li>
									{/each}
									<li>
										<button style="grid-column: span 2;" on:click={() => onAddLink(i)}
											>Add new link</button
										>
									</li>
								</ul>
							</div>
						{/each}
						<div>
							<hr />

							<button on:click={() => onAddSection()}>Add new section</button>
						</div>
					</div>
				{:else}
					<div style="font-size: 14px;">
						{#each mySections as { section, links }}
							<div>
								{#if section}
									<div style="margin-top:3px;"><strong>{section}</strong></div>
								{/if}
								{#each links as { link, text, icon, params }, i}
									{#if i != 0}&nbsp;• {/if}
									<a
										href="{link}.php{params ? '?' + params : ''}"
										class="close-panel"
										data-view=".view-main"
									>
										{#if icon}
											<img src={icon} alt={text} height="12" />
										{/if}{text ?? ""}
									</a>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.action-tray {
		float: right;
	}

	.hlist {
		font-size: 12px;
	}
	.hlist a {
		cursor: pointer;
	}
	.hlist a + a:before {
		content: " | ";
		color: #999;
		cursor: none;
	}

	.start-edit-button {
		opacity: 0.5;
	}
	.start-edit-button:hover {
		opacity: 1;
	}

	.edit-section {
		margin-left: -22px;
		margin-right: -10px;
	}

	.edit-section-title {
		display: grid;
		grid-template-columns: 1fr auto;
		margin: 3px 0;
		border: 1px solid #999;
		padding: 1px 2px;
	}
	.edit-section-title input {
		min-width: 0;
	}

	ul.edit-link-list {
		padding-left: 0;
	}
	ul.edit-link-list li {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr auto auto auto;
	}
	ul.edit-link-list input {
		min-width: 30px;
		font-size: 12px;
	}

	.icon-btn {
		width: 14px;
		text-align: center;
		cursor: pointer;
	}
	.icon-btn:hover {
		opacity: 0.8;
	}
	.icon-btn.hide {
		visibility: hidden;
		pointer-events: none;
		cursor: default;
	}
</style>
