export namespace WordleSolver {
	// https://raw.githubusercontent.com/gamescomputersplay/wordle/main/wordle.py
	// https://www.youtube.com/watch?v=sVCe779YC6A

	const COLUMNS = 4;
	const ALPHABET = "0123456789".split(""); //"abcdefghijklmnopqrstuvwxyz";
	const ALL_WORDS = Array.from({ length: Math.pow(10, COLUMNS) }).map((_, i) => i.toString().padStart(COLUMNS, "0")); // 0000-9999

	const LOC = {
		WRONG: 0,
		PARTIAL: 1,
		CORRECT: 2,
	} as const;

	type ResultNum = 0 | 1 | 2;

	const arrGen = <T>(len: number, fill?: T) => Array.from({ length: len }).fill(fill);
	const randomChoice = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
	const countInstances = <T>(arr: T[] | Set<T>, findMe: T) => Array.from(arr).filter((v) => v == findMe).length;
	const arrRemove = <T>(arr: T[], delMe: T) => { let i = arr.indexOf(delMe); return i > -1 && arr.splice(i, 1)[0]; };

	// https://stackoverflow.com/a/33034768
	const difference = (arr1, arr2) => Array.from(arr1).filter((x) => !Array.from(arr2).includes(x));

	class WordList {
		word_list: string[];
		letter_count: Record<string, number>;
		word_scores: Record<string, number>;
		position_letter_count: Record<string, number>[];
		position_word_scores: Record<string, number>;

		/**
		 * Class to load the list of words from file
		 * Initialized with the file(s) to load words from
		 * @param {()=>string[]} filesCallback
		 */
		constructor(filesCallback?: () => string[]) {
			// list of all the words
			this.word_list = filesCallback?.() ?? [];

			// letter counts in all words in the list: {"a": 100, "b": 200, ...}
			this.letter_count = {};

			// words' scores: {"apple": 100, "fruit": 200} etc
			// score is the sum of all letters' frequencies
			this.word_scores = {};

			// Same, but scores account for letter positions
			this.position_letter_count = arrGen(COLUMNS).map(() => ({}));
			this.position_word_scores = {};

			// Generate the word scores
			// (both positional and total)
			this.gen_word_scores();
			this.gen_positional_word_scores();
		}

		/**
		 * Copy of existing word list
		 * @returns {WordList}
		 */
		copy() {
			let new_word_list = new WordList();
			new_word_list.word_list = this.word_list.slice();
			new_word_list.word_scores = { ...this.word_scores };
			new_word_list.position_word_scores = { ...this.position_word_scores };
			return new_word_list;
		}

		/**
		 * Return count of remaining words: len(word_list)
		 * @returns {number} Length of word list
		 */
		get length() {
			return this.word_list.length;
		}

		/**
		 * Return random word from the word list
		 * @returns
		 */
		get_random_word() {
			return randomChoice(this.word_list);
		}

		/**
		 * Return the word with the highest score
		 * @param {boolean} use_position whether or not use position-based scores
		 * @returns
		 */
		get_hiscore_word(use_position = false) {
			const scores = use_position ? this.position_word_scores : this.word_scores;
			let best_word = "";
			let best_score = 0;
			for (let word of this.word_list) {
				if (scores[word] > best_score) {
					best_score = scores[word];
					best_word = word;
				}
			}
			return best_word;
		}

		/**
		 * Return the word with maximized number of unique "letters"
		 * @param {string[]} maximized_letters
		 * @returns
		 */
		get_maximized_word(maximized_letters) {
			this.gen_letter_count();
			let best_word = "";
			let best_score = 0;
			for (let word of this.word_list) {
				let this_score = 0;
				for (let letter of maximized_letters) {
					if (word.indexOf(letter) > -1) {
						this_score += 1;
					}
				}
				if (this_score > best_score) {
					best_score = this_score;
					best_word = word;
				}
			}
			return best_word;
		}

