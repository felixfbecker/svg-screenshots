class ClipboardItem {
	readonly types: string[]
	constructor(data: { [mimeType: string]: Blob })
	getType(mimeType: string): Promise<Blob>
}

interface Clipboard {
	write(data: ClipboardItem[]): Promise<void>
}
