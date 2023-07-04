<script lang="ts">
	import { WordleSolver } from "./WordleSolver";

	const vaultTypeMap = { G: 0, Y: 1, B: 2 };

	function onClick() {
		const solver = WordleSolver.realtimeGameSolver();
		// find current guesses
		const prevGuesses = jQuery(".col-25[data-type]")
			.closest(".card-content-inner")
			.find(".row")
			.map((_, row) => {
				return {
					cellsResult: jQuery(row)
						.find("[data-type]")
						.map((_, g) => vaultTypeMap[jQuery(g).data("type")])
						.get(),
					cellsGuess: jQuery(row)
						.find("[data-type]")
						.map((_, g) => jQuery(g).text())
						.get(),
				};
			})
			.get();
		prevGuesses.forEach((prev) => solver.submitResult(prev.cellsGuess.join(""), prev.cellsResult));
		jQuery("#vaultcode").val(solver.getGuess());
	}
</script>

<button on:click={onClick}>🤖 GUESS</button>