		/**
		 * Calculate counts of all letters in the word_list
		 */
		gen_letter_count() {
			this.letter_count = Object.fromEntries(ALPHABET.map((c) => [c, 0]));
			for (let word of this.word_list) {
				for (let letter of new Set(word)) {
					this.letter_count[letter] += 1;
				}
			}
		}

		/**
		 * calculate letter count for each letter position
		 */
		gen_positional_letter_count() {
			for (let i = 0; i < COLUMNS; i++) {
				this.position_letter_count[i] = Object.fromEntries(ALPHABET.map((c) => [c, 0]));
			}
			for (let word of this.word_list) {
				Array.from(word).forEach((letter, i) => {
					this.position_letter_count[i][letter] += 1;
				});
			}
		}
		/**
		 * Calculate scores for each word
		 */
		gen_word_scores() {
			this.gen_letter_count();
			this.word_scores = {};
			for (let word of this.word_list) {
				let word_score = 0;
				for (let letter of new Set(word)) {
					word_score += this.letter_count[letter];
				}
				this.word_scores[word] = word_score;
			}
		}

		/**
		 * Calculate positional scores for each word
		 */
		gen_positional_word_scores() {
			this.gen_positional_letter_count();
			this.position_word_scores = {};
			for (let word of this.word_list) {
				// Sum up scores, but if the letter is twice in the word
				// use the highest score only
				let word_score = {};
				Array.from(word).forEach((letter, i) => {
					if (word_score[letter] !== undefined) {
						word_score[letter] = this.position_letter_count[i][letter];
					} else {
						word_score[letter] = Math.max(word_score[letter], this.position_letter_count[i][letter]);
					}
				});
				this.position_word_scores[word] = Object.values(word_score).length;
			}
		}

		/**
		 * Removing words from the word list,
		 * by checking with teh three masks
		 * @param {string[][]} yes_mask
		 * @param {string[][]} no_mask
		 * @param {Set<string>[]} allowed_mask
		 */
		filter_by_mask(yes_mask, no_mask, allowed_mask) {
			let new_words = [];
			for (let word of this.word_list) {
				// Yes_mask: should have that letter in that place
				let noLettersMissingFromYesMask = !yes_mask.some(
					(must_have_letters, n) => !!must_have_letters.length && word[n] != must_have_letters[0]
				);
				if (noLettersMissingFromYesMask) {
					let noForbiddenLettersFound = true;
					// No_mask: should NOT have that letter in that place
					for (let n = 0; n < no_mask.length; n++) {
						let fail = false;
						const forbidden_letters = no_mask[n];
						for (let forbidden_letter of forbidden_letters) {
							if (word[n] == forbidden_letter) {
								fail = true;
							}
						}
						if (fail) {
							noForbiddenLettersFound = false;
							break;
						}
					}
					if (noForbiddenLettersFound) {
						// Allowed mask: should have allowed count of letters
						if (!ALPHABET.some((letter) => !allowed_mask[countInstances(word.split(""), letter)].has(letter))) {
							new_words.push(word);
						}
					}
				}
			}
			this.word_list = new_words;
		}
	}

	class Guess {
		word: string;
		result?: ResultNum[];
		guessed_correctly: boolean;

		/**
		 * Class for one guess attempt
		 * Contains the guessed word and list of results
		 * @param {string} guess_word
		 * @param {string?} correct_word
		 * @param {(0|1|2)[]?} guess_result
		 */
		constructor(guess_word, correct_word, guess_result) {
			/**
			 * @type {string}
			 */
			this.word = guess_word;
			// Set to True, but will be switched
			this.result = guess_result ?? this.get_result(correct_word);
			this.guessed_correctly = countInstances(this.result, LOC.CORRECT) === COLUMNS;
		}

