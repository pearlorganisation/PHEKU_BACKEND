export const paginate = async (
  model,
  page = 1,
  limit = 5,
  populateOptions = []
) => {
  const skip = (page - 1) * limit;

  // Count total documents in the collection
  const totalDocuments = await model.countDocuments();

  // Fetch paginated data with optional population
  let query = model.find().skip(skip).limit(limit).sort({ publishedAt: -1 });
  if (populateOptions.length > 0) {
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });
  }
  const data = await query;

  // Calculate total pages and create pages array
  const totalPages = Math.ceil(totalDocuments / limit);
  let pagesArray = [1];

  if (totalPages > 3) {
    if (page > 2) pagesArray.push(page - 1);
    pagesArray.push(page);
    if (page < totalPages - 1) pagesArray.push(page + 1);
    if (!pagesArray.includes(totalPages)) pagesArray.push(totalPages);
  } else {
    for (let i = 2; i <= totalPages; i++) {
      pagesArray.push(i);
    }
  }

  pagesArray = [...new Set(pagesArray)].sort((a, b) => a - b);

  // Build pagination object
  const pagination = {
    count: totalDocuments,
    current_page: page,
    limit,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
    pages: pagesArray,
  };

  return { data, pagination };
};
