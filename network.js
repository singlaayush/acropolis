const fetch = require('node-fetch');

class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT DISTINCT ?countryLabel ?iso ?hgovernmentLabel ?image ?start_time {
	?country wdt:P31 wd:Q3624078 .
	FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240}
	?country p:P6 ?statement .
	?country wdt:P298 ?iso .
	?statement ps:P6 ?hgovernment .
	?country wdt:P6 ?hgovernment .
	FILTER NOT EXISTS { ?statement pq:P582 ?x }
	?statement pq:P580 ?start_time .
	?hgovernment wdt:P18 ?image
	SERVICE wikibase:label { bd:serviceParam wikibase:language "en"}
}
ORDER BY ASC(?countryLabel)`;

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );

module.exports = {
    head: (callback) => {
        queryDispatcher.query( sparqlQuery ).then((r) => {
            callback(r.head.vars);
        });
    },
    results: (callback) => {
        queryDispatcher.query( sparqlQuery ).then((r) => {
            callback(r.results);
        });
    }
};