		/**
		 * String representation looks like: ducky: G__Y_
		 * G, Y, _ is for green / yellow / grey
		 * @returns
		 */
		toString() {
			let out = `${this.word}: `;
			for (let letter_result of this.result) {
				if (letter_result == 2) {
					out += "G";
				} else if (letter_result == 1) {
					out += "Y";
				}
				if (letter_result == 0) {
					out += "_";
				}
				return out;
			}
		}

		/**
		 * Given the guessed and the right word
		 * generate the list of letter results:
		 * 0/1/2 meaning no/misplaced/correct
		 * @returns {(0|1|2)[]}
		 */
		get_result(correct_word) {
			let result = arrGen(COLUMNS, LOC.WRONG);
			// we are using a copy to blank guessed green and yellow
			// letters (to correctly display doubles)
			let correct_copy = [...correct_word];

			Array.from(this.word).forEach((guessed_char, i) => {
				if (guessed_char == correct_copy[i]) {
					result[i] = LOC.CORRECT;
					correct_copy[i] = "";
				}
			});

			for (let i = 0; i < this.word.length; i++) {
				if (correct_copy.includes(this.word[i]) && result[i] != LOC.CORRECT) {
					result[i] = LOC.PARTIAL;
					for (let j = 0; j < COLUMNS; j++) {
						if (correct_copy[j] == this.word[i]) {
							correct_copy[j] = "";
							break;
						}
					}
				}
			}
			if (countInstances(result, LOC.CORRECT) === COLUMNS) {
				this.guessed_correctly = true;
			}
			return result;
		}
	}

	class Wordle {
		correct_word: string;
		guesses: Guess[];

		/**
		 * Class representing one wordle game.
		 * methods include initiating a secret word,
		 * returning green/yellow/grey results,
		 * keeping track of guessed letters
		 * @param {string|"#random"|null} correct_word
		 */
		constructor(correct_word = "#random") {
			// the word to guess
			if (correct_word === "#random") {
				this.correct_word = puzzle_words.get_random_word();
			} else if (puzzle_words.word_list.indexOf(correct_word) > -1) {
				this.correct_word = correct_word;
			}
			// else leave as null

			// list of guesses so far
			/**
			 * @type {Guess[]}
			 * @public
			 */
			this.guesses = [];
		}
		toString() {
			return `::${this.correct_word}::` + this.guesses.map((guess, i) => `\n${i + 1}. ${guess}`).join("");
		}
		/**
		 * One turn of the game
		 * get guessed word, add new Guess in guesses list
		 * if guessed correctly, return True, else False
		 * @param {string} word
		 * @param {(0|1|2)[]?} result
		 */
		guess(word: string, result?: ResultNum[]) {
			this.guesses.push(new Guess(word, this.correct_word, result));
			// Return True/False if you got the word right
			return this.guesses.at(-1).guessed_correctly;
		}
	}

	class Player {
		yes_mask: string[][];
		no_mask: string[][];
		allowed_mask: Set<string>[];
		must_use: Set<string>;
		remaining_words: WordList;

