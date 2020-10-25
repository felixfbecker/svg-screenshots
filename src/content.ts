import './polyfill'

import { documentToSVG, inlineResources, formatXML } from 'dom-to-svg'
import { saveAs } from 'file-saver'

const svgNamespace = 'http://www.w3.org/2000/svg'

async function main(): Promise<void> {
	try {
		console.log('Content script running')

		const { clientWidth, clientHeight } = document.documentElement

		const svgElement = document.createElementNS(svgNamespace, 'svg')
		svgElement.setAttribute('viewBox', `0 0 ${clientWidth} ${clientHeight}`)
		svgElement.style.position = 'fixed'
		svgElement.style.top = '0px'
		svgElement.style.left = '0px'
		svgElement.style.width = `${clientWidth}px`
		svgElement.style.height = `${clientHeight}px`
		svgElement.style.cursor = 'crosshair'

		const backdrop = document.createElementNS(svgNamespace, 'rect')
		backdrop.setAttribute('x', '0')
		backdrop.setAttribute('y', '0')
		backdrop.setAttribute('width', clientWidth.toString())
		backdrop.setAttribute('height', clientHeight.toString())
		backdrop.setAttribute('fill', 'rgba(0, 0, 0, 0.5)')
		backdrop.setAttribute('mask', 'url(#svg-screenshot-cutout)')
		svgElement.append(backdrop)

		const mask = document.createElementNS(svgNamespace, 'mask')
		svgElement.prepend(mask)
		mask.id = 'svg-screenshot-cutout'

		const maskBackground = document.createElementNS(svgNamespace, 'rect')
		maskBackground.setAttribute('fill', 'white')
		maskBackground.setAttribute('x', '0')
		maskBackground.setAttribute('y', '0')
		maskBackground.setAttribute('width', clientWidth.toString())
		maskBackground.setAttribute('height', clientHeight.toString())
		mask.append(maskBackground)

		const maskCutout = document.createElementNS(svgNamespace, 'rect')
		maskCutout.setAttribute('fill', 'black')
		mask.append(maskCutout)

		let screenshotBounds: DOMRectReadOnly
		try {
			await new Promise((resolve, reject) => {
				svgElement.addEventListener('mousedown', event => {
					const { clientX: cutoutX, clientY: cutoutY } = event
					maskCutout.setAttribute('x', cutoutX.toString())
					maskCutout.setAttribute('y', cutoutY.toString())
					svgElement.addEventListener('mousemove', event => {
						maskCutout.setAttribute('width', (event.clientX - cutoutX).toString())
						maskCutout.setAttribute('height', (event.clientY - cutoutY).toString())
					})
					window.addEventListener('keyup', event => {
						if (event.key === 'Escape') {
							reject(new Error('Aborted with Escape'))
						}
					})
					svgElement.addEventListener('mouseup', resolve)
				})
				document.body.append(svgElement)
			})
			screenshotBounds = maskCutout.getBoundingClientRect()
		} finally {
			svgElement.remove()
		}

		const svgDocument = documentToSVG(document, {
			clientBounds: screenshotBounds,
		})

		console.log('Inlining resources')
		await inlineResources(svgDocument.documentElement)

		console.log('Pretty-printing SVG')
		const formattedSVGDocument = formatXML(svgDocument)

		const svgString = new XMLSerializer().serializeToString(formattedSVGDocument)

		const blob = new Blob([svgString], { type: 'image/svg+xml' })
		console.log('Downloading')
		saveAs(blob, `Screenshot ${document.title.replace(/["'/]/g, '')}.svg`)
	} catch (error) {
		alert(error.message)
		throw error
	}
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
