var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("config/index", ["require", "exports", "pg", "dotenv/config"], function (require, exports, pg_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pool = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    pool.connect();
    exports.default = pool;
});
define("middleware/authMiddleware", ["require", "exports", "express-async-handler", "jsonwebtoken", "config/index"], function (require, exports, express_async_handler_1, jsonwebtoken_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.protectOld = exports.protect = void 0;
    express_async_handler_1 = __importDefault(express_async_handler_1);
    jsonwebtoken_1 = __importDefault(jsonwebtoken_1);
    index_1 = __importDefault(index_1);
    const secret = process.env.JWT_SECRET;
    const protect = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                const { rows: [user] } = yield index_1.default.query('select username, name, created_on from "User" where username = $1', [decoded.username]);
                req.user = user;
                next();
            }
            catch (error) {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }
        }
        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }
    }));
    exports.protect = protect;
    const protectOld = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        req.user = 'thiomark';
        next();
    }));
    exports.protectOld = protectOld;
});
// const admin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//       next()
//   } else {
//       res.status(401)
//       throw new Error('Not authorized as an admin')
//   }
// }
// module.exports = { 
//     protect, 
//     admin 
// }
define("routes/budgetRoute", ["require", "exports", "express", "express-async-handler", "config/index", "middleware/authMiddleware", "uuid"], function (require, exports, express_1, express_async_handler_2, index_2, authMiddleware_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    express_1 = __importDefault(express_1);
    express_async_handler_2 = __importDefault(express_async_handler_2);
    index_2 = __importDefault(index_2);
    const router = express_1.default.Router();
    router.get('/', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.user;
        const { rows } = yield index_2.default.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "removed_amount", budget + cast(coalesce(sum(dd.amount), 0) AS int) as "remaining_amount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
        res.json(rows);
    })));
    router.get('/:id', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { rows: [budget] } = yield index_2.default.query(`SELECT * FROM "Budget" WHERE id = $1`, [id]);
        res.json(budget);
    })));
    router.post('/', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.user;
        const { budget, created_on } = req.body;
        if (!budget)
            throw new Error('Provide a budget');
        const id = (0, uuid_1.v4)();
        const { rows } = yield index_2.default.query('INSERT INTO "Budget" (budget, user_id, id, created_on) values ($1, $2, $3, $4) returning *', [budget, username, id, new Date(created_on).toISOString()]);
        yield index_2.default.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, username]);
        res.json(rows);
    })));
    router.post('/add/:id', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.user;
        const { userToAdd } = req.body;
        const { id } = req.params;
        if (!userToAdd)
            throw new Error('Provide a user to add');
        const { rows: [budget] } = yield index_2.default.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
        if (!budget)
            throw new Error(`You do not have permision to add users`);
        const { rows: [user] } = yield index_2.default.query('select * from "User" where username = $1', [userToAdd]);
        if (!user)
            throw new Error('User does not exist');
        yield index_2.default.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, userToAdd]);
        res.json({ message: "User added to your budgets" });
    })));
    router.delete('/:id', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { username } = req.user;
        const { rows: [budget] } = yield index_2.default.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
        if (!budget)
            throw new Error(`You do not have permision to add users`);
        yield index_2.default.query('DELETE FROM "BudgetUser" WHERE budget_id = $1', [id]);
        yield index_2.default.query('DELETE FROM "Budget" WHERE id = $1', [id]);
        res.json({ success: true });
    })));
    router.post('/:id', authMiddleware_1.protect, (0, express_async_handler_2.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { budget } = req.body;
        const { id } = req.params;
        if (!budget)
            throw new Error('Provide a budget');
        const { rows } = yield index_2.default.query('UPDATE "Budget" SET budget = $1 WHERE id = $2 returning *', [budget, id]);
        res.json(rows);
    })));
    exports.default = router;
});
define("utils/helperFunctions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchForItem = void 0;
    const searchForItem = (deductionArray, firebaseImagesArray) => {
        return deductionArray.map(deduction => {
            var _a;
            return Object.assign(Object.assign({}, deduction), { image: (_a = firebaseImagesArray.find(image => image.imageName === deduction.image)) === null || _a === void 0 ? void 0 : _a.url });
        });
    };
    exports.searchForItem = searchForItem;
});
define("routes/deductionRoute", ["require", "exports", "express", "express-async-handler", "middleware/authMiddleware", "config/index", "uuid", "multer", "firebase/storage", "utils/helperFunctions"], function (require, exports, express_2, express_async_handler_3, authMiddleware_2, index_3, uuid_2, multer_1, storage_1, helperFunctions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    express_2 = __importDefault(express_2);
    express_async_handler_3 = __importDefault(express_async_handler_3);
    index_3 = __importDefault(index_3);
    multer_1 = __importDefault(multer_1);
    const route = express_2.default.Router();
    const memoryStorage = multer_1.default.memoryStorage();
    const multerUpload = (0, multer_1.default)({
        storage: memoryStorage
    });
    // @desc    uploading a image with budget id
    // @route   GET /api/v1/deductions/image
    // @access  Private
    route.post('/image/:id', multerUpload.single('featuredImage'), (0, express_async_handler_3.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const file = req.file;
        const { id } = req.params;
        if (file) {
            const storage = (0, storage_1.getStorage)();
            const reff = (0, storage_1.ref)(storage, `budgets/${id}/${file.originalname}`);
            // const img = await fetch(file.buffer);
            // const bytes = await img.blob();
            yield (0, storage_1.uploadBytes)(reff, file.buffer);
        }
        res.send('hello');
    })));
    // @desc    Fetch deductions by the budget id
    // @route   GET /api/v1/deductions/:id
    // @access  Private
    route.get('/:id', authMiddleware_2.protect, (0, express_async_handler_3.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { username } = req.user;
        const storage = (0, storage_1.getStorage)();
        const listRef = (0, storage_1.ref)(storage, `budgets/${id}`);
        const { items } = yield (0, storage_1.listAll)(listRef);
        const images = yield Promise.all(items.map((itemRef) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                url: yield (0, storage_1.getDownloadURL)((0, storage_1.ref)(storage, `budgets/${id}/${itemRef.name}`)),
                imageName: itemRef.name
            };
        })));
        const { rows } = yield index_3.default.query(`select d.* from "Deduction" d inner join "BudgetUser" bu on bu.budget_id = d.budgets_id 
                                            where budgets_id = $1 and username = $2 order by created_on desc`, [id, username]);
        res.send((0, helperFunctions_1.searchForItem)(rows, images));
    })));
    // @desc    Adding a deduction by budget id
    // @route   POST /api/v1/deductions/:id
    // @access  Private
    route.post('/:id', authMiddleware_2.protect, (0, express_async_handler_3.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { username } = req.user;
        let { amount, description, image, tags, created_on } = req.body;
        if (!amount)
            throw new Error('Provide an amount deducted');
        const { rows: [record] } = yield index_3.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [id, username]);
        if (!record)
            throw new Error('You do not have permission to do that');
        const newID = (0, uuid_2.v4)();
        const { rows: [newDeduction] } = yield index_3.default.query(`insert into "Deduction" (amount, description, image, tags, id, budgets_id, created_on)
                                                        values ($1, $2, $3, $4, $5, $6, $7) returning *`, [amount, description, image, tags, newID, id, new Date(created_on).toISOString()]);
        if (image) {
            const storage = (0, storage_1.getStorage)();
            image = yield (0, storage_1.getDownloadURL)((0, storage_1.ref)(storage, `budgets/${id}/${image}`));
        }
        res.json(Object.assign(Object.assign({}, newDeduction), { image }));
    })));
    // @desc    Editing a deduction by budget-id and deduction-id
    // @route   POST /api/v1/deductions/:id
    // @access  Private
    route.post('/:budgetID/:id', authMiddleware_2.protect, (0, express_async_handler_3.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { budgetID, id } = req.params;
        const { username } = req.user;
        const { amount, description, tags, created_on } = req.body;
        if (!amount)
            throw new Error('Provide an amount deducted');
        const { rows: [record] } = yield index_3.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
        if (!record)
            throw new Error('You do not have permission to do that');
        const { rows: [deduction] } = yield index_3.default.query(`UPDATE "Deduction" SET amount = $1, description = $2, tags = $3, created_on = $4 
                                                    WHERE id = $5 returning *`, [amount, description, tags, new Date(created_on).toISOString(), id]);
        res.json(deduction);
    })));
    // @desc    deleting a deductions by the budget-id and deduction-id
    // @route   GET /api/v1/deductions/:budgetID/:id
    // @access  Private
    route.delete('/:budgetID/:id', authMiddleware_2.protect, (0, express_async_handler_3.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { budgetID, id } = req.params;
        const { username } = req.user;
        const { rows: [record] } = yield index_3.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
        if (!record)
            throw new Error('You do not have permission to do that');
        const { rows: [singleDeduction] } = yield index_3.default.query(`select * from "Deduction" where id = $1`, [id]);
        yield index_3.default.query(`delete from "Deduction" where id = $1`, [id]);
        if (singleDeduction.image) {
            const storage = (0, storage_1.getStorage)();
            const desertRef = (0, storage_1.ref)(storage, `budgets/${budgetID}/${singleDeduction.image}`);
            try {
                yield (0, storage_1.deleteObject)(desertRef);
            }
            catch (error) {
                console.log(error);
            }
        }
        res.json({ success: true });
    })));
    exports.default = route;
});
define("utils/generateToken", ["require", "exports", "jsonwebtoken"], function (require, exports, jsonwebtoken_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    jsonwebtoken_2 = __importDefault(jsonwebtoken_2);
    const secret = process.env.JWT_SECRET;
    const generateToken = (username) => {
        return jsonwebtoken_2.default.sign({ username }, secret, {
            expiresIn: '30d',
        });
    };
    exports.default = generateToken;
});
define("routes/userRoute", ["require", "exports", "express", "express-async-handler", "bcryptjs", "config/index", "utils/generateToken"], function (require, exports, express_3, express_async_handler_4, bcryptjs_1, index_4, generateToken_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    express_3 = __importDefault(express_3);
    express_async_handler_4 = __importDefault(express_async_handler_4);
    bcryptjs_1 = __importDefault(bcryptjs_1);
    index_4 = __importDefault(index_4);
    generateToken_1 = __importDefault(generateToken_1);
    const route = express_3.default.Router();
    route.post('/register', (0, express_async_handler_4.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, password } = req.body;
        const { rows: [user] } = yield index_4.default.query(`select * from "User" where username = $1`, [email]);
        if (!password)
            throw new Error('Please provide a password');
        if (user)
            throw new Error('Email already exist');
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const { rows: [newUser] } = yield index_4.default.query('insert into "User" (username, password, name) values ($1, $2, $3) returning username, name, created_on', [email, hashedPassword, name]);
        res.status(201).json({
            token: (0, generateToken_1.default)(newUser.username)
        });
    })));
    route.post('/login', (0, express_async_handler_4.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        const { rows: [user] } = yield index_4.default.query(`select * from "User" where username = $1`, [email]);
        if (!password)
            throw new Error('Please provide a password');
        if (!user)
            throw new Error('invalid credentials');
        const checkPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!checkPassword)
            throw new Error('invalid credentials');
        res.status(201).json({
            token: (0, generateToken_1.default)(user.username)
        });
    })));
    exports.default = route;
});
define("middleware/errorHandler", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.errorHandler = exports.notFound = void 0;
    const notFound = (req, res, next) => {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        res.status(404);
        next(error);
    };
    exports.notFound = notFound;
    const errorHandler = (err, req, res, next) => {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        console.log(err.message);
        res.status(statusCode);
        res.json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    };
    exports.errorHandler = errorHandler;
});
define("app", ["require", "exports", "express", "routes/budgetRoute", "routes/deductionRoute", "routes/userRoute", "helmet", "morgan", "path", "cors", "middleware/errorHandler", "firebase/app", "dotenv/config"], function (require, exports, express_4, budgetRoute_1, deductionRoute_1, userRoute_1, helmet_1, morgan_1, path_1, cors_1, errorHandler_1, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    express_4 = __importDefault(express_4);
    budgetRoute_1 = __importDefault(budgetRoute_1);
    deductionRoute_1 = __importDefault(deductionRoute_1);
    userRoute_1 = __importDefault(userRoute_1);
    helmet_1 = __importDefault(helmet_1);
    morgan_1 = __importDefault(morgan_1);
    path_1 = __importDefault(path_1);
    cors_1 = __importDefault(cors_1);
    (0, app_1.initializeApp)({
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId,
        measurementId: process.env.measurementId
    });
    const app = (0, express_4.default)();
    app.use((0, helmet_1.default)());
    app.use(express_4.default.json());
    app.use((0, cors_1.default)());
    if (process.env.NODE_ENV === 'development') {
        app.use((0, morgan_1.default)('dev'));
    }
    app.use('/api/v2/images', express_4.default.static(path_1.default.join(__dirname, './images')));
    app.use('/api/v2/budgets', budgetRoute_1.default);
    app.use('/api/v2/deductions', deductionRoute_1.default);
    app.use('/api/v2/users', userRoute_1.default);
    const PORT = process.env.PORT;
    app.use(errorHandler_1.notFound);
    app.use(errorHandler_1.errorHandler);
    app.listen(PORT, () => {
        console.log(process.env.NODE_ENV === 'development' ? `server running on PORT ${PORT}` : `server running`);
    });
});
define("middleware/upload", ["require", "exports", "multer", "path"], function (require, exports, multer_2, path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    multer_2 = __importDefault(multer_2);
    path_2 = __importDefault(path_2);
    const storage = multer_2.default.diskStorage({
        destination: (req, file, cb) => {
            console.log(file);
            cb(null, path_2.default.join(__dirname, '/images/'));
        },
        filename: (req, file, cb) => {
            // const storage = getStorage();
            // const reff = ref(storage, `budgets/${imageName}`);
            // const img = await fetch(deduction.image);
            // const bytes = await img.blob();
            // await uploadBytes(reff, bytes);
            //!should be in the react app 
            /**
             * imageName = `budget-img-${Date.now()}-${deduction.amount}`
                    const formData = new FormData();
                    formData.append('photo', { uri: deduction.image, name: imageName, type: 'image/jpg' });
    
                    await fetch(`${url}/deductions/image`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'content-type': 'multipart/form-data',
                            Authorization: `Bearer ${user}`
                        },
                    });
             */
            cb(null, file.originalname);
        }
    });
    const upload = (0, multer_2.default)({ storage });
    exports.default = upload;
});
define("middleware/uploadFile ", ["require", "exports", "path", "os", "fs", "busboy"], function (require, exports, path_3, os_1, fs_1, busboy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    path_3 = __importDefault(path_3);
    os_1 = __importDefault(os_1);
    fs_1 = __importDefault(fs_1);
    busboy_1 = __importDefault(busboy_1);
    exports.default = (req, res, next) => {
        if (req.method !== 'POST') {
            // Return a "method not allowed" error
            return res.status(405).end();
        }
        const busboy = (0, busboy_1.default)({ headers: req.headers });
        const tmpdir = os_1.default.tmpdir();
        // This object will accumulate all the fields, keyed by their name
        const fields = {};
        // This object will accumulate all the uploaded files, keyed by their name.
        const uploads = {};
        // This code will process each non-file field in the form.
        busboy.on('field', (fieldname, val) => {
            /**
             *  TODO(developer): Process submitted field values here
             */
            console.log(`Processed field ${fieldname}: ${val}.`);
            fields[fieldname] = val;
        });
        const fileWrites = [];
        // This code will process each file uploaded.
        busboy.on('file', (fieldname, file, filename) => {
            // Note: os.tmpdir() points to an in-memory file system on GCF
            // Thus, any files in it must fit in the instance's memory.
            console.log(`Processed file ${filename}`);
            const filepath = path_3.default.join(tmpdir, filename);
            uploads[fieldname] = filepath;
            const writeStream = fs_1.default.createWriteStream(filepath);
            file.pipe(writeStream);
            // File was processed by Busboy; wait for it to be written.
            // Note: GCF may not persist saved files across invocations.
            // Persistent files must be kept in other locations
            // (such as Cloud Storage buckets).
            const promise = new Promise((resolve, reject) => {
                file.on('end', () => {
                    writeStream.end();
                });
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            fileWrites.push(promise);
        });
        // Triggered once all uploaded files are processed by Busboy.
        // We still need to wait for the disk writes (saves) to complete.
        busboy.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all(fileWrites);
            /**
             * TODO(developer): Process saved files here
             */
            for (const file in uploads) {
                fs_1.default.unlinkSync(uploads[file]);
            }
            res.send();
        }));
        busboy.end(req.rawBody);
    };
});
define("routes/oldRoute", ["require", "exports", "express", "express-async-handler", "middleware/authMiddleware", "config/index"], function (require, exports, express_5, express_async_handler_5, authMiddleware_3, index_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    express_5 = __importDefault(express_5);
    express_async_handler_5 = __importDefault(express_async_handler_5);
    index_5 = __importDefault(index_5);
    const route = express_5.default.Router();
    route.get('/budgets', authMiddleware_3.protectOld, (0, express_async_handler_5.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const username = 'thiomark';
        const { rows } = yield index_5.default.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "remaingAmount", budget + cast(coalesce(sum(dd.amount), 0) AS int) as "remaingAmount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
        res.json(rows);
    })));
    // app.use('/api/v1/images', express.static(path.join(__dirname, './images')));
    // app.get('/api/v1/budgets', (req, res) => {
    //     const rawdata = fs.readFileSync('./config/budget.json');
    //     const rawdata2 = fs.readFileSync('./config/deductions.json');
    //     const myBudgets = JSON.parse(rawdata);
    //     const myDeductions = JSON.parse(rawdata2);
    //     if(myBudgets && myDeductions){
    //         const allBudgets = myBudgets.map(budget => {
    //             const remaingAmount = myDeductions
    //                 .filter(x => x.budgetsID === budget.id)
    //                 .reduce((acc, value) => value.amount + acc, 0);
    //             return {...budget, remaingAmount: budget.budget + remaingAmount}
    //         })
    //         res.json(allBudgets);
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //     }
    // });
    // app.post('/api/v1/budgets', async (req, res) => {
    //     const {budget} = req.body;
    //     if(budget){
    //         let rawdata = fs.readFileSync('./config/budget.json');
    //         let myBudgets = JSON.parse(rawdata);
    //         if(myBudgets){
    //             const newBudget = {id: uuidv4(), budget}
    //             const allBudgets = [newBudget, ...myBudgets]
    //             let newData = JSON.stringify(allBudgets);
    //             try {
    //                 fs.writeFileSync('./config/budget.json', newData);
    //                 return res.json(newBudget);
    //             } catch (error) {
    //                 return res.status(500).json({
    //                     success: false,
    //                     message: error.message
    //                 })
    //             }
    //         }else{
    //             return res.status(500).json({
    //                 success: false,
    //                 message: 'Something happended the data file is not working'
    //             })
    //         }
    //     }else{
    //         return res.status(404).json({
    //             success: false,
    //             message: 'Please provide the budget'
    //         })
    //     }
    // });
    // app.delete('/api/v1/budgets/:id', async (req, res) => {
    //     const {id} = req.params;
    //     let rawdata = fs.readFileSync('./config/budget.json');
    //     let myBudgets = JSON.parse(rawdata);
    //     if(myBudgets){
    //         const allBudgets = myBudgets.filter(x => x.id !== id)
    //         const newData = JSON.stringify(allBudgets);
    //         try {
    //             fs.writeFileSync('./config/budget.json', newData);
    //             return res.json(allBudgets);
    //         } catch (error) {
    //             return res.status(500).json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         }
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //         }
    // });
    // app.delete('/api/v1/deductions/:id', async (req, res) => {
    //     const {id} = req.params;
    //     let rawdata = fs.readFileSync('./config/deductions.json');
    //     let myBudgets = JSON.parse(rawdata);
    //     if(myBudgets){
    //         const allBudgets = myBudgets.filter(x => x.id !== id)
    //         const newData = JSON.stringify(allBudgets);
    //         try {
    //             fs.writeFileSync('./config/deductions.json', newData);
    //             return res.json(allBudgets);
    //         } catch (error) {
    //             return res.status(500).json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         }
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //         }
    // });
    // app.get('/api/v1/deductions/:id', (req, res) => {
    //     const rawdata = fs.readFileSync('./config/deductions.json');
    //     const myDeductions = JSON.parse(rawdata);
    //     const {id} = req.params
    //     if(myDeductions){
    //         const currentDeductions = myDeductions.filter(x => x.budgetsID === id)
    //         res.json(currentDeductions);
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //     }
    // });
    // app.post('/api/v1/deductions/image', upload.single('photo'), (req, res) => {
    //     res.send({message: 'saved'})  
    // });
    // app.post('/api/v1/deductions', (req, res) => {
    //     const {amount, description, budgetsID, image, tags} = req.body;
    //     if(image){
    //         const compressedImage = path.join(__dirname, 'images', image);
    //         sharp(image).resize(1000, 1000).jpeg({
    //             quality: 70,
    //             chromaSubsampling: '4:4:4'
    //         }).toFile(compressedImage, (err, info) => {})
    //     }
    //     if(!amount || !budgetsID) return res.status(404).json({message: 'enter all fields'});
    //     let rawdata = fs.readFileSync('./config/deductions.json');
    //     let myDeductions = JSON.parse(rawdata);
    //     if(myDeductions){
    //         const newDeduction = {id: uuidv4(), amount, description, tags, budgetsID, image}
    //         const allDeductions = [newDeduction, ...myDeductions];
    //         let newData = JSON.stringify(allDeductions);
    //         try {
    //             fs.writeFileSync('./config/deductions.json', newData);
    //             return res.json(newDeduction);
    //         } catch (error) {
    //             return res.status(500).json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         }
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //     }
    // });
    // app.post('/api/v1/deductions/:id', (req, res) => {
    //     const {image} = req.body;
    //     if(!image) return; //! fix later too lazy now
    //     const compressedImage = path.join(__dirname, 'images', image);
    //     sharp(image).resize(1000, 1000).jpeg({
    //         quality: 70,
    //         chromaSubsampling: '4:4:4'
    //     }).toFile(compressedImage, (err, info) => {})
    //     let rawdata = fs.readFileSync('./config/deductions.json');
    //     let myDeductions = JSON.parse(rawdata);
    //     if(myDeductions){
    //         const updatedDeductions = myDeductions.map(element => {
    //             if(element.id === req.params.id){
    //                 element.image = image;
    //             }
    //             return element
    //         });
    //         let newData = JSON.stringify(updatedDeductions);
    //         try {
    //             fs.writeFileSync('./config/deductions.json', newData);
    //             return res.json({success: false});
    //         } catch (error) {
    //             return res.status(500).json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         }
    //     }else{
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Something happended the data file is not working'
    //         })
    //     }
    // });
    exports.default = route;
});
