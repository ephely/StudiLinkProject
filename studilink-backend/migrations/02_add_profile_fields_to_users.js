exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('first_name');
    table.string('last_name');
    table.string('location');
    table.string('skills');
    table.text('bio');
    table.string('avatar_url');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumns(
      'first_name',
      'last_name',
      'location',
      'skills',
      'bio',
      'avatar_url',
    );
  });
};
