var OwlTopology = require('./../OwlTopology');

var owl = new OwlTopology().loadFromFile(process.argv[2] || 'pizza.owl');

owl.addNamedIndividual('Pizza', 'ImporterHawai');
owl.addNamedIndividual('PizzaBase', 'ImporterBase');
owl.addObjectPropertyAssertion('ImporterHawai', 'hasBase', 'ImporterBase');
owl.saveToFile('pizza_copy.owl');