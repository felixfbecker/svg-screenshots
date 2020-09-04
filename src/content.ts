import './polyfill'

import { documentToSVG, inlineResources, formatXML } from 'dom-to-svg'
import { saveAs } from 'file-saver'

const svgNamespace = 'http://www.w3.org/2000/svg'

async function main(): Promise<void> {
	console.log('Content script running')

	const { clientWidth, clientHeight } = document.documentElement

	const svgElement = document.createElement('svg')
	svgElement.setAttribute('viewPort', `0 0 ${clientWidth} ${clientHeight}`)
	svgElement.style.position = 'fixed'
	svgElement.style.top = '0px'
	svgElement.style.left = '0px'
	svgElement.style.width = `${clientWidth}px`
	svgElement.style.height = `${clientHeight}px`

	const backdrop = document.createElementNS(svgNamespace, 'rect')
	backdrop.setAttribute('fill', 'rgba(0, 0, 0, 0.2)')
	svgElement.append(backdrop)

	const mask = document.createElementNS(svgNamespace, 'mask')
	mask.id = 'svg-screenshot-cutout'

	const maskBackground = document.createElementNS(svgNamespace, 'rect')
	maskBackground.setAttribute('fill', 'black')
	maskBackground.setAttribute('x', '0')
	maskBackground.setAttribute('y', '0')
	maskBackground.setAttribute('width', clientWidth.toString())
	maskBackground.setAttribute('height', clientHeight.toString())
	mask.append(maskBackground)

	const maskCutout = document.createElementNS(svgNamespace, 'rect')
	maskCutout.setAttribute('fill', 'white')
	mask.append(maskCutout)

	await new Promise(resolve => {
		svgElement.addEventListener('mousedown', event => {
			maskCutout.setAttribute('x', event.clientX.toString())
			maskCutout.setAttribute('y', event.clientY.toString())
			svgElement.addEventListener('mousemove', event => {
				maskCutout.setAttribute('width', event.clientX.toString())
				maskCutout.setAttribute('height', event.clientY.toString())
			})
			svgElement.addEventListener('mouseup', resolve)
		})
		document.body.append(svgElement)
	})

	maskCutout.getAttribute('width')

	const svgDocument = documentToSVG(document, {
		clientBounds: maskCutout.getBoundingClientRect(),
	})

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
