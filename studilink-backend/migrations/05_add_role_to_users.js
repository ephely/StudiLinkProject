exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('role').defaultTo('student'); // student, employer, admin
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('role');
  });
}; 