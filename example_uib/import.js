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
            return makeApiCall('fs', 'basisinfo/emne/' + code + '/2014H').then(function (response) {
                // Check if course was found
                var course = response.body.emne;
                if (!course) {
                    debug.warning('Course %s not found', code);
                    return null;
                }

                // Add faculty to ontology if necessary
                var faculty = owl.makeIRI(course.faknavn_engelsk);
                if (!owl.hasNamedIndividual(faculty)) {
                    owl.addNamedIndividual('Faculty', faculty);
                    debug.info('Added faculty %s to ontology', faculty);
                }

                // Add institute to ontology if necessary
                var institute = owl.makeIRI(course.instituttnavn_engelsk);
                if (!owl.hasNamedIndividual(institute)) {
                    owl.addNamedIndividual('Institute', institute);
                    debug.info('Added institute %s to ontology', institute);
                }

                // Add course to ontology
                owl.addNamedIndividual('Course', code);
                owl.addDataPropertyAssertion(code, 'hasTitle', OwlTopology.TYPE_STRING, course.emnenavn_engelsk);
                owl.addDataPropertyAssertion(code, 'hasCredits', OwlTopology.TYPE_INT, course.studiepoeng);
                owl.addObjectPropertyAssertion(code, 'hasFaculty', faculty);
                owl.addObjectPropertyAssertion(code, 'hasInstitute', institute);
                debug.info('Course %s added to ontology', code);
                return code;
            });
        }));
    })
    // Remove not found courses
    .then(_.compact)

    // Add timetable to ontology
    .then(function (courses) {
        debug.info('Fetching timetable');
        return Promise.all(_.map(courses, function(code) {
            return makeApiCall('timeplan', 'timeplanliste/now/' + code).then(function (response) {
                // Check if timetable for the course was found
                var entries = response.body.row;
                if (!entries) {
                    return debug.warning('No timetable found for course %s', code);
                }

                // Loop through individual course's classes
                _.each(entries, function (entry) {
                    // Parse description to get class type (Seminar|Lecture)
                    var type = getClassType(entry.description);
                    if (!type) {
                        return debug.warning('Could not determine class type for course %s (description: %s), skipping', code, entry.description);
                    }

                    // Parse location to get room and building
                    var location = getLocation(entry.rooms_string);
                    if (!location) {
                        debug.warning('Could not determine location for course %s (room_string: %s)', code, entry.rooms_string);
                    } else {
                        // Add room + building to ontology if necessary
                        var room = owl.makeIRI(location.room);
                        if (!owl.hasNamedIndividual(room)) {
                            var building = owl.makeIRI(location.building);
                            if (!owl.hasNamedIndividual(building)) {
                                owl.addNamedIndividual('Building', building);
                                debug.info('Added building %s to ontology', building);
                            }

                            owl.addNamedIndividual('Room', room);
                            owl.addObjectPropertyAssertion(room, 'inBuilding', building);
                            debug.info('Added room %s to ontology', room);
                        }
                    }

                    // Loop through individual class dates
                    var dates = (typeof entry.dates_iso.row == 'string') ? [entry.dates_iso.row] : entry.dates_iso.row;
                    _.each(dates, function(date) {
                        var event = owl.makeIRI(entry.name + ' ' + date);
                        owl.addNamedIndividual(type, event); // type works here as a owl class (Seminar|Lecture)
                        owl.addDataPropertyAssertion(event, 'hasDate', OwlTopology.TYPE_DATETIME, date + ' ' + getClassStart(entry.period) + ':00');
                        owl.addDataPropertyAssertion(event, 'hasDuration', OwlTopology.TYPE_INT, entry.duration);
                        if (room) {
                            owl.addObjectPropertyAssertion(event, 'inRoom', room);
                        }

                        // Attach event to course
                        owl.addObjectPropertyAssertion(code, 'hasClass', event);
                    });
                });

                debug.info('Timetable for course %s added to topology', code);
            });
        }))
    })

    // Save ontology
    .then(function () {
        owl.saveToFile('UibOntologyPopulated.owl');
        debug.info('Ontology saved to file');
    })

    .catch(function (err) {
        debug.error(err);
    });


// some helping function

function makeApiCall (source, action) {
    var url = 'https://' + source + '.data.uib.no/' + UIB_API_KEY + '/json/' + action;
    // debug.info("Making API call: %s", url);
    return request(url).promise();
}

function getClassType (description) {
    if (description.match(/forelesning/i)) {
        return 'Lecture';
    }
    if (description.match(/(seminar)|(lab)|(kurs)|(gruppe)/i)) {
        return 'Seminar';
    }
    return null;
}

function getClassStart (period) {
    return period.split('-')[0];
}

function getLocation (rooms_string) {
    if (!rooms_string.split) {
        return null;
    }

    var parts = rooms_string.split(',');
    if (parts.length != 2) {
        return null;
    }

    return {
        building: parts[0].trim(),
        room: parts[1].trim()
    }
}