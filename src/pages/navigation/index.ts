import { FarmRPG } from '../../farmrpg';
import Shortcuts from './Shortcuts.svelte';

export namespace Navigation {
	function getFarmID() { return $('.view-main a[href^="xfarm.php?id="]').attr('href').match(/\?id=(\d*)/)[1]; }

	const LSKEY_USER_SECTIONS = "fewfh-shortcuts-custom";

	export interface ShortcutSection {
		section?: string;
		links: Array<{
			link: string;
			text: string;
			icon?: string;
			params?: string;
		}>;
	}
	export function getDefaultSections(): ShortcutSection[] {
		return [
			{
				links: [
					{ link: 'xfarm', text: 'Farm', params: `id=${getFarmID()}` },
					{ link: 'town', text: 'Town' },
					{ link: 'fish', text: 'Fish' },
					{ link: 'explore', text: 'Explore' },
					{ link: 'quests', text: 'Help' },
					{ link: 'kitchen', text: 'Kitchen' },
					{ link: 'pen', text: 'Raptors' },
				]
			},
			{
				section: 'Town',
				links: [
					{ link: 'market', text: 'Sell' },
					{ link: 'pets', text: 'Pets' },
					{ link: 'bank', text: 'Bank' },
					{ link: 'steakmarket', text: 'Steak' },
				]
			},
			{
				section: 'Daily',
				links: [
					{ link: 'daily', text: 'Chores' },
					{ link: 'well', text: 'Well' },
					{ link: 'crack', text: 'Vault' },
					{ link: 'spin', text: 'Wheel' },
					{ link: 'comm', text: 'Community Center' },
				]
			},
			// {
			// 	section: 'Skills',
			// 	links: [
			// 		{ link: 'progress', params: { type: 'Farming' }, icon: '/img/items/6137.png' },
			// 		{ link: 'progress', params: { type: 'Fishing' }, icon: '/img/items/7783.png' },
			// 		{ link: 'progress', params: { type: 'Crafting' }, icon: '/img/items/5868.png' },
			// 		{ link: 'progress', params: { type: 'Exploring' }, icon: '/img/items/6075.png' },
			// 		{ link: 'perks', text: 'Perks' },
			// 		{ link: 'mastery', text: 'Mastery' },
			// 		{ link: 'npclevels', text: 'Friendship' },
			// 	]
			// },
		];
	}

	export function saveUserShortcuts(sections: ShortcutSection[]) {
		localStorage.setItem(LSKEY_USER_SECTIONS, JSON.stringify(sections));
	}

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: { container: Element }) {
		// const $target = $('.view.view-left.navbar-through .page-content li:first-of-type').after(`<li />`);
		const $target = $(`<li />`).insertAfter($(container).find('.list-block li:first-of-type'));
		if (!$target.length) { return; }

		const lsSectionsString = localStorage.getItem(LSKEY_USER_SECTIONS);
		const mySections = !!lsSectionsString ? JSON.parse(lsSectionsString) : getDefaultSections();
		return new Shortcuts({ target: $target[0], props: { sections: mySections } });
	}

	export function setup() {
		// FarmRPG.onPageInit("index-left", init);
		init({ container: document.querySelector('.view.view-left.navbar-through .page') });
	}
}