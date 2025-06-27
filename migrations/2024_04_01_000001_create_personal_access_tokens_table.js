const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('personal_access_tokens', (table) => {
      table.increments('id');
      table.string('tokenable_type').index();
      table.integer('tokenable_id').index();
      table.string('name');
      table.string('token', 64).unique();
      table.text('abilities').nullable();
      table.datetime('last_used_at').nullable();
      table.datetime('expires_at').nullable();
      table.timestamps();

      table.index(['tokenable_type', 'tokenable_id'], 'tokenable_index');
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('personal_access_tokens');
  }
};