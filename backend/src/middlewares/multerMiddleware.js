import multer from "multer";

import dotenv from "dotenv";
dotenv.config();

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   // console.log(file);
  //   cb(null, "./public/uploads/images");
  // },
  filename: function (req, file, cb) {
    const date = new Date();
    const fileName = file.originalname.split(".");
    cb(null, `${fileName[0]}-${date.getTime()}.${fileName[1]}`);
  },
});

export const upload = multer({
  storage,
});

// import multer from 'multer';

// // Initial setup make changes later
// // setting up storage
// // will use memoryStorage later instead of diskstorage
// const storage = multer.diskStorage({destination: "uploads/",
//   filename: (req, file, cb) => {
//   // Use original name or create a unique name
//   cb(null, `${Date.now()}-${file.originalname}`);
// }});

// // for later use if required

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/webp'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true); // Accept the file
//     } else {
//       cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false); // Reject the file
//     }
//   };
//   export const upload = multer({
//     storage: storage,
//     fileFilter,
//     limits: {
//       fileSize: 1024 * 1024 * 5, // 5MB limit per file
//     },
// })
