import {readable, writable} from 'svelte/store'
import {MAIN_STORAGE_KEY} from '../storages'

export type ExtensionContext =
	{ id: null, available: false } |
	{ id: string, available: false } |
	{ id: string, available: true }

const EXTENSION_ID_STORAGE_KEY = `${MAIN_STORAGE_KEY} Extension Id`

let extensionContext: Readonly<ExtensionContext> = {
	id: localStorage.getItem(EXTENSION_ID_STORAGE_KEY),
	available: false,
}


//TODO Try unifying as a custom readable store?
export const extensionContextStore = writable<ExtensionContext>(extensionContext)
const unsubscribe = extensionContextStore.subscribe(value => {
	extensionContext = value
})

export async function fetchExtension<T>(service: string, request: string, url: string, method = 'GET', body?: any): Promise<T> {
	if (extensionContext.id === null)
		throw new Error('No extension id')

	try {
		return await new Promise((resolve, reject) => {
			const timeout = 5000
			const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout)

			//TODO Cancel request on timeout
			//TODO Add setting or detect extension id
			chrome.runtime.sendMessage(extensionContext.id as string, {
				soshalthing: true,
				service,
				request,
				url,
				method,
				body,
			}, response => {
				clearTimeout(timeoutId)

				extensionContextStore.update(ctx => {
					ctx.available = true
					return ctx
				})
				resolve(response)
			})
		});
	}catch (cause: any) {
		throw new Error(`Failed to fetch from extension\n${JSON.stringify(cause, null, '\t')}`);
	}
}

export async function extensionCheck(): Promise<ExtensionContext> {
	if (extensionContext.id === null)
		throw new Error('No extension id')

	try {
		return await new Promise((resolve, reject) => {
			const timeout = 3000
			const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout)

			chrome.runtime.sendMessage(extensionContext.id as string, {
				soshalthing: true,
				request: 'extensionCheck',
			}, (response: ExtensionContext) => {
				clearTimeout(timeoutId)

				if (!response.id) {
					extensionContextStore.set({
						id: extensionContext.id,
						available: false
					})
					console.error(response)
					reject(response)
				}else {
					extensionContextStore.set(response)
					localStorage.setItem(EXTENSION_ID_STORAGE_KEY, response.id)
					console.log('Extension available!')
					resolve(response)
				}
			})
		});
	}catch (cause: any) {
		console.dir(cause)
		extensionContextStore.set({
			id: extensionContext.id,
			available: false,
		})
		return extensionContext
	}
}