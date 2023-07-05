<script lang="ts">
	export let sections: {
		section?: string;
		links: { link: string; text?: string; icon?: string; params?: Record<string, string> }[];
	}[];
</script>

<div class="item-content">
	<div class="item-inner">
		<div style="display:grid; grid-template-columns: 1fr auto;">
			<div><i class="fa fa-fw fa-lightbulb-o" /></div>
			<div>
				<div class="item-title">&nbsp; Shortcuts</div>
				<div style="font-size: 14px;">
					{#each sections as { section, links }}
						<div>
							{#if section}
								<div style="margin-top:3px;"><strong>{section}</strong></div>
							{/if}
							{#each links as { link, text, icon, params }, i}
								{#if i != 0}&nbsp;• {/if}
								<a
									href="{link}.php{params ? '?' + new URLSearchParams(params).toString() : ''}"
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
			</div>
		</div>
	</div>
</div>
