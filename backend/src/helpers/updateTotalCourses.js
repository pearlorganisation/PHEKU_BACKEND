import Country from "../models/country/country.js";

export const updateTotalUniversitiesForCountry = async (countryId) => {
  try {
    // Count the total number of universities in the specified country
    const [{ totalUniversities }] = await University.aggregate([
      { $match: { country: mongoose.Types.ObjectId(countryId) } },
      { $group: { _id: "$country", totalUniversities: { $sum: 1 } } },
    ]);

    // Update the Country document
    await Country.findByIdAndUpdate(
      countryId,
      { totalUniversities },
      { new: true, runValidators: true }
    );

    console.log(
      `Updated totalUniversities for country ${countryId}: ${totalUniversities}`
    );
  } catch (error) {
    console.error("Error updating total universities for country:", error);
  }
};
