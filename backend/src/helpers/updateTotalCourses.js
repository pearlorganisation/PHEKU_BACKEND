export const updateTotalCoursesForCountry = async (countryId) => {
  try {
    // Aggregate the totalCourse for all universities in the specified country
    const result = await University.aggregate([
      {
        $match: { country: mongoose.Types.ObjectId(countryId) }, // Match universities by country ID
      },
      {
        $group: {
          _id: "$country", // Group by country ID
          totalCourses: { $sum: "$totalCourse" }, // Sum the totalCourse field
        },
      },
    ]);

    // Get the totalCourses from the aggregation result
    const totalCourses = result.length > 0 ? result[0].totalCourses : 0;

    // Update the Country document
    await Country.findByIdAndUpdate(
      countryId,
      { totalCourses },
      { new: true, runValidators: true }
    );

    console.log(
      `Updated totalCourses for country ${countryId}: ${totalCourses}`
    );
  } catch (error) {
    console.error("Error updating total courses for country:", error);
  }
};
