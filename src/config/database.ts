import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'electropi_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../models/*.{js,ts}'],
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  subscribers: [],
});

export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};
