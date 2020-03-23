exports.seed = function(knex) {
   // Deletes ALL existing entries
   return knex("hospitals")
      .del()
      .then(function() {
         // Inserts seed entries
         return knex("hospitals").insert([
            {
               id: 1,
               created_at: knex.fn.now(),
               finesse_number: "370000481",
               name: "CHRU de Tours",
               addr1: "2 BD TONNELLE",
               addr2: "",
               town: "Tours",
               postal_code: "37044",
               dep_code: "37",
            },
            {
               id: 2,
               created_at: knex.fn.now(),
               finesse_number: "450000088",
               name: "CHR d'Orléans",
               addr1: "14 AV DE L'HOPITAL",
               addr2: "CS 86709",
               town: "Orléans",
               postal_code: "45067",
               dep_code: "45",
            },
            {
               id: 3,
               created_at: knex.fn.now(),
               finesse_number: "440000289",
               name: "CHU de Nantes",
               addr1: "7 ALL DE L'ILE GLORIETTE",
               addr2: "BP 1005",
               town: "Nantes",
               postal_code: "44093",
               dep_code: "44",
            },
            {
               id: 4,
               created_at: knex.fn.now(),
               finesse_number: "490000031",
               name: "CHU d'Angers",
               addr1: "4 R LARREY",
               addr2: "",
               town: "Angers",
               postal_code: "49933",
               dep_code: "49",
            },
         ])
      })
}
// .createTable("hospitals", function(table) {
//     table.increments("id")
//     table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now())
//     table.timestamp("updated_at", { useTz: true })
//     table.timestamp("deleted_at", { useTz: true })
//     table.string("finesse_number", 50)
//     table.string("name", 255).notNullable()
//     table.string("category", 50)
//     table.string("addr1", 255)
//     table.string("addr2", 255)
//     table.string("town", 255)
//     table.string("dep_code", 3)

//     table.json("extra_data")