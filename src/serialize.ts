// NOTE: this doesn't work in Firefox, Firefox does not support <xsl:output indent="yes"/>
export function formatXML(xmlDocument: XMLDocument): XMLDocument {
	// describes how we want to modify the XML - indent everything
	// change to just text() to strip space in text nodes
	const xsltTextDocument = new DOMParser().parseFromString(
		`
			<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
				<xsl:strip-space elements="*"/>
				<xsl:template match="para[content-style][not(text())]">'
					<xsl:value-of select="normalize-space(.)"/>
				</xsl:template>
				<xsl:template match="node()|@*">
					<xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
				</xsl:template>
				<xsl:output indent="yes"/>
			</xsl:stylesheet>
		`,
		'application/xml'
	)

	const xsltProcessor = new XSLTProcessor()
	xsltProcessor.importStylesheet(xsltTextDocument)
	const formattedDocument = xsltProcessor.transformToDocument(xmlDocument)
	return formattedDocument
}
