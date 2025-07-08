exports.up = function (knex) {
  return knex.schema.table('job_offers', function (table) {
    table.string('status').defaultTo('active'); // active, inactive, pending, expired
  });
};

exports.down = function (knex) {
  return knex.schema.table('job_offers', function (table) {
    table.dropColumn('status');
  });
}; 