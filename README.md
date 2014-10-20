#Owl Importer

JavaScript tool for importing data into an existing OWL ontology (created for
example by Protégé).

### Usage

```javascript
var owl = new OwlTopology().loadFromFile('PizzaOntology.owl');
owl.addNamedIndividual('Pizza', 'Hawai');
owl.addObjectPropertyAssertion('Hawai', 'hasTopping', 'AnanasTopping');
owl.addDataPropertyAssertion('Hawai', 'price', OwlTopology.TYPE_INT, 200);
```

The importer does some basic checks for you. It won't let you insert an 
individual that already exists and it won't let you use a class or a property 
that is not defined in the ontology. 

See the [code](OwlTopology.js) (it's pretty well documented) or this rather 
extensive [example](example_uib).