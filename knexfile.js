// Update with your config settings.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');

config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	development: {
		client: 'postgresql',
		connection: {
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		},
		pool: {
			min: 1,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	},
	staging: {
		client: 'postgresql',
		connection: {
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		},
		pool: {
			min: 1,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	},
	production: {
		client: 'postgresql',
		connection: {
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		},
		pool: {
			min: 1,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	}
};
