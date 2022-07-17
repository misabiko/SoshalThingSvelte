import 'styles/global.sass'
import './services/twitter/endpoints'
import './services/dummy/endpoints'
import SoshalThing from "./SoshalThing.svelte"
import {loadMainStorage, loadTimelines} from './storages'

const {fullscreen} = loadMainStorage();
const initTimelines = loadTimelines();

//TODO scroll wrong direction

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		initTimelines,
		fullscreen,
	}
})