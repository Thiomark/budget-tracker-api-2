"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const busboy_1 = __importDefault(require("busboy"));
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
        const filepath = path_1.default.join(tmpdir, filename);
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
