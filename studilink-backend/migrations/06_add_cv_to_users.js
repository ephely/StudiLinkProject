exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('cv_url'); // URL du fichier CV uploadé
    table.string('cv_filename'); // Nom original du fichier
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumns('cv_url', 'cv_filename');
  });
}; 