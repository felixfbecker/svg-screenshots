import './polyfill'

import { documentToSVG, inlineResources } from 'dom-to-svg'
import { saveAs } from 'file-saver'
import { formatXML } from './serialize'

const svgNamespace = 'http://www.w3.org/2000/svg'

async function main(): Promise<void> {
	try {
		console.log('Content script running')

		if (document.querySelector('#svg-screenshot-selector')) {
			return
		}

		const { clientWidth, clientHeight } = document.documentElement

		const svgElement = document.createElementNS(svgNamespace, 'svg')
		svgElement.id = 'svg-screenshot-selector'
		svgElement.setAttribute('viewBox', `0 0 ${clientWidth} ${clientHeight}`)
		svgElement.style.position = 'fixed'
		svgElement.style.top = '0px'
		svgElement.style.left = '0px'
		svgElement.style.width = `${clientWidth}px`
		svgElement.style.height = `${clientHeight}px`
		svgElement.style.cursor = 'crosshair'
		svgElement.style.zIndex = '99999999'

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

		let captureArea: DOMRectReadOnly
		try {
			await new Promise((resolve, reject) => {
				window.addEventListener('keyup', event => {
					if (event.key === 'Escape') {
						reject(new Error('Aborted with Escape'))
					}
				})
				svgElement.addEventListener('mousedown', event => {
					const { clientX: startX, clientY: startY } = event
					svgElement.addEventListener('mousemove', event => {
						const positionX = Math.min(startX, event.clientX)
						const positionY = Math.min(startY, event.clientY)
						maskCutout.setAttribute('x', positionX.toString())
						maskCutout.setAttribute('y', positionY.toString())
						maskCutout.setAttribute('width', Math.abs(event.clientX - startX).toString())
						maskCutout.setAttribute('height', Math.abs(event.clientY - startY).toString())
					})
					svgElement.addEventListener('mouseup', resolve)
				})
				document.body.append(svgElement)
			})
			captureArea = maskCutout.getBoundingClientRect()
		} finally {
			svgElement.remove()
		}

		const svgDocument = documentToSVG(document, { captureArea })

		console.log('Inlining resources')
		await inlineResources(svgDocument.documentElement, {
			// Fetch resources from background page to not be constrained by CORS.
			fetchAsDataURL: async url => {
				const dataURL = await browser.runtime.sendMessage({ method: 'fetchResourceAsDataURL', payload: url })
				return new URL(dataURL)
			},
		})

		console.log('Pretty-printing SVG')
		const formattedSVGDocument = formatXML(svgDocument)

		const svgString = new XMLSerializer().serializeToString(formattedSVGDocument)

		const blob = new Blob([svgString], { type: 'image/svg+xml' })
		console.log('Downloading')
		saveAs(blob, `${document.title.replace(/["'/]/g, '')} Screenshot.svg`)
	} catch (error) {
		alert(error.message)
		throw error
	}
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
