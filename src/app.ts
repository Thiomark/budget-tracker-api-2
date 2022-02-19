import express from 'express';
import budgetRoute from './routes/budgetRoute';
import helmet from 'helmet';
import morgan from 'morgan'
import path from 'path'
import cors from 'cors';
import 'dotenv/config';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use('/api/v1/images', express.static(path.join(__dirname, './images')));
app.use('/api/v1/budgets', budgetRoute);

const PORT = process.env.PORT;

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(process.env.NODE_ENV === 'development' ? `server running on PORT ${PORT}` : `server running`);
})