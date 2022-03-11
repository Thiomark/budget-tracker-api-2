"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const budgetRoute_1 = __importDefault(require("./routes/budgetRoute"));
const deductionRoute_1 = __importDefault(require("./routes/deductionRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const errorHandler_1 = require("./middleware/errorHandler");
const app_1 = require("firebase/app");
(0, app_1.initializeApp)({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
});
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use('/api/v2/images', express_1.default.static(path_1.default.join(__dirname, './images')));
app.use('/api/v2/budgets', budgetRoute_1.default);
app.use('/api/v2/deductions', deductionRoute_1.default);
app.use('/api/v2/users', userRoute_1.default);
const PORT = process.env.PORT;
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(process.env.NODE_ENV === 'development' ? `server running on PORT ${PORT}` : `server running`);
});
