/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.createSchemaIfNotExists('usr');
	await knex.schema
		.withSchema('usr')
		.createTableIfNotExists('user', table => {
			table.increments('id');
			table.string('email', 200).notNullable();
			table.string('password', 200).notNullable();
			table.string('role', 32).notNullable();
		});
	// eslint-disable-next-line newline-per-chained-call
	await knex.withSchema('usr').table('user').insert({
		email: 'root@localhost.com',
		password: 'U2FsdGVkX19VIrDD1kD1e9o/WVrK08GEuOEiBUpKK7U=',
		role: 'ROOT'
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	// eslint-disable-next-line newline-per-chained-call
	await knex.withSchema('usr').table('user').where('id', 1).del();
	await knex.schema.dropTableIfExists('user');
	await knex.schema.dropSchemaIfExists('usr');
};
