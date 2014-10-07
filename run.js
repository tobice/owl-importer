var OwlTopology = require('./OwlTopology');

var owl = new OwlTopology().loadFromFile(process.argv[2] || 'pizza.owl');

owl.addNamedIndividual('Pizza', 'Hawai2');
owl.saveToFile('pizza_copy.owl');