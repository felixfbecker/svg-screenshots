import { SvgoPlugin } from 'svgo'
import js2svg from 'svgo/lib/svgo/js2svg'
import plugins from 'svgo/lib/svgo/plugins'
import svg2js from 'svgo/lib/svgo/svg2js'
import cleanupAttrs from 'svgo/plugins/cleanupAttrs'
import cleanupEnableBackground from 'svgo/plugins/cleanupEnableBackground'
import cleanupIDs from 'svgo/plugins/cleanupIDs'
import cleanupListOfValues from 'svgo/plugins/cleanupListOfValues'
import cleanupNumericValues from 'svgo/plugins/cleanupNumericValues'
import collapseGroups from 'svgo/plugins/collapseGroups'
import convertColors from 'svgo/plugins/convertColors'
import convertEllipseToCircle from 'svgo/plugins/convertEllipseToCircle'
import convertPathData from 'svgo/plugins/convertPathData'
import convertStyleToAttrs from 'svgo/plugins/convertStyleToAttrs'
import convertTransform from 'svgo/plugins/convertTransform'
import inlineStyles from 'svgo/plugins/inlineStyles'
import mergePaths from 'svgo/plugins/mergePaths'
import minifyStyles from 'svgo/plugins/minifyStyles'
import moveElemsAttrsToGroup from 'svgo/plugins/moveElemsAttrsToGroup'
import moveGroupAttrsToElems from 'svgo/plugins/moveGroupAttrsToElems'
import removeAttrs from 'svgo/plugins/removeAttrs'
import removeComments from 'svgo/plugins/removeComments'
import removeDoctype from 'svgo/plugins/removeDoctype'
import removeEditorsNSData from 'svgo/plugins/removeEditorsNSData'
import removeEmptyAttrs from 'svgo/plugins/removeEmptyAttrs'
import removeEmptyContainers from 'svgo/plugins/removeEmptyContainers'
import removeEmptyText from 'svgo/plugins/removeEmptyText'
import removeMetadata from 'svgo/plugins/removeMetadata'
import removeNonInheritableGroupAttrs from 'svgo/plugins/removeNonInheritableGroupAttrs'
import removeScriptElement from 'svgo/plugins/removeScriptElement'
import removeUnknownsAndDefaults from 'svgo/plugins/removeUnknownsAndDefaults'
import removeUselessDefs from 'svgo/plugins/removeUselessDefs'
import removeUselessStrokeAndFill from 'svgo/plugins/removeUselessStrokeAndFill'
import removeViewBox from 'svgo/plugins/removeViewBox'
import removeXMLProcInst from 'svgo/plugins/removeXMLProcInst'
import reusePaths from 'svgo/plugins/reusePaths'

removeAttrs.params.attrs = ['data-.*', 'class']

const pluginsArray = [
	removeDoctype,
	removeXMLProcInst,
	removeComments,
	removeMetadata,
	removeEditorsNSData,
	cleanupAttrs,
	inlineStyles,
	minifyStyles,
	convertStyleToAttrs,
	cleanupIDs,
	removeUselessDefs,
	cleanupNumericValues,
	cleanupListOfValues,
	convertColors,
	removeUnknownsAndDefaults,
	removeNonInheritableGroupAttrs,
	removeUselessStrokeAndFill,
	removeViewBox,
	cleanupEnableBackground,
	// Bug: removes <mask>
	// removeHiddenElems,
	removeEmptyText,
	moveElemsAttrsToGroup,
	moveGroupAttrsToElems,
	collapseGroups,
	convertPathData,
	convertTransform,
	convertEllipseToCircle,
	removeEmptyAttrs,
	removeEmptyContainers,
	mergePaths,
	// This currently throws an error
	// removeOffCanvasPaths,
	reusePaths,
	removeAttrs,
	removeScriptElement,
	// Bug: when this is run it removes the xlink namespace, but reusePaths adds <use> elements with xlink:href
	// without making sure the namespace exists
	// removeUnusedNS,
]
for (const plugin of pluginsArray) {
	plugin.active = true
}
const pluginsData = optimizePluginsArray(pluginsArray)

/**
 * Group by type (perItem, full etc)
 */
function optimizePluginsArray(plugins: SvgoPlugin[]): SvgoPlugin[][] {
	return plugins
		.map(item => [item])
		.reduce((array: SvgoPlugin[][], item) => {
			const last = array[array.length - 1]
			if (last && item[0]!.type === last[0]!.type) {
				last.push(item[0]!)
			} else {
				array.push(item)
			}
			return array
		}, [])
}

export async function minifySvg(svgString: string): Promise<string> {
	const parsedSvg = await new Promise<{ error?: any }>(resolve => svg2js(svgString, resolve))
	if (parsedSvg.error) {
		throw parsedSvg.error
	}

	plugins(parsedSvg, { input: 'string' }, pluginsData)

	return js2svg(parsedSvg, {}).data
}
