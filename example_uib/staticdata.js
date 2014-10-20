var degree  = {
    code: 'BASV-INFO',
    title: 'Bachelor Programme in Information Science',
    duration: 3,
    credits: 180
};

var subjectAreaClasses = {
    'Business': ['Marketing', 'Business', 'Basic marketing strategies'],
    'Economy': ['Introduction economics', 'Economy', 'Makronomics','Political economy'],
    'Geography': ['Basic geography principles', 'Natural resources', 'Global development'],
    'Logic': ['Analytical Thinking', 'Critical thinking', 'Reasoning', 'Fundamental Logic','Set theory','Relations','Fundamental knowledge reasoning','Basic modelling'],
    'Mathematics': ['Algebra','Discrete Mathematics','Functions',
        'Graphs'],
    'Media': ['Film','Social Science','Journalism', 'Media', 'Communications',
        'Mass communication process', 'Mass communication', 'Anthropological film', 'Information', 'Blogging'],
    'ComputerScience': ['Informationsystems', 'Information architecture','Fundamental ICT','Information science','Semantics','SPARQL','RDF','Ontologies','Database','SQL','Queries', 'Relational_Models',
        'Entity Relationship','Enhanced entity relationship','Knowledge representation', 'Reasoning types',
        'Production systems','System development','Informationsystem lifecycle',
        'Project management methods', 'Web Ontology Language (OWL)', 'Modeling', 'Semantic application', 'Interaction design', 'Prototyping'],
    'Programming': ['Development processes', 'Programming', 'Java', 'Simulation', 'Object-oriented programming', 'Advanced-programming','Object-oriented designs',
        'Programmings techniques', 'Data structure', 'Algorithms','Declarative and procedural programming', 'Search',
        'Backtracking', 'Data structures', 'Basic I/O','Search techniques', 'Inheritance systems'],
    'SocialSciences': ['Introduction to social science', 'Society', 'Society economics', 'Social science', 'Sociology','Socialization', 'Interaction',
        'Institutionalization', 'Role', 'Identity', 'Deviations', 'Social Antropology','Social differentiation',
        'Social inequality','Individual communities (monographs)','Social network','Social interaction',
        'Social interaction modelling', 'Community development', 'Mass collaboration', 'Social networking', 'Social gaming', 'Reputation', 'Addiction'],
    'Philosophy': ['Philosophy', 'Debate', 'Ethics', 'Privacy', 'Trust'],
    'Politics': ['Norwegian politics', 'Political science', 'Comparative politics', 'Comparative politisk methods']
};

