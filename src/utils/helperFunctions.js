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
