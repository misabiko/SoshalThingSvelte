export type ExtensionContext =
	{ id: null } |
	{ id: string } |
	{ id: string, available: true }

let extensionContext: ExtensionContext = { id: 'ialpimkfmdjoekolcmhnajfkmhchkmbd' }

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

				extensionContext = response
				resolve(response)
			})
		});
	}catch (cause: any) {
		console.dir(cause)
		extensionContext = { id: extensionContext.id }
		return extensionContext
	}
}