		/**
		 * Default player (random)
		 * Guesses a random word from the whole list
		 * @param {WordList} guessing_words
		 */
		constructor(guessing_words: WordList) {
			// Mask
			// Yes mask: this letters should be in these places
			/**
			 * @type {string[][]}
			 */
			this.yes_mask = arrGen(COLUMNS).map(() => []);
			// No mask: this letters should NOT be in these places
			/**
			 * @type {string[][]}
			 */
			this.no_mask = arrGen(COLUMNS).map(() => []);

			// Count mask: Word can have (n) such letters
			// [[letters that can be 0 of], [1 of], [2 of], [3 of]]
			/**
			 * @type {Set<string>[]}
			 */
			// this.allowed_mask = arrGen(COLUMNS - 1).map(() => new Set(ALPHABET));
			this.allowed_mask = arrGen(COLUMNS + 1).map(() => new Set(ALPHABET));

			// which letter has to be in the word, from green and yellow letters
			this.must_use = new Set();

			// copy of the global word set (we'll be removing unfit words from it)
			/**
			 * @type {WordList}
			 */
			this.remaining_words = guessing_words.copy();
		}
		/**
		 * Removing words from the word list, that don't fit with
		 * what we know about the word (using mask and must_use)
		 */
		filter_word_list() {
			this.remaining_words.filter_by_mask(this.yes_mask, this.no_mask, this.allowed_mask);
		}
		/**
		 * Try to re-use "green" space by putting some remaining letters there
		 */
		reuse_green() {
			// Count vowels in teh list of letter
			// function count_vowels(letters) {
			//   let count = 0;
			//   let vowels = new Set("aoieu");
			//   for (let letter of letters) {
			//     if (vowels.indexOf(letter) > -1) {
			//       count += 1;
			//     }
			//   }
			//   return count;
			// }
			// Temp Yes mask is empty
			let temp_yes_mask = arrGen(COLUMNS).map(() => []);

			// Temp No mask is actual Yes mask
			let temp_no_mask = this.yes_mask;

			// Prioritize those that are present in all "allowed _mask[1]"
			// (meaning they have never been grey) minus all yellow and greens
			let greens_n_yellows = new Set();
			this.yes_mask.concat(this.no_mask).forEach((letters) => {
				for (let letter of letters) {
					greens_n_yellows.add(letter);
				}
			});

			// Add vowels if needed
			let priority_letters = new Set(difference(this.allowed_mask[1], greens_n_yellows));
			let letters_for_allowed_mask = priority_letters;
			// if (count_vowels(priority_letters) == 0) {
			//   letters_for_allowed_mask = new Set([...priority_letters, new Set("aoe")]);
			// }

			// Temp Allowed mask: priority letters and some vowels
			// [0] has all letters - any letter can be missed
			let temp_allowed_mask = [new Set(ALPHABET), ...arrGen(COLUMNS).map(() => new Set(letters_for_allowed_mask))];

			// Find the word to fit temporary mask, with maximized prioritized letters
			let temp_words = guessing_words.copy();
			temp_words.filter_by_mask(temp_yes_mask, temp_no_mask, temp_allowed_mask);
			if (temp_words.length > 0) {
				return temp_words.get_maximized_word(Array.from(priority_letters));
			}
			return "";
		}

		/**
		 * Pick the word from the list
		 * @returns
		 */
		make_guess() {
			// Use random word if:
			// 1. "scored" is no set
			// 2. "firstrandom" is set and this is the first guess
			// (word list has not been filtered yet)
			if (
				!params.includes("scored") ||
				(params.includes("firstrandom") && this.remaining_words.length == guessing_words.length)
			) {
				return this.remaining_words.get_random_word();
			}

			// list of masks' lengths
			let has_greens = COLUMNS - this.yes_mask.filter((y) => y.length === 0).length;
			// Conditions for "re-use green" logic:
			// has Green; more than 2 potential answers
			if (params.includes("easymode") && has_greens > 0 && this.remaining_words.length > 2) {
				// if reusing green is successful, return that word
				let reuse_green_word = this.reuse_green();
				if (reuse_green_word != "") return reuse_green_word;
			}

			// recount / don't recount all scores
			if (params.includes("recount")) {
				this.remaining_words.gen_word_scores();
				this.remaining_words.gen_positional_word_scores();
			}
			// use / don't use position letter weights
			if (params.includes("position")) {
				return this.remaining_words.get_hiscore_word(true);
			}
			return this.remaining_words.get_hiscore_word(false);
		}

