//TODO import from ../src/storages.js
export const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

export async function loadWithLocalStorage(page: Page, storages: {[key: string]: any}) {
	await page.goto('/');
	await page.mainFrame().evaluate((storages) => {
		for (const [key, storage] of Object.entries(storages))
			window.localStorage.setItem(key, JSON.stringify(storage));
	}, storages);
	await page.reload();
}

export async function clearLocalStorages(page: Page, keys: string[]) {
	await page.goto('/');
	await page.mainFrame().evaluate((keys) => {
		for (const key of keys)
			window.localStorage.removeItem(key);
	}, keys);
	await page.reload();
}