var courses = {
    'EXPHIL-SVSEM': {
        description: '',
        prereq: [],
        overlapping: ['EXPHIL-SVEKS'],
        mandatory: 'optionalMandatory',
        suggestedSemester: 1,
        contact: 'exphil@uib.no',
        exam: '',
        covers:['Philosophy', 'Analytical Thinking', 'Critical thinking', 'Reasoning','Debate','Ethics']
    },
    'EXPHIL-SVEKS': {
        description: '',
        prereq: [],
        overlapping: ['EXPHIL-SVSEM'],
        mandatory: 'optionalMandatory',
        suggestedSemester: 1,
        contact: 'exphill@uib.no',
        exam: '2014-12-03 09:00',
        covers:['Philosophy', 'Analytical Thinking', 'Critical thinking',
        'Reasoning','Debate','Ethics']
    },
    'INFO100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'mandatory',
        suggestedSemester: 1,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-12-01 09:00',
        covers:['Information architecture','Fundamental ICT','Information science']
    },
    'SV100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@isp.uib.no',
        exam: '2014-09-30 09:00',
        covers:['Introduction to social science', 'Society']
    },
    'AORG100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@aorg.uib.no',
        exam: '2014-11-25 09:00',
        covers:['Administration and organisation science','Norwegian politics',
        'Political science']
    },
    'ECON100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@econ.uib.no',
        exam: '2014-11-24 09:00',
        covers:['Introduction economics', 'Society economics',
        'Basic marketing strategies']
    },
    'GEO100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@geog.uib.no',
        exam: '2014-11-14 09:00',
        covers:['Basic geography principles', 'Community development',
        'Natural resources']
    },
    'GLOB101': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@sosantr.uib.no',
        exam: '2014-11-25 09:00',
        covers:['Global development', 'Community development',
        'Development processes']
    },
    'MEVI100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@media.uib.no',
        exam: '2014-11-21 09:00',
        covers:['Media', 'Communications',
        'Mass communication process', 'Mass communication']
    },
    'SAMPOL100': {
        description: '',
        prereq: [],
        overlapping: ['POLØK100'],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@isp.uib.no',
        exam: '2014-12-02 09:00',
        covers:['Comparative politics','Social science']
    },
    'SOS100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@sos.uib.no',
        exam: '2014-11-18 09:00',
        covers: ['Sociology','Socialization', 'Interaction',
        'Institutionalization', 'Role', 'Identity', 'Deviations']
    },
    'SANT100': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'post@sosantr.uib.no',
        exam: '2014-11-21 09:00',
        covers:['Social Antropology','Social differentiation',
        'Social inequality','Individual communities (monographs)',
        'Anthropological film']
    },
    'POLØK100': {
        description: '',
        prereq: [],
        overlapping: ['SAMPOL100'],
        mandatory: 'optional',
        suggestedSemester: 1,
        contact: 'studieveileder@isp.uib.no',
        exam: '2014-12-02 09:00',
        covers:['Political economy','Comparative politisk methods',
        'Political economy analytical methods']
    },
    'INFO132': {
        description: '',
        prereq: ['INFO100'],
        overlapping: ['INF100'],
        mandatory: 'mandatory',
        suggestedSemester: 2,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-09 09:00',
        covers: ['Programming', 'Java', 'Simulation', 'Object-oriented programming']
    },
    'INFO102': {
        description: '',
        prereq: [],
        overlapping: ['MNF130'],
        mandatory: 'mandatory',
        suggestedSemester: 2,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-02 09:00',
        covers: ['Fundamental Logic','Set theory','Relations','Functions',
        'Graphs']
    },
    'INFO103': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'mandatory',
        suggestedSemester: 2,
        contact: 'studieveileder@econ.uib.no',
        exam: '2014-10-03 09:00',
        covers: ['Information','Fundamental knowledge reasoning','Basic modelling']
    },
    'INFO110': {
        description: '',
        prereq: ['INFO100'],
        overlapping: [],
        mandatory: 'mandatory',
        suggestedSemester: 2,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-07 09:00',
        covers: ['Informationsystems','Agile','System development lifecycle']
    },
    'INFO115': {
        description: '',
        prereq: ['INFO100'],
        overlapping: ['INFO114'],
        mandatory: 'mandatory',
        suggestedSemester: 3,
        contact: 'studieveileder@info.uib.no',
        covers: ['Community building', 'Mass collaboration',
        'Social networking', 'Blogging', 'Social gaming',
        'Privacy', 'Ethics', 'Trust', 'Reputation', 'Addiction']
    },
    'INFO116': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'mandatory',
        suggestedSemester: 3,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-12-09 09:00',
        covers: ['Semantics','SPARQL','RDF','Ontologies']
    },
    'INFO125': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'mandatory',
        suggestedSemester: 3,
        contact: 'studieveileder@econ.uib.no',
        exam: '2014-12-12 09:00',
        covers: ['Database','SQL','Queries', 'Relational_Models',
        'Entity Relationsip','Enhanced entity relationship']
    },
    'INFO216': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 4,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-08 09:00',
        covers: ['semantic technologies','SPARQL','RDF','Ontologies',
        'Modeling','Web Ontology Language (OWL)',
        'Advanced information models','Semantic applications']
    },
    'INFO233': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 4,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-01 09:00',
        covers:['Advanced-programming','Object-oriented designs',
        'Programmings techniques', 'Data structure', 'Algorithms']
    },
    'INFO262': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 4,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-10-10 09:00',
         covers:['Interaction design','Human-centered designs','Prototyping',
        'Design principles', 'Evaluation methods', 'Prototyping activities']
    },
    'INFO232': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 5,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-12-08 09:00',
        covers:['Declarative and procedural programming', 'Search',
        'Backtracking', 'Data structures', 'Basic I/O','Search techniques']
    },
    'INFO282': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 5,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-12-15 09:00',
        covers:['Knowledge representation', 'Reasoning','Reasoning types',
        'Production systems', 'Frames', 'Inheritance systems']
    },
    'INFO207': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 5,
        contact: 'studieveileder@info.uib.no',
        covers: ['Social network','Social interaction',
        'Social interaction modelling']
    },
    'INFO212': {
        description: '',
        prereq: [],
        overlapping: ['INFO112'],
        mandatory: 'optional',
        suggestedSemester: 5,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-11-18 14:00',
        covers: ['System development','Informationsystem lifecycle',
        'Project management methods']
    },
    'INF207': {
        description: '',
        prereq: [],
        overlapping: [],
        mandatory: 'optional',
        suggestedSemester: 5,
        contact: 'studieveileder@info.uib.no',
        exam: '2014-12-11 09:00',
        covers: ['Social network','Social interaction',
        'Social interaction modelling']
    }
};

module.exports.degree = degree;
module.exports.subjectAreaClasses = subjectAreaClasses;
module.exports.courses = courses;