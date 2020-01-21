exports.up = function(knex) {
    return Promise.all([
      knex.schema.createTable("players", function(table) {
        table.increments("id").primary();
        table.string("name");
        table.timestamps(true, true);
      }),
  
      knex.schema.createTable("scores", function(table) {
        table.increments("id").primary();
        table.string("score");
        table.integer("player_id").unsigned();
        table.foreign("player_id").references("players.id");
        table.timestamps(true, true);
      })
    ]);
  };
  
  exports.down = function(knex) {
    return Promise.all([
      knex.schema.dropTable("scores"),
      knex.schema.dropTable("players")
    ]);
  };
  