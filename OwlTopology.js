var fs = require('fs');
var _ = require('lodash');
var libxmljs = require('libxmljs');
var Element = libxmljs.Element;

// Namespace for Xpath search
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
 * @param {string} objectProperty
 * @returns {boolean}
 */
OwlTopology.prototype.hasObjectProperty = function (objectProperty) {
    return _.contains(this._objectProperties, objectProperty);
};

/**
 * Returns true if topology contains given data property.
 * @param {string} dataProperty
 * @returns {boolean}
 */
OwlTopology.prototype.hasDataProperty = function (dataProperty) {
    return _.contains(this._dataProperties, dataProperty);
};

/**
 * Returns true if topology contains given named individual.
 * @param {string} namedIndividual
 * @returns {boolean}
 */
OwlTopology.prototype.hasNamedIndividual = function (namedIndividual) {
    return _.contains(this._namedIndividuals, namedIndividual);
};

/**
 * Get array of declared objects in the ontology by given type. Searches all
 * <Declaration /> objects and returns an array of found IRIs.
 * @param {string} declarationType (Class|ObjectProperty|DataProperty|NamedIndividual)
 * @returns {Array.<string>}
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
 * @param {string} individual
 * @returns {OwlTopology}
 */
OwlTopology.prototype.addNamedIndividual = function (className, individual) {
    if (!this.hasClass(className)) {
        throw new Error('There is no class ' + className + ' in this ontology');
    }
    if (this.hasNamedIndividual(individual)) {
        throw new Error('Individual ' + individual + ' already exists in this ontology');
    }

    // Add declaration
    this.root.node('Declaration')
        .node('NamedIndividual').attr({IRI: '#' + individual});

    // Add class assertion
    this.root.node('ClassAssertion')
        .node('Class').attr({IRI: '#' + className}).parent()
        .node('NamedIndividual').attr({IRI: '#' + individual});

    this._namedIndividuals.push(individual);
    return this;
};

/**
 * ADd object property assertion between two individuals.
 * @param {string} individual1
 * @param {string} objectProperty
 * @param {string} individual2
 * @returns {OwlTopology}
 */
OwlTopology.prototype.addObjectPropertyAssertion = function (individual1, objectProperty, individual2) {
    if (!this.hasNamedIndividual(individual1)) {
        throw new Error('Individual ' + individual1 + ' does not exist in this ontology');
    }
    if (!this.hasNamedIndividual(individual2)) {
        throw new Error('Individual ' + individual2 + ' does not exist in this ontology');
    }
    if (!this.hasObjectProperty(objectProperty)) {
        throw new Error('ObjectProperty ' + objectProperty + ' does not exist in this ontology');
    }

    this.root.node('ObjectPropertyAssertion')
        .node('ObjectProperty').attr({IRI: '#' + objectProperty}).parent()
        .node('NamedIndividual').attr({IRI: '#' + individual1}).parent()
        .node('NamedIndividual').attr({IRI: '#' + individual2});

    return this;
};

/**
 * Save ontology to a file.
 * @param {string} fileName
 * @returns {OwlTopology}
 */
OwlTopology.prototype.saveToFile = function (fileName) {
    var xml = this.doc.toString();
    fs.writeFileSync(fileName, xml);
    return this;
};

module.exports = OwlTopology;