const mongoose = require('mongoose');
const User = require('./models/user');
const Publication = require('./models/publication');
const Follow = require('./models/follow');

// Datos de 10 usuarios sin el campo "role" y en una sola línea
const users = [
    { name: 'Juan', surname: 'Perez', email: 'juan@example.com', nick: 'juanp', password: 'password123' },
    { name: 'Ana', surname: 'Lopez', email: 'ana@example.com', nick: 'anal', password: 'password123' },
    { name: 'Carlos', surname: 'Garcia', email: 'carlos@example.com', nick: 'carlosg', password: 'password123' },
    { name: 'Lucia', surname: 'Martinez', email: 'lucia@example.com', nick: 'luciam', password: 'password123' },
    { name: 'Pedro', surname: 'Gomez', email: 'pedro@example.com', nick: 'pedrog', password: 'password123' },
    { name: 'Maria', surname: 'Fernandez', email: 'maria@example.com', nick: 'mariaf', password: 'password123' },
    { name: 'Luis', surname: 'Sanchez', email: 'luis@example.com', nick: 'luiss', password: 'password123' },
    { name: 'Laura', surname: 'Rodriguez', email: 'laura@example.com', nick: 'laurar', password: 'password123' },
    { name: 'Miguel', surname: 'Perez', email: 'miguel@example.com', nick: 'miguelp', password: 'password123' },
    { name: 'Sofia', surname: 'Martinez', email: 'sofia@example.com', nick: 'sofia', password: 'password123' }
];

