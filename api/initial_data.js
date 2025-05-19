
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Importación de modelos
const User = require('./models/user');
const Publication = require('./models/publication');
const Comment = require('./models/comment');
const Follow = require('./models/follow');
const Like = require('./models/like');
const Message = require('./models/message');

const dataFolder = path.join(__dirname, 'data');

mongoose.connect('mongodb://localhost:27017/RecipeWeb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('🟢 Conectado correctamente a MongoDB');
    return clearDatabase();
  })
  .then(() => importData())
  .then(() => {
    console.log('✅ Datos importados correctamente');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  });

async function clearDatabase() {
  await User.deleteMany({});
  await Publication.deleteMany({});
  await Comment.deleteMany({});
  await Follow.deleteMany({});
  await Like.deleteMany({});
  await Message.deleteMany({});
}

function cleanSpecialMongoTypes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanSpecialMongoTypes);
  } else if (obj && typeof obj === 'object') {
    if ('$oid' in obj) {
      return obj['$oid'];
    }
    if ('$date' in obj) {
      return new Date(obj['$date']);
    }

    const newObj = {};
    for (const key in obj) {
      newObj[key] = cleanSpecialMongoTypes(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function importData() {
  const collections = [
    { name: 'users', model: User },
    { name: 'publications', model: Publication },
    { name: 'comments', model: Comment },
    { name: 'follows', model: Follow },
    { name: 'likes', model: Like },
    { name: 'messages', model: Message }
  ];

  for (const { name, model } of collections) {
    const filePath = path.join(dataFolder, `RecipeWeb.${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo no encontrado: ${filePath}`);
      continue;
    }

    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);
    const cleanedData = jsonData.map(cleanSpecialMongoTypes);

    try {
      await model.insertMany(cleanedData);
      console.log(`✔ Insertados datos en la colección: ${name}`);
    } catch (err) {
      console.error(`❌ Error importando ${name}:`, err);
    }
  }
}
