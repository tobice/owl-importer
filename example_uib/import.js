var request = require('superagent');
var _ = require('lodash');
var Promise = require('bluebird');
var OwlTopology = require('./../OwlTopology');
var UIB_API_KEY = require('./apikey.js');

// Setup nice debug output
process.env.DEBUG = process.env.DEBUG || 'error,warning';
var debug = {
    info: require('debug')('info'),
    warning: require('debug')('warning'),
    error: require('debug')('error')
};
debug.error.log = console.error.bind(console);

// Promisify superagent
require('superagent-bluebird-promise');

var courses = 'EXPHIL-SVSEM EXPHIL-SVEKS INFO100 SV100 AORG100 ECON100 GEO100 GLOB101 MEVI100 SAMPOL100 SOS100 SANT100 POLØK100 INFO132 INFO102 INFO103 INFO110 INFO115 INFO116 INFO125 INFO216 INFO233 INFO262 INFO232 INFO282 INFO207 INFO212 INF207'.split(' ');
var owl = new OwlTopology().loadFromFile(process.argv[2] || 'UibOntology.owl');
debug.info('Ontology successfully loaded');

new Promise(function (resolve, reject) { resolve() })

    // Add courses to ontology
    .then(function() {
        debug.info('Fetching courses');
        return Promise.all(_.map(courses, function (code) {
            return makeApiCall('basisinfo/emne/' + code + '/2014H').then(function (response) {
                // Check if course was found
                var course = response.body.emne;
                if (!course) {
                    debug.warning('Course not found. Api call: %s', response.request.url);
                    return null;
                }

                // Add course to ontology
                owl.addNamedIndividual('Course', course.emnekode);
                owl.addDataPropertyAssertion(course.emnekode, 'hasTitle', OwlTopology.TYPE_STRING, course.emnenavn_engelsk);
                owl.addDataPropertyAssertion(course.emnekode, 'hasCredits', OwlTopology.TYPE_INT, course.studiepoeng);
                debug.info('Course %s added to ontology', course.emnekode);
                return course.emnekode;
            });
        }));
    })

    // Remove not found courses
    .then(_.compact)

    // Add timetable to ontology
    .then(function (courses) {
        debug.info('Fetching timetable');
    })

    // Save ontology
    .then(function () {
        owl.saveToFile('UibOntologyPopulated.owl');
        debug.info('Ontology saved to file');
    })

    .catch(function (err) {
        debug.error(err);
    });

function makeApiCall(action) {
    var url = 'https://fs.data.uib.no/' + UIB_API_KEY + '/json/' + action;
    debug.info("Making API call: %s", url);
    return request(url).promise();
}