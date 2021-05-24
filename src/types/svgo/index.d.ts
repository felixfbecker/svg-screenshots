/* eslint-disable no-duplicate-imports */
/* eslint-disable import/no-duplicates */

declare module 'svgo' {
	interface SvgoPlugin {
		type: unknown
		active: boolean
		params: any
	}
}

declare module 'svgo/plugins/*' {
	// eslint-disable-next-line import/order
	import { SvgoPlugin } from 'svgo'
	var plugin: SvgoPlugin
	export = plugin
}

declare module 'svgo/lib/svgo/svg2js' {
	function svg2js(svg: string, callback: (ast: object) => void): void
	export = svg2js
}

declare module 'svgo/lib/svgo/js2svg' {
	interface OptimizedSvg {
		data: string
	}
	function js2svg(ast: object, options?: { pretty?: boolean }): OptimizedSvg
	export = js2svg
}

declare module 'svgo/lib/svgo/plugins' {
	import { SvgoPlugin } from 'svgo'
	function plugins(ast: object, info: { input: 'string' }, pluginsData: SvgoPlugin[][]): void
	export = plugins
}
