var fs = require('fs');
var _ = require('lodash');
var libxmljs = require('libxmljs');
var Element = libxmljs.Element;

// Namespace for Xpath search
var OWL_NAMESPACE = {'ns': 'http://www.w3.org/2002/07/owl#'};

function OwlTopology () {
}

// Data types
OwlTopology.TYPE_STRING = 'string';
OwlTopology.TYPE_INT = 'int';
OwlTopology.TYPE_DATETIME = 'dateTime';

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
        return node.attr('IRI').value().replace('#', '');
    });
};

/**
 * Add named individual.
 * @param {string} className (must be a valid IRI)
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
    if (!this.isIRI(individual)) {
        throw new Error(individual + ' is not a valid IRI a therefore cannot be added to ontology');
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
 * Add object property assertion between two individuals.
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
 * Add data property assertion to an individual.
 * @param {string} individual
 * @param {string} dataProperty
 * @param {string} type (TYPE_STRING|TYPE_INT|TYPE_DATETIME)
 * @param {*} value
 * @returns {OwlTopology}
 */
OwlTopology.prototype.addDataPropertyAssertion = function (individual, dataProperty, type, value) {
    if (!this.hasNamedIndividual(individual)) {
        throw new Error('Individual ' + individual + ' does not exist in this ontology');
    }
    if (!this.hasDataProperty(dataProperty)) {
        throw new Error('ObjectProperty ' + dataProperty + ' does not exist in this ontology');
    }

    this.root.node('DataPropertyAssertion')
        .node('DataProperty').attr({IRI: '#' + dataProperty}).parent()
        .node('NamedIndividual').attr({IRI: '#' + individual}).parent()
        .node('Literal').attr({datatypeIRI: '#xsd;' + type}).text(value);

    return this;
};

/**
 * Transform input string into valid IRI. Replaces spaces by underscore and
 * removes all characters except for number and letters of english alphabet
 * (+ special norwegian letters are allowed).
 * @param {string} str
 * @returns {string}
 */
OwlTopology.prototype.makeIRI = function (str) {
    // TODO: this should really follow RFC 3987
    return str.replace(/ /g, '_').replace(/[^A-Za-z0-9æÆäÄøØöÖåÅ_\-\(\)]/g, '');
};

/**
 * Return true if input string is valid IRI.
 * @param {string} str
 * @returns {boolean}
 */
OwlTopology.prototype.isIRI = function (str) {
    // TODO: this should really follow RFC 3987
    return str.match(/^[A-Za-z0-9æÆäÄøØöÖåÅ_\-\(\)]+$/) !== null;
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