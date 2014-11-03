var moment = require('moment');
var request = require('superagent');
var _ = require('lodash');
var Promise = require('bluebird');
var OwlTopology = require('./../OwlTopology');
var UIB_API_KEY = require('./apikey');
var staticdata = require('./staticdata');

// Schema.org classes and properties
SCHEMA_Place = 'http://schema.org/Place';
SCHEMA_Event = 'http://schema.org/Event';
SCHEMA_event = 'http://schema.org/event';
SCHEMA_location = 'http://schema.org/location';
SCHEMA_duration = 'http://schema.org/duration';
SCHEMA_startDate = 'http://schema.org/startDate';

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

var courses = _.keys(staticdata.courses);
var owl = new OwlTopology().loadFromFile(process.argv[2] || 'UibOntology.owl');
debug.info('Ontology successfully loaded');

new Promise(function (resolve) { resolve() })

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
                    owl.addNamedIndividual('#Faculty', faculty)
                        .addLabel(faculty, course.faknavn_engelsk);
                    debug.info('Added faculty %s to ontology', faculty);
                }

                // Add institute to ontology if necessary
                var institute = owl.makeIRI(course.instituttnavn_engelsk);
                if (!owl.hasNamedIndividual(institute)) {
                    owl.addNamedIndividual('#Institute', institute);
                    owl.addLabel(institute, course.instituttnavn_engelsk);
                    debug.info('Added institute %s to ontology', institute);
                }

                // Add course to ontology
                var iri = owl.makeIRI(code);
                owl.addNamedIndividual('#Course', iri)
                    .addDataPropertyAssertion(iri, '#hasTitle', OwlTopology.TYPE_STRING, course.emnenavn_engelsk)
                    .addDataPropertyAssertion(iri, '#hasCredits', OwlTopology.TYPE_INT, course.studiepoeng)
                    .addObjectPropertyAssertion(iri, '#atFaculty', faculty)
                    .addObjectPropertyAssertion(iri, '#atInstitute', institute);
                debug.info('Course %s added to ontology', code);
                return code;
            });
        }));
    })
    // Remove courses that were not found
    .then(_.compact)

    // Add static data to ontology
    .then(function (courses) {

        // Add degree
        var degree = owl.makeIRI(staticdata.degree.code);
        owl.addNamedIndividual('#Degree', degree)
            .addDataPropertyAssertion(degree, '#hasTitle', OwlTopology.TYPE_STRING, staticdata.degree.title)
            .addDataPropertyAssertion(degree, '#hasDuration', OwlTopology.TYPE_INT, staticdata.degree.duration)
            .addDataPropertyAssertion(degree, '#hasCredits', OwlTopology.TYPE_INT, staticdata.degree.credits);
        debug.info('Degree added to ontology');

        // Add subject areas
        _.each(staticdata.subjectAreaClasses, function (areas, className) {
            _.each(areas, function (area) {
                var iri = owl.makeIRI(area);
                owl.addNamedIndividual(owl.makeIRI(className), iri)
                    .addLabel(iri, area);
                debug.info('Subject area %s added to ontology', area)
            });
        });

        // Add extra static information to courses
        _.each(courses, function (course) {
            var data = staticdata.courses[course];
            if (!data) {
                debug.warn('No static data for course %s', course);
                return;
            }

            course = owl.makeIRI(course);
            owl.addDataPropertyAssertion(course, '#hasDescription', OwlTopology.TYPE_STRING, data.description)
                .addDataPropertyAssertion(course, '#hasSuggestedSemester', OwlTopology.TYPE_INT, data.suggestedSemester)
                .addDataPropertyAssertion(course, '#hasContactEmail', OwlTopology.TYPE_STRING, data.contact);

            // Prerequisite courses
            _.each(data.prereq, function(prereq) {
                owl.addObjectPropertyAssertion(course, '#hasPrerequisiteCourse', owl.makeIRI(prereq), true);
            });

            // Overlapping courses
            _.each(data.overlapping, function (overlapping) {
                overlapping = owl.makeIRI(overlapping);
                if (!owl.hasNamedIndividual(overlapping)) {
                    debug.warning('%s is overlapping with %s that does not exist in the ontology', course, overlapping);
                    return;
                }
                owl.addObjectPropertyAssertion(course, '#hasOverlappingCredits', overlapping);
            });

            // Subject areas covered by this course
            _.each(data.covers, function (subjectArea) {
                subjectArea = owl.makeIRI(subjectArea);
                if (!owl.hasNamedIndividual(subjectArea)) {
                    debug.warning('Subject area %s does not exist in the ontology, skipping', subjectArea);
                    return;
                }
               owl.addObjectPropertyAssertion(course, '#coversSubjectArea', subjectArea);
            });

            // Exam
            if (data.exam) {
                var exam = owl.makeIRI(course + ' Exam');
                owl.addNamedIndividual('#Exam', exam)
                    .addLabel(exam, course + ' Exam')
                    .addDataPropertyAssertion(exam, SCHEMA_startDate, OwlTopology.TYPE_DATETIME, makeDate(data.exam))
                    .addObjectPropertyAssertion(course, '#hasExam', exam);
            }

            // Add to degree
            switch (data.mandatory) {
                case 'mandatory':
                    owl.addObjectPropertyAssertion(degree, '#hasMandatoryCourse', course);
                    break;
                case 'optional':
                    owl.addObjectPropertyAssertion(degree, '#hasOptionalCourse', course);
                    break;
                case 'optionalMandatory':
                    owl.addObjectPropertyAssertion(degree, '#hasOptionalMandatoryCourse', course);
                    break;
                default:
                    debug.warning('Unknown mandatory value %s for course %s', data.mandatory, course);
            }

            debug.info('Static info for course %s added to topology', course);
        });
        return courses;
    })

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
                    // Parse description to get class type (Seminar|Lecture|AmbigousClass)
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
                                owl.addNamedIndividual('#Building', building)
                                    .addLabel(building, location.building);
                                debug.info('Added building %s to ontology', building);
                            }

                            owl.addNamedIndividual('#Room', room)
                                .addObjectPropertyAssertion(room, '#inBuilding', building)
                                .addLabel(room, location.room);
                            debug.info('Added room %s to ontology', room);
                        }
                    }

                    // Loop through individual class dates
                    var dates = (typeof entry.dates_iso.row == 'string') ? [entry.dates_iso.row] : entry.dates_iso.row;
                    _.each(dates, function(date) {
                        var event = owl.makeIRI(entry.name + ' ' + date);
                        owl.addNamedIndividual('#' + type, event) // type works here as an owl class (Seminar|Lecture|AmbiguousClass)
                            .addLabel(event, entry.name)
                            .addDataPropertyAssertion(event, SCHEMA_startDate, OwlTopology.TYPE_DATETIME, makeDate(date + ' ' + getClassStart(entry.period)))
                            .addDataPropertyAssertion(event, SCHEMA_duration, OwlTopology.TYPE_INT, makeDuration(entry.duration));
                        if (room) {
                            owl.addObjectPropertyAssertion(event, '#inRoom', room);
                        }

                        // Attach event to course
                        owl.addObjectPropertyAssertion(owl.makeIRI(code), '#hasClass', event);
                    });
                });

                debug.info('Timetable for course %s added to topology', code);
            });
        }))
    })

    // Save ontology
    .then(function () {
        owl.saveToFile(process.argv[3] || 'UibOntologyPopulated.owl');
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
    if (description.match(/(seminar)|(lab)|(kurs)|(gruppe)|(SV)/i)) {
        return 'Seminar';
    }
    return 'AmbiguousClass';
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

function makeDuration(duration) {
    // ISO 8601
    return moment.unix(duration).utc().format('[PT]H[H]m[M]');
}

function makeDate(date) {
    // ISO 8601
    return moment(date).format();
}