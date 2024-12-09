import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, // Dropdown with Server-Side Pagination, Admin panel
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" }, // Fetch university by counId(uniRoutes)
    duration: { type: Number, required: true }, // In months, || frontend will show it in year
    courseLevel: {
      // Get all course level api(course level routes)
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseLevel",
    },
    tutionFees: { amount: Number, currency: String },
    specialization: {
      // Dropdown with Server-Side Pagination, Admin panel
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    description: { type: String, required: true }, // Edittor
  },
  { timestamps: true }
);

courseSchema.index({ name: 1, university: 1 }, { unique: true });

// Middlewares
//To count the total number of courses for particular university
courseSchema.post("save", async function (doc, next) {
  //doc is the newly saved or updated document. doc = deleted object
  if (!doc) {
    console.log("No document created");
    next();
  }
  console.log("In Save");
  try {
    const universityId = doc.university;
    const courseCount = await mongoose
      .model("Course")
      .countDocuments({ university: universityId });

    await mongoose.model("University").findByIdAndUpdate(universityId, {
      totalCourse: courseCount,
    });

    next();
  } catch (error) {
    next(error);
  }
});

// To decrement the count for total course in  university after course is deleted
courseSchema.post("findOneAndDelete", async function (doc, next) {
  // Will trigger by findOneAndDelete(), findByIdAndDelete internally calls findOneAndDelete
  if (!doc) {
    console.log("No document found to delete");
    next();
  }
  console.log("In Delete");
  try {
    const universityId = doc.university;

    // Decrement the totalCourse count
    await mongoose.model("University").findByIdAndUpdate(universityId, {
      $inc: { totalCourse: -1 },
    });
    next();
  } catch (error) {
    next(error);
  }
});

// // New middleware for updating a course (handling university course count update)
// courseSchema.post("findOneAndUpdate", async function (doc, next) {
//   if (!doc) {
//     console.log("No document updated");
//     next();
//   }
//   console.log("in update");
//   console.log("this update--", this._update);
//   console.log("doc university--", doc.university);
//   try {
//     // Get the previous university and current university after update
//     const previousUniversityId = this._update?.university;
//     const currentUniversityId = doc.university;

//     // If the university reference has changed, update both universities' course counts
//     if (previousUniversityId !== currentUniversityId) {
//       // Decrement count from the old university
//       await mongoose
//         .model("University")
//         .findByIdAndUpdate(previousUniversityId, {
//           $inc: { totalCourse: -1 },
//         });

//       // Increment count in the new university
//       await mongoose
//         .model("University")
//         .findByIdAndUpdate(currentUniversityId, {
//           $inc: { totalCourse: 1 },
//         });
//     }

//     // Ensure the count for the current university is up-to-date
//     await mongoose.model("University").findByIdAndUpdate(currentUniversityId, {
//       totalCourse: await mongoose.model("Course").countDocuments({
//         university: currentUniversityId,
//       }),
//     });

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

const Course = mongoose.model("Course", courseSchema); // Put middleware before export

export default Course;
