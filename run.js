var OwlTopology = require('./OwlTopology');

var owl = new OwlTopology().loadFromFile(process.argv[2] || 'pizza.owl');

owl.addNamedIndividual('Pizza', 'Hawai2');
owl.addNamedIndividual('Pizza', 'Hawai3');
owl.saveToFile('pizza_copy.owl');