exports.up = function (knex) {
  return knex.schema.createTable('job_offers', function (table) {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('company').notNullable();
    table.string('location').notNullable();
    table.string('job_type').notNullable(); // internship, part_time, full_time, freelance
    table.string('duration'); // 6 months, 1 year, etc.
    table.decimal('salary_min', 10, 2);
    table.decimal('salary_max', 10, 2);
    table.string('salary_currency').defaultTo('EUR');
    table.string('remote_option'); // remote, hybrid, on_site
    table.text('requirements');
    table.text('benefits');
    table.string('contact_email');
    table.string('contact_phone');
    table.string('application_url');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.integer('employer_id').unsigned().references('id').inTable('users');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('job_offers');
}; 