import { Exploration } from './pages/area_exploration';
import { PlayerFarm } from './pages/farm';
import { Fishing } from './pages/fishing';
import { Mastery } from './pages/mastery';
import { Navigation } from './pages/navigation';
import { PostOfficePasswords } from './pages/postoffice';
import { Vault } from './pages/vault';
import './assets/theme.css';

// greasemonkey / other monkey supports for loading the script's CSS
// @ts-ignore ts(2304)
if (typeof GM_getResourceText !== 'undefined') {
	// @ts-ignore ts(2304)
	GM_addStyle(GM_getResourceText("scriptStyle"));
}

Navigation.setup();
Fishing.setup();
Exploration.setup();
PostOfficePasswords.setup();
Vault.setup();
Mastery.setup();
PlayerFarm.setup();