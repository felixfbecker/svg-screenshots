import './polyfill'

import { documentToSVG, inlineResources, formatXML } from 'dom-to-svg'
import { saveAs } from 'file-saver'

async function main(): Promise<void> {
	console.log('Content script running')

	const svgDocument = documentToSVG(document)

	console.log('Inlining resources')
	await inlineResources(svgDocument.documentElement)

	console.log('Pretty-printing SVG')
	const formattedSVGDocument = formatXML(svgDocument)

	const svgString = new XMLSerializer().serializeToString(formattedSVGDocument)

	const blob = new Blob([svgString], { type: 'image/svg+xml' })
	console.log('Downloading')
	saveAs(blob, `Screenshot ${document.title.replace(/["'/]/g, '')}.svg`)
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
