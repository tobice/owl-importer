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
    this._classes = this.getClasses();

    return this;
};

/**
 * Get array of classes in the ontology
 * @returns {Array}
 */
OwlTopology.prototype.getClasses = function () {
    var nodes = this.doc.find('//ns:Declaration/ns:Class', OWL_NAMESPACE);
    var classes = [];
    _.each(nodes, function (node) {
        classes.push(node.attr(IRI).value().replace('#', ''));
    });
    return classes;
};

/**
 * Return if topology contains given class.
 * @param className
 * @returns {boolean}
 */
OwlTopology.prototype.hasClass = function (className) {
    return _.contains(this._classes, className);
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