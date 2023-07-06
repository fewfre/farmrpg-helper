import { FarmRPG } from '../../farmrpg';
import Shortcuts from './Shortcuts.svelte';

export namespace Navigation {
	function getFarmID() { return $('.view-main a[href^="xfarm.php?id="]').attr('href').match(/\?id=(\d*)/)[1]; }

	const sections = [
		{
			links: [
				{ link: 'xfarm', text: 'Farm', params: { id: getFarmID() } },
				{ link: 'town', text: 'Town' },
				{ link: 'fish', text: 'Fish' },
				{ link: 'explore', text: 'Explore' },
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

	//////////////////////////////////
	// Initialize
	//////////////////////////////////
	function init({ container }: { container: Element }) {
		// const $target = $('.view.view-left.navbar-through .page-content li:first-of-type').after(`<li />`);
		const $target = $(`<li />`).insertAfter($(container).find('.list-block li:first-of-type'));

		if (!$target.length) { return; }
		return new Shortcuts({ target: $target[0], props: { sections } });
	}

	export function setup() {
		// FarmRPG.onPageInit("index-left", init);
		init({ container: document.querySelector('.view.view-left.navbar-through .page') });
	}
}