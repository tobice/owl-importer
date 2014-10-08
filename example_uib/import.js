var request = require('superagent');
var OwlTopology = require('./../OwlTopology');
var UIB_API_KEY = require('./apikey.js');

// Promisify superagent
require('superagent-bluebird-promise');

function makeApiUrl(action) {
    return 'https://fs.data.uib.no/' + UIB_API_KEY + '/json/' + action;
}

request(makeApiUrl('basisinfo/emne/INFO116/2014H')).promise()
    .then(function (response) {
        console.log(response.body);
    });
/*
var owl = new OwlTopology().loadFromFile(process.argv[2] || 'UibOntology.owl');

owl.addNamedIndividual('Event', 'EveningParty');
owl.addDataPropertyAssertion('EveningParty', 'hasCredits', OwlTopology.TYPE_INT, 10);
owl.saveToFile('UibOntologyPopulated.owl');
    */