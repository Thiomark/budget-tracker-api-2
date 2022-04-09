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
const config_1 = __importDefault(require("./src/config"));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield config_1.default.query(`
        ALTER TABLE "Budget" RENAME COLUMN divideBy TO divide_by;
        ALTER TABLE "Deduction" RENAME COLUMN divideBy TO divide_by;


    
    `).then(x => {
            console.log('x.rows');
        }).catch(x => {
            console.log(x.message);
        });
    });
}
console.log(start());
