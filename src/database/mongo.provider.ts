import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb://root:root@localhost:27017'; // URL de connexion à MongoDB
const dbName = 'projet_SGBD'; // Nom de la base de données

export const DatabaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async (): Promise<Db> => {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName); // Retourne une instance de la base de données
  },
};
