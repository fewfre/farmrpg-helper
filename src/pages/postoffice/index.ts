import { FarmRPG } from '../../farmrpg';
import PasswordCheatButton from './PasswordCheatButton.svelte';

export namespace PostOfficePasswords {
	async function getMailboxPasswords() {
		return fetch("https://buddy.farm/page-data/passwords/page-data.json").then(res => res.json())
			.then<string[]>(json => json.result.data.farmrpg.passwords.map(pw => pw.password));
	}
	async function getUsedMailboxPasswords() {
		return new Promise<string[]>((resolve) => {
			$('<div/>').load('popwlog.php', function () {
				resolve($(this).find(".list-block .item-title span:first-of-type").map((_, el) => $(el).text()).get());
			});
		});
	}

	let allPasswords: string[], usedPasswords: string[];
	export async function getPasswordData() {
		allPasswords ??= (await getMailboxPasswords()).map((pw) => pw.toLowerCase());
		usedPasswords ??= (await getUsedMailboxPasswords()).map((pw) => pw.toLowerCase());
		return { allPasswords, usedPasswords };
	}

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: FarmRPG.PageData) {
		const $target = $(container).find("#popw").closest(".item-inner").append(`<div />`);

		// When user submits, keep track of it to avoid having to fetch() `usedPasswords` every time.
		$(".popwbtn").on("click", function () {
			usedPasswords?.push($("#popw").val().toString());
		});

		if (!$target.length) { return; }
		return new PasswordCheatButton({ target: $target[0] });
	}

	export function setup() {
		FarmRPG.onPageInit("postoffice", init);
	}
}