// Datos de 20 publicaciones sin el campo "image" ni "file" y en una sola línea
const publications = [
    { title: 'Desayuno Saludable', category: 'Desayuno', description: 'Una receta fácil y rápida para un desayuno saludable.', ingredients: ['Avena', 'Frutas', 'Yogurt'], steps: 'Mezclar la avena con el yogurt, agregar frutas por encima y servir.', views: 100, tags: ['Rápido', 'Saludable'], difficulty: 'Fácil', prepTime: 10 },
    { title: 'Almuerzo Vegano', category: 'Vegano', description: 'Un almuerzo delicioso para quienes siguen una dieta vegana.', ingredients: ['Tofu', 'Arroz integral', 'Verduras'], steps: 'Cocinar el tofu con las verduras y servir con arroz integral.', views: 150, tags: ['Saludable', 'Económico', 'Vegetariano'], difficulty: 'Intermedio', prepTime: 25 },
    { title: 'Cena Ligera', category: 'Cena', description: 'Una cena ligera perfecta para terminar el día sin pesadez.', ingredients: ['Ensalada', 'Pechuga de pollo', 'Aguacate'], steps: 'Cocinar la pechuga de pollo y servir con ensalada y aguacate.', views: 80, tags: ['Fácil', 'Económico'], difficulty: 'Fácil', prepTime: 20 },
    { title: 'Postre de Chocolate', category: 'Postre', description: 'Un postre de chocolate fácil de hacer y delicioso.', ingredients: ['Chocolate', 'Harina', 'Azúcar', 'Mantequilla'], steps: 'Derretir el chocolate y mezclar con los ingredientes. Hornear y enfriar.', views: 200, tags: ['Dulce', 'Fácil'], difficulty: 'Fácil', prepTime: 30 },
    { title: 'Snack Saludable', category: 'Snack', description: 'Un snack saludable para media tarde.', ingredients: ['Frutos secos', 'Yogurt', 'Fruta'], steps: 'Mezclar los frutos secos con el yogurt y añadir la fruta picada.', views: 120, tags: ['Saludable', 'Rápido'], difficulty: 'Fácil', prepTime: 10 },
    { title: 'Tacos Veganos', category: 'Vegano', description: 'Tacos deliciosos y veganos para disfrutar cualquier día.', ingredients: ['Tortillas', 'Tofu', 'Verduras', 'Salsa'], steps: 'Cocinar el tofu, rellenar las tortillas con tofu y verduras, añadir salsa.', views: 140, tags: ['Vegetariano', 'Saludable'], difficulty: 'Intermedio', prepTime: 20 },
    { title: 'Pizza Casera', category: 'Cena', description: 'Haz tu propia pizza con ingredientes frescos y sabrosos.', ingredients: ['Masa de pizza', 'Tomate', 'Queso', 'Pepperoni'], steps: 'Preparar la masa, añadir tomate, queso y pepperoni, y hornear.', views: 250, tags: ['Fácil', 'Económico'], difficulty: 'Fácil', prepTime: 30 },
    { title: 'Sopa de Lentejas', category: 'Almuerzo', description: 'Una sopa reconfortante de lentejas.', ingredients: ['Lentejas', 'Zanahorias', 'Cebolla', 'Ajo'], steps: 'Cocer las lentejas con las verduras y añadir especias al gusto.', views: 90, tags: ['Económico', 'Fácil'], difficulty: 'Fácil', prepTime: 40 },
    { title: 'Ensalada de Atún', category: 'Almuerzo', description: 'Una ensalada fresca y rápida con atún.', ingredients: ['Atún', 'Lechuga', 'Tomate', 'Aceitunas'], steps: 'Mezclar todos los ingredientes y servir.', views: 110, tags: ['Rápido', 'Saludable'], difficulty: 'Fácil', prepTime: 10 },
    { title: 'Smoothie de Fresas', category: 'Postre', description: 'Un smoothie delicioso y saludable.', ingredients: ['Fresas', 'Yogurt', 'Leche'], steps: 'Mezclar las fresas con yogurt y leche, y servir.', views: 130, tags: ['Saludable', 'Fácil'], difficulty: 'Fácil', prepTime: 5 },
    { title: 'Galletas Caseras', category: 'Postre', description: 'Galletas caseras, perfectas para acompañar con café.', ingredients: ['Harina', 'Azúcar', 'Mantequilla', 'Chocolate'], steps: 'Mezclar los ingredientes, formar las galletas y hornear.', views: 180, tags: ['Dulce', 'Fácil'], difficulty: 'Fácil', prepTime: 25 },
    { title: 'Hamburguesa Vegetariana', category: 'Cena', description: 'Una hamburguesa deliciosa sin carne.', ingredients: ['Pan de hamburguesa', 'Tofu', 'Lechuga', 'Tomate'], steps: 'Cocinar el tofu y montar la hamburguesa con los ingredientes.', views: 160, tags: ['Vegetariano', 'Económico'], difficulty: 'Intermedio', prepTime: 20 },
    { title: 'Arroz Integral con Verduras', category: 'Almuerzo', description: 'Un plato de arroz integral con una mezcla de verduras frescas.', ingredients: ['Arroz integral', 'Brócoli', 'Zanahorias', 'Pimientos'], steps: 'Cocer el arroz y las verduras, mezclar y servir.', views: 140, tags: ['Saludable', 'Económico'], difficulty: 'Fácil', prepTime: 30 },
    { title: 'Tarta de Manzana', category: 'Postre', description: 'Una tarta clásica de manzana que encanta a todos.', ingredients: ['Manzanas', 'Harina', 'Azúcar', 'Mantequilla'], steps: 'Preparar la masa, añadir las manzanas y hornear.', views: 220, tags: ['Dulce', 'Fácil'], difficulty: 'Intermedio', prepTime: 45 },
    { title: 'Ensalada de Quinoa', category: 'Vegano', description: 'Una ensalada fresca y rica en proteínas vegetales.', ingredients: ['Quinoa', 'Pepino', 'Tomate', 'Aguacate'], steps: 'Cocer la quinoa y mezclar con los demás ingredientes.', views: 160, tags: ['Saludable', 'Vegetariano'], difficulty: 'Fácil', prepTime: 25 },
    { title: 'Pasta al Pesto', category: 'Cena', description: 'Una pasta al pesto sencilla y deliciosa.', ingredients: ['Pasta', 'Albahaca', 'Ajo', 'Aceite de oliva'], steps: 'Cocer la pasta, mezclar con pesto y servir.', views: 170, tags: ['Fácil', 'Rápido'], difficulty: 'Fácil', prepTime: 15 },
    { title: 'Fajitas de Pollo', category: 'Cena', description: 'Fajitas de pollo fáciles de preparar para la cena.', ingredients: ['Pollo', 'Pimientos', 'Cebolla', 'Tortillas'], steps: 'Cocinar el pollo con los pimientos y cebolla, montar las fajitas.', views: 210, tags: ['Fácil', 'Económico'], difficulty: 'Fácil', prepTime: 30 },
    { title: 'Muffins de Arándano', category: 'Postre', description: 'Muffins de arándano perfectos para el desayuno.', ingredients: ['Harina', 'Arándonos', 'Azúcar', 'Leche'], steps: 'Mezclar los ingredientes, formar los muffins y hornear.', views: 150, tags: ['Dulce', 'Fácil'], difficulty: 'Fácil', prepTime: 25 },
    { title: 'Sushi Casero', category: 'Cena', description: 'Sushi casero para los amantes de la comida japonesa.', ingredients: ['Arroz para sushi', 'Pescado fresco', 'Algas nori', 'Aguacate'], steps: 'Preparar el arroz, montar el sushi y cortar en piezas.', views: 240, tags: ['Internacional', 'Fácil'], difficulty: 'Intermedio', prepTime: 40 },
    { title: 'Tarta de Limón', category: 'Postre', description: 'Tarta de limón con un toque fresco y ácido.', ingredients: ['Limón', 'Harina', 'Azúcar', 'Huevos'], steps: 'Preparar la masa, añadir el relleno de limón y hornear.', views: 180, tags: ['Dulce', 'Fácil'], difficulty: 'Intermedio', prepTime: 35 }
];


// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/RecipeWeb')
    .then(() => {
        console.log('🔗🟢 Conexión a MongoDB establecida correctamente');
        // Llamar a las funciones que deseas ejecutar
        deleteAllUsers()
            .then(() => {
                deleteAllPublications().then(() => {
                    deleteAllFollows().then(() => {
                        insertUsers();
                    });
                });
            })
            .catch((err) => {
                console.error('Error al borrar usuarios:', err);
                mongoose.connection.close();
            });
    })
    .catch((err) => {
        console.error('Error al conectar con la base de datos:', err);
    });

// Método para borrar todos los usuarios
function deleteAllUsers() {
    return User.deleteMany({});
}
// Método para borrar todos las publicaciones
function deleteAllPublications() {
    return Publication.deleteMany({});
}
// Método para borrar todos los follows
function deleteAllFollows() {
    return Follow.deleteMany({});
}

// Método para insertar los usuarios
function insertUsers() {
    const promises = users.map(userData => {
        const user = new User(userData);
        return user.save();
    });

    Promise.all(promises)
        .then((result) => {
            insertPublications(result);
        })
        .catch((err) => {
            console.error('Error al insertar usuarios:', err);
            mongoose.connection.close();
        });
}

// Método para insertar las publicaciones
function insertPublications(users) {
    const promises = publications.map((publicationData, index) => {
        const user = users[index % users.length]; // Tomar un usuario por cada publicación
        const publication = new Publication({ ...publicationData, user: user._id }); 
        return publication.save();
    });

    // Esperar que todas las publicaciones se guarden
    Promise.all(promises)
        .then((result) => {
            insertFollowRelations(); 
        })
        .catch((err) => {
            console.error('Error al insertar publicaciones:', err);
            mongoose.connection.close();
        });
}

// Método para insertar relaciones de follow entre usuarios
function insertFollowRelations() {
    const followRelations = [
        { user: 'juanp', followed: 'anal' },
        { user: 'juanp', followed: 'luciam' },
        { user: 'juanp', followed: 'pedrog' },
        { user: 'juanp', followed: 'carlosg' },
        { user: 'juanp', followed: 'sofia' },
        { user: 'carlosg', followed: 'luciam' },
        { user: 'luciam', followed: 'pedrog' },
        { user: 'pedrog', followed: 'juanp' },
        { user: 'mariaf', followed: 'carlosg' },
        { user: 'luiss', followed: 'laurar' },
        { user: 'miguelp', followed: 'sofia' },
        { user: 'sofia', followed: 'juanp' },
        { user: 'laurar', followed: 'miguelp' },
        { user: 'anal', followed: 'luiss' },
        { user: 'juanp', followed: 'juanp' },
        { user: 'anal', followed: 'anal' },
        { user: 'carlosg', followed: 'carlosg' },
        { user: 'luciam', followed: 'luciam' },
        { user: 'pedrog', followed: 'pedrog' },
        { user: 'mariaf', followed: 'mariaf' },
        { user: 'luiss', followed: 'luiss' },
        { user: 'laurar', followed: 'laurar' },
        { user: 'miguelp', followed: 'miguelp' },
        { user: 'sofia', followed: 'sofia' }
    ];

    User.find({ 'nick': { $in: ['juanp', 'anal', 'carlosg', 'luciam', 'pedrog', 'mariaf', 'luiss', 'laurar', 'miguelp', 'sofia'] } })
        .then(users => {
            const promises = followRelations.map(follow => {
                const user = users.find(u => u.nick === follow.user);
                const followedUser = users.find(u => u.nick === follow.followed);

                // Crear la relación Follow (debes tener este modelo definido en tu proyecto)
                const followInstance = new Follow({
                    user: user.id, // El ID del usuario que sigue
                    followed: followedUser.id // El ID del usuario seguido
                });

                return followInstance.save(); 
            });

            return Promise.all(promises); 
        })
        .then(() => {
            console.log('✅ Datos insertados correctamente ✅');
            mongoose.connection.close(); 
        })
        .catch((err) => {
            console.error('Error al insertar las relaciones de follow:', err);
            mongoose.connection.close();
        });
}
