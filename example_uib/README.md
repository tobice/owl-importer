#Example: import data provided by UiB into ontology

This was a part of my group project for Semantic technologies course 
at University of Bergen. The university provides a lot of information about 
courses and schedules through their public JSON/XML api. This example shows 
how to fetch this data and import it into an existing OWL ontology (that we 
created during classes). It's also a nice Promise exercise.

If you want to run this example, you will need to install Node js and also to
get an API key from the university. See [apikey.example.js](apikey.example.js)
for more information. 
 
After that simply run following commands:
```
npm install
cd example_uib
node import.js UibOntology.owl UibOntologyPopulated.owl
```

You can adjust the amount of printed debug information by setting the `DEBUG` 
variable.

```
DEBUG="info,warning,error" node import.js UibOntology.owl UibOntologyPopulated.owl
```

This will print everything.
