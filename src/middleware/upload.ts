import multer from 'multer';
import path from 'path';
import {getStorage, ref, uploadBytes, deleteObject, listAll, getDownloadURL} from 'firebase/storage';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file)
        cb(null, path.join(__dirname, '/images/'))
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

        cb(null, file.originalname)
    }
});

const upload = multer({storage})

export default upload;