interface SearchForItem {
    orginalArray: Array<string>;
    updatedArray: Array<string>;
}

interface deduction {
    id: string;
    amount: number;
    description: string;
    image?: string;
    created_on: any;
    tags: string
    budget_id: string;
}

interface image {
    url: string;
    imageName: string;
}

export const searchForItem = (deductionArray: Array<deduction>, firebaseImagesArray: Array<image>) : Array<deduction> => {
    return deductionArray.map(deduction => {
        return {...deduction, image: firebaseImagesArray.find(image => image.imageName === deduction.image)?.url}
    });
}