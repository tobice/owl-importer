var fs = require('fs');
var libxmljs = require('libxmljs');
var Element = libxmljs.Element;

function OwlTopology () {
}

/**
 * Load OWL ontology from file
 * @param {string} fileName valid path to a XML owl ontology
 * @returns {OwlTopology}
 */
OwlTopology.prototype.loadFromFile = function (fileName) {
    var xml = fs.readFileSync(fileName).toString();
    this.doc = libxmljs.parseXmlString(xml);
    this.root = this.doc.root();

    return this;
};

/**
 * Add named individual.
 * @param {string} className
 * @param {string} name
 * @returns {OwlTopology}
 */
OwlTopology.prototype.addNamedIndividual = function (className, name) {
    // Add declaration
    this.root.node('Declaration')
        .node('NamedIndividual').attr({IRI: '#' + name});

    // Add class assertion
    this.root.node('ClassAssertion')
        .node('Class').attr({IRI: '#' + className}).parent()
        .node('NamedIndividual').attr({IRI: '#' + name});

    return this;
};

/**
 * Save ontology to a file.
 * @param {string} fileName
 * @returns {OwlTopology}
 */
OwlTopology.prototype.saveToFile = function (fileName) {
    var xml = this.doc.toString();
    // xml = xml.replace(/&amp;rdf;/g, '&rdf;'); // simple hack, xmldom for some reason does no recognize &rdf;
    fs.writeFileSync(fileName, xml);

    return this;
};

module.exports = OwlTopology;