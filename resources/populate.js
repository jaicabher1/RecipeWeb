'use strict';

const mongoose = require('mongoose');
const User = require('../api/models/publication'); 
const Publication = require('../api/models/publication');

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/tu_base_de_datos', {

}).then(() => {
    console.log('✅ Conectado a la base de datos');
    seedDatabase();
}).catch(err => console.error('❌ Error de conexión:', err));

// Datos de prueba
const users = [
    { name: "Juan", surname: "Pérez", email: "juan@example.com", nick: "juanp", password: "123456"},
    { name: "Maria", surname: "López", email: "maria@example.com", nick: "marial", password: "123456" },
    {name:"Carlos",surname:"Gómez",email:"carlos@example.com",nick:"carlitos",password:"pass1234" },
    {name:"Laura",surname:"Fernández",email:"laura@example.com",nick:"lauri",password:"pass1234" },
    {name:"Miguel",surname:"Pérez",email:"miguel@example.com",nick:"miguelon",password:"pass1234" },
    {name:"Ana",surname:"Ramírez",email:"ana@example.com",nick:"anita",password:"pass1234" },
    {name:"Diego",surname:"Martínez",email:"diego@example.com",nick:"dieguito",password:"pass1234" }
];

const publications = [
    {user:"67780e4cda31743a1a9ee47e",title:"Tacos de Pollo",category:"Almuerzo",description:"Receta rápida para hacer tacos de pollo.",ingredients:["Pollo","Tortillas","Cebolla","Salsa"],steps:"1. Cocina el pollo. 2. Prepara las tortillas. 3. Agrega los ingredientes.",difficulty:"Fácil",prepTime:30},
    {user:"67780e5fda31743a1a9ee481",title:"Ensalada Vegana",category:"Vegano",description:"Deliciosa ensalada vegana con quinoa.",ingredients:["Quinoa","Tomate","Pepino","Aguacate"],steps:"1. Cocina la quinoa. 2. Pica los ingredientes. 3. Mezcla todo.",difficulty:"Fácil",prepTime:15},
    {user:"6778311dc828bee215aa9d8d",title:"Pizza Casera",category:"Cena",description:"Cómo hacer una pizza casera desde cero.",ingredients:["Harina","Levadura","Queso","Tomate","Aceitunas"],steps:"1. Prepara la masa. 2. Agrega los ingredientes. 3. Hornea a 220°C por 20 minutos.",difficulty:"Intermedio",prepTime:45},
    {user:"67783129c828bee215aa9d90",title:"Brownies de Chocolate",category:"Postre",description:"Receta fácil para hacer brownies caseros.",ingredients:["Chocolate","Harina","Huevo","Azúcar"],steps:"1. Derrite el chocolate. 2. Mezcla con los demás ingredientes. 3. Hornea a 180°C por 25 minutos.",difficulty:"Fácil",prepTime:35},
    {user:"67783129c828bee215aa9d90",title:"Smoothie de Fresas",category:"Snack",description:"Refrescante smoothie de fresas y plátano.",ingredients:["Fresas","Plátano","Leche","Miel"],steps:"1. Mezcla todos los ingredientes en una licuadora. 2. Sirve frío.",difficulty:"Fácil",prepTime:10}
] 


async function seedDatabase() {
    try {
        console.log('🌱 Sembrando la base de datos...');
        // Insertar usuarios
        for(let u in users){
            const user = new User(users[u]);
            await user.save();
        }
        console.log(`✅ Usuarios insertados`);
        for(let p in publications){
            const publication = new Publication(publications[p]);
            await publication.save();
        }
        console.log(`✅ Publicaciones insertadas`);
        
    } catch (error) {
        console.error('❌ Error al popular la base de datos:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}