		/**
		 * Track letters that should be in this place (from green)
		 * @param {Guess} guess
		 */
		update_yes_mask(guess) {
			guess.result.forEach((letter_result, i) => {
				if (letter_result == LOC.CORRECT) {
					// green: should have this letter here
					if (!this.yes_mask[i].includes(guess.word[i])) {
						this.yes_mask[i].push(guess.word[i]);
					}
				}
			});
		}
		/**
		 * Track letters that should not be in this place (from yellow)
		 * @param {Guess} guess
		 */
		update_no_mask(guess) {
			// Delete the letter in the same place in the mask
			guess.result.forEach((letter_result, i) => {
				if (letter_result == LOC.PARTIAL) {
					// yellow: should not have this letter here
					if (!this.no_mask[i].includes(guess.word[i])) {
						this.no_mask[i].push(guess.word[i]);
					}
				}
				// This is grey, but not the only letter in the word
				if (letter_result == LOC.WRONG && countInstances(guess.word, guess.word[i]) > 1) {
					if (!this.no_mask[i].includes(guess.word[i])) {
						this.no_mask[i].push(guess.word[i]);
					}
				}
			});
		}

		/**
		 * Track how many which letters should be in the word
		 * @param {Guess} guess
		 * @returns
		 */
		update_allowed_mask(guess: Guess) {
			// count colors for each letter, like this
			// {"a":[2,0], "b":[2,1], "c":[0]}
			let letter_count: Record<string, ResultNum[]> = {};
			Array.from(guess.word).forEach((letter, i) => {
				if (letter_count[letter]) {
					letter_count[letter].push(guess.result[i]);
				} else {
					letter_count[letter] = [guess.result[i]];
				}
			});
			// Go through each letter count and update count_mask
			Object.entries(letter_count).forEach(([letter, stats]) => {
				// Case Grey:
				// Word should have no more that {count of other numbers except 0}
				// of this letter. e.g. [0] - none [2,0] - 1, [2,1,0] - 2
				if (stats.includes(LOC.WRONG)) {
					let allowed_count = stats.length - countInstances(stats, LOC.WRONG);
					// for (let i = allowed_count + 1; i < COLUMNS - 1; i++) {
					for (let i = allowed_count + 1; i < COLUMNS; i++) {
						this.allowed_mask[i].delete(letter);
					}
				}
				// Case Yellow / Green
				// Word should have at leaset {count of 1&2s letters} of these
				if (stats.includes(LOC.PARTIAL) || stats.includes(LOC.CORRECT)) {
					let required_count = countInstances(stats, LOC.PARTIAL) + countInstances(stats, LOC.CORRECT);
					for (let i = 0; i < required_count; i++) {
						this.allowed_mask[i].delete(letter);
					}
				}
			});
		}

		/**
		 * Combined mask updating functions
		 * @param {Guess} guess
		 */
		update_mask_with_guess(guess) {
			this.update_yes_mask(guess);
			this.update_no_mask(guess);
			this.update_allowed_mask(guess);
		}

		/**
		 * Update allowed_mask, based on letter freq of remaining words
		 */
		update_mask_with_remaining_words() {
			// Update allow_mask, knowing letter count of remaining words
			this.remaining_words.gen_letter_count();
			Object.entries(this.remaining_words.letter_count).forEach(([letter, count]) => {
				// If there is no such words in the whole list
				// remove it from mask
				if (count == 0) {
					// for (let i = 1; i < COLUMNS - 2; i++) {
					for (let i = 1; i < this.allowed_mask.length; i++) {
						this.allowed_mask[i].delete(letter);
					}
				}
			});
		}

		/**
		 * Remove a word from possible guesses used to remove used words
		 * @param {string} word
		 */
		remove_word(word) {
			arrRemove(this.remaining_words.word_list, word);
		}
	}

	export function realtimeGameSolver() {
		const game = new Wordle(null);
		const player = new Player(guessing_words);

		return {
			getGuess() {
				return player.make_guess();
			},
			submitResult(players_guess: string, result: string | ResultNum[]) {
				// Play the guess, see if we are done
				const done = game.guess(
					players_guess,
					((typeof result === 'string' ? result.split("") : result)).map((n) => parseInt(n) as ResultNum)
				);

				// Post-guess action:
				// Remove the words we just played
				player.remove_word(players_guess);
				// Update mask with guess results
				player.update_mask_with_guess(game.guesses.at(-1));

				// Filter the word down according to new mask
				player.filter_word_list();

				// Update the mask according to remaining words
				player.update_mask_with_remaining_words();

				return done;
			},
		};
	}

