export class AbortError extends Error {
	public readonly name = 'AbortError'
	constructor(message: string = 'Aborted') {
		super(message)
	}
}
