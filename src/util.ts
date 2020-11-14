export const svgNamespace = 'http://www.w3.org/2000/svg'

export class AbortError extends Error {
	public readonly name = 'AbortError'
	constructor(message: string = 'Aborted') {
		super(message)
	}
}

export const logErrors = <A extends any[]>(func: (...args: A) => Promise<void>) => (...args: A): void => {
	func(...args).catch(console.error)
}

/**
 * Returns a Promise that resolves once the given event emits.
 */
export const once = <T extends any[]>(
	emitter: WebExtEvent<(...args: T) => any>,
	filter: (...args: T) => boolean = () => true
): Promise<T> =>
	new Promise(resolve => {
		const listener = (...args: T): void => {
			if (!filter(...args)) {
				return
			}
			emitter.removeListener(listener)
			resolve(args)
		}
		emitter.addListener(listener)
	})
