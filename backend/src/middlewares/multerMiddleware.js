import multer from 'multer';

// Initial setup make changs later
// setting up storage

const storage = multer.diskStorage({destination: "uploads/"});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false); // Reject the file
    }
  };
  export const upload = multer({
    storage: storage,
    // fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB limit per file
    },
}).single("profile");  // will comment out later and give the fields in routes