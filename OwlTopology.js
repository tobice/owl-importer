var fs = require('fs');
var _ = require('lodash');
var libxmljs = require('libxmljs');
var Element = libxmljs.Element;

// Namespace for Xpath searching
var OWL_NAMESPACE = {'ns': 'http://www.w3.org/2002/07/owl#'};
var IRI = 'IRI';

function OwlTopology () {
}

/**
 * Load OWL ontology from file
 * @param {string} fileName valid path to a XML owl ontology
 * @returns {OwlTopology}
 */
OwlTopology.prototype.loadFromFile = function (fileName) {
    var xml = fs.readFileSync(fileName).toString();
    this.doc = libxmljs.parseXml(xml);
    this.root = this.doc.root();

    // Analyze ontology
    this._classes = this.getDeclarations('Class');
    this._objectProperties = this.getDeclarations('ObjectProperty');
    this._dataProperties = this.getDeclarations('DataProperty');
    this._namedIndividuals = this.getDeclarations('NamedIndividual');

    return this;
};

/**
 * Returns true if topology contains given class.
 * @param {string} className
 * @returns {boolean}
 */
OwlTopology.prototype.hasClass = function (className) {
    return _.contains(this._classes, className);
};

/**
 * Returns true if topology contains given object property.
 * @param {string} objectPropertyName
 * @returns {boolean}
 */
OwlTopology.prototype.hasObjectProperty = function (objectPropertyName) {
    return _.contains(this._objectProperties, objectPropertyName);
};

/**
 * Returns true if topology contains given data property.
 * @param {string} dataPropertyName
 * @returns {boolean}
 */
OwlTopology.prototype.hasDataProperty = function (dataPropertyName) {
    return _.contains(this._dataProperties, dataPropertyName);
};

/**
 * Returns true if topology contains given named individual.
 * @param {string} namedIndividualName
 * @returns {boolean}
 */
OwlTopology.prototype.hasNamedIndividual = function (namedIndividualName) {
    return _.contains(this._namedIndividuals, namedIndividualName);
};

/**
 * Get array of declared objects in the ontology by given type. Searches all
 * <Declaration /> objects and returns an array of found IRIs.
 * @param {string} declarationType
 * @returns {*}
 */
OwlTopology.prototype.getDeclarations = function (declarationType) {
    var nodes = this.doc.find('//ns:Declaration/ns:' + declarationType, OWL_NAMESPACE);
    return _.map(nodes, function (node) {
        return node.attr(IRI).value().replace('#', '');
    });
};

/**
 * Add named individual.
 * @param {string} className
 * @param {string} name
 * @returns {OwlTopology}
 */
OwlTopology.prototype.addNamedIndividual = function (className, name) {

    if (!this.hasClass(className)) {
        throw new Error('There is no class ' + className + ' in this ontology');
    }

    if (this.hasNamedIndividual(name)) {
        throw new Error('Individual ' + name + ' already exists in this ontology');
    }

    // Add declaration
    this.root.node('Declaration')
        .node('NamedIndividual').attr({IRI: '#' + name});

    // Add class assertion
    this.root.node('ClassAssertion')
        .node('Class').attr({IRI: '#' + className}).parent()
        .node('NamedIndividual').attr({IRI: '#' + name});

    this._namedIndividuals.push(name);
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