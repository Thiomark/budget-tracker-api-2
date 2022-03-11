"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log(file);
        cb(null, path_1.default.join(__dirname, '/images/'));
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
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
