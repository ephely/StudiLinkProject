exports.up = function (knex) {
  return knex.schema.createTable('applications', function (table) {
    table.increments('id').primary();
    table.integer('job_offer_id').unsigned().references('id').inTable('job_offers').onDelete('CASCADE');
    table.integer('student_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.text('cover_letter');
    table.string('resume_url');
    table.string('status').defaultTo('pending'); // pending, accepted, rejected, withdrawn
    table.text('employer_notes');
    table.timestamp('applied_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure a student can only apply once to the same job offer
    table.unique(['job_offer_id', 'student_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('applications');
}; 