	/**
   * Playing one round of Wordle using player strategy\n' +
  '    from PlayerType
   * @param {boolean} quiet
   * @param {*} correct_word
   * @returns
   */
	function play_one_game(quiet = true, correct_word = null) {
		if (!quiet) console.log("game started");
		const game = new Wordle("9876");
		const player = new Player(guessing_words);
		let done = false;

		// Cycle until we are done
		let count = 10;
		while (!done && count > 0) {
			// Make a guess
			let players_guess = player.make_guess();

			// Play the guess, see if we are done
			if (game.guess(players_guess)) {
				done = true;
			}
			// Post-guess action:
			// Remove the words we just played
			player.remove_word(players_guess);
			// Update mask with guess results
			player.update_mask_with_guess(game.guesses.at(-1));

			// Filter the word down according to new mask
			player.filter_word_list();

			// Update the mask according to remaining words
			player.update_mask_with_remaining_words();
			count--;
		}

		if (!quiet) console.log(game);

		if (game.guesses.at(-1).guessed_correctly) {
			return game.guesses;
		}
		return -1; // This shouldn't happen
	}

	// /**
	//  * Get couple of main statistics from the list of results
	//  * @param {any[]} results
	//  */
	// function parse_results(results) {
	//   let frequencies = {};
	//   let lengths = [];
	//   let complete = 0;
	//   let turns_sum = 0;
	//   for (let result of results) {
	// 	let length = result.length;
	// 	lengths.push(length);
	// 	if (frequencies[length] !== undefined) {
	// 	  frequencies[length] += 1;
	// 	} else {
	// 	  frequencies[length] = 1;
	// 	}
	// 	turns_sum += length;
	// 	if (length <= MAX_TURNS) {
	// 	  complete += 1;
	// 	}
	//   }
	//   console.log(`Wins: ${complete}, Losses: ${results.length - complete}`);
	//   console.log(`Winrate: ${(complete * 100) / results.length}%`); // console.log(`Winrate: ${complete*100/len(results):.1f}%`);

	//   if (complete > 0) {
	// 	console.log(`Average length: ${turns_sum / results.length}`); // console.log(`Average length: ${turns_sum/len(results):.1f}`);
	//   }
	//   console.log(`Median length: ${lengths.sort()[Math.floor(results.length / 2)]}`);
	// }

	/**
	 * launch the simulation
	 */
	export function main() {
		let start_time = Date.now();
		if (N_GAMES == 1) {
			play_one_game(false);
		} else {
			// simulation(N_GAMES);
		}
		console.log(`Time: ${Date.now() - start_time}`);
	}

	// Word lists to use:
	// List that wordle game uses as a target word
	const puzzle_words = new WordList(() => ALL_WORDS);
	// List that the "player" program uses
	const guessing_words = new WordList(() => ALL_WORDS);

	// Game length (the game will go on, but it will affect the % of wins)
	const MAX_TURNS = 6;

	// Player's settings:
	// With everything off uses the naive greedy method (limit the potential
	// answers and randomly chose a word from the remaining list)
	// "scored": weight words by the frequency of the words
	//   "recount": recalculate weights for every guess
	//   "firstrandom": random first guess
	//       (worse results but more interesting to watch)
	//   "position": use positional letter weights
	// "easymode": don't have to use current result (reuse green space)
	const params = ["scored", "recount", "firstrandom_off", "position", "easymode"];

	// Number of games to simulate
	// if == 1, plays one random game, shows how the game went
	// if == 2315, runs simulation for all Wordle words (for deterministic methods)
	// other numbers - play N_GAMES games with random words from puzzle_words
	const N_GAMES = 1; //2315;
}