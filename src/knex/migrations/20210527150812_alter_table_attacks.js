
exports.up = async function(knex) {
  await knex.schema.table('attacks', function (table) {
    table.integer("year").unsigned();
  });
  
  await knex('attacks').update({
          year: 2015,
          name: "Bataclan"
        })
    .where("id", 1);

    await knex('attacks').update({
          year: 2015,
          name: "Hyper Cacher"
        })
    .where("id", 2);

    await knex('attacks').update({
          year: 2015,
          name: "Les terrasses Paris"
        })
    .where("id", 3);

    await knex('attacks').update({
          year: 2016,
          name: "Nice"
        })
    .where("id", 4);

    await knex('attacks').update({
          year: 2020,
          name: "Villejuif"
        })
    .where("id", 5);

    await knex('attacks').update({
          year: 2012,
          name: "École Ozar Hatorah Toulouse"
        })
    .where("id", 6);

    await knex('attacks').update({
          year: 2015,
          name: "Charlie Hebdo"
        })
    .where("id", 7);
}

exports.down = async function(knex) {
  await knex.schema.table('attacks', function (table) {
    table.dropColumn("year");
  });


    await knex('attacks').update({
          name: "2015 Bataclan"
        })
    .where("id", 1);

    await knex('attacks').update({
          name: "2015 Hyper Cacher"
        })
    .where("id", 2);

   await knex('attacks').update({
          name: "2015 Les terrasses Paris"
        })
    .where("id", 3);

   await knex('attacks').update({
          name: "2016 Nice"
        })
    .where("id", 4);

    await knex('attacks').update({
          name: "2020 Villejuif"
        })
    .where("id", 5);

    await knex('attacks').update({
          name: "2012 École Ozar Hatorah Toulouse"
        })
    .where("id", 6);

    await knex('attacks').update({
          name: "2015 Charlie Hebdo"
        })
    .where("id", 7);
}
