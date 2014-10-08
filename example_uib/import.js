var request = require('superagent');
var _ = require('lodash');
var Promise = require('bluebird');
var OwlTopology = require('./../OwlTopology');
var UIB_API_KEY = require('./apikey.js');

// Setup nice debug output
process.env.DEBUG = process.env.DEBUG || 'error';
var info = require('debug')('info');
var error = require('debug')('error');
error.log = console.error.bind(console);

// Promisify superagent
require('superagent-bluebird-promise');

var courses = 'EXPHIL-SVSEM EXPHIL-SVEKS INFO100 SV100 AORG100 ECON100 GEO100 GLOB101 MEVI100 SAMPOL100 SOS100 SANT100 POLØK100 INFO132 INFO102 INFO103 INFO110 INFO115 INFO116 INFO125 INFO216 INFO233 INFO262 INFO232 INFO282 INFO207 INFO212 INF207'.split(' ');
var owl = new OwlTopology().loadFromFile(process.argv[2] || 'UibOntology.owl');
info('Ontology successfully loaded');

new Promise(function (resolve, reject) { resolve() })

    // Fetch all courses
    .then(function() {
        return Promise.all(_.map(courses, function (code) {
            return makeApiCall('basisinfo/emne/' + code + '/2014H')
                .then(function (response) {
                    var course = response.body.emne;
                    if (!course) {
                        throw new Error('Course not found. Api call: ' + response.request.url);
                    }

                    info('Fetched course %s', course.emnekode);
                    return course;
                });
        }));
    })

    // Parse courses and add them to ontology
    .then(function (courses) {
        _.each(courses, function (course) {
            owl.addNamedIndividual('Course', course.emnekode);
            owl.addDataPropertyAssertion(course.emnekode, 'hasTitle', OwlTopology.TYPE_STRING, course.emnenavn_engelsk);
            owl.addDataPropertyAssertion(course.emnekode, 'hasCredits', OwlTopology.TYPE_INT, course.studiepoeng);
            info('Course %s added to ontology', course.emnekode);
        });
    })

    // Save ontology
    .then(function () {
        owl.saveToFile('UibOntologyPopulated.owl');
        info('Ontology saved to file');
    })

    .catch(function (err) {
        error(err);
    });

function makeApiCall(action) {
    var url = 'https://fs.data.uib.no/' + UIB_API_KEY + '/json/' + action;
    return request(url).promise();
}