var OwlTopology = require('./../OwlTopology');

var owl = new OwlTopology().loadFromFile(process.argv[2] || 'UibOntology.owl');

owl.addNamedIndividual('Event', 'EveningParty');
owl.addDataPropertyAssertion('EveningParty', 'hasCredits', OwlTopology.TYPE_INT, 10);
owl.saveToFile('UibOntologyPopulated.owl');