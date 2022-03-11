import express from 'express';
import budgetRoute from './routes/budgetRoute';
import deductionRoute from './routes/deductionRoute';
import userRoute from './routes/userRoute';
import helmet from 'helmet';
import morgan from 'morgan'
import path from 'path'
import cors from 'cors';
import 'dotenv/config';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initializeApp } from 'firebase/app';

initializeApp({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
});

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use('/api/v2/images', express.static(path.join(__dirname, './images')));
app.use('/api/v2/budgets', budgetRoute);
app.use('/api/v2/deductions', deductionRoute);
app.use('/api/v2/users', userRoute);

const PORT = process.env.PORT;

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(process.env.NODE_ENV === 'development' ? `server running on PORT ${PORT}` : `server running`);
})