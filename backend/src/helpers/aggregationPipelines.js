import mongoose from "mongoose";

export const buildDiscussionTagsPipeline = (
  search,
  categoryId,
  page,
  limit,
  pagination
) => {
  const basePipeline = [
    {
      $lookup: {
        from: "discussioncategories", // Collection name for categories
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    { $unwind: "$categoryDetails" }, // Unwind categoryDetails into a single object
    ...(categoryId
      ? [
          {
            $match: {
              "categoryDetails._id": new mongoose.Types.ObjectId(categoryId),
            },
          },
        ]
      : []),
    ...(search
      ? [
          {
            $match: {
              $or: [
                { name: { $regex: search, $options: "i" } }, // Tag Name
                { "categoryDetails.name": { $regex: search, $options: "i" } }, // Category Name
              ],
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "discussions", // Collection name for discussions
        localField: "_id",
        foreignField: "tags",
        as: "discussions",
      },
    },
  ];

  if (pagination) {
    return [
      ...basePipeline,
      {
        $project: {
          _id: 1,
          name: 1,
          category: "$categoryDetails.name",
          categoryId: "$categoryDetails._id",
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];
  } else {
    return [
      ...basePipeline,
      {
        $project: {
          _id: 1,
          name: 1,
          category: "$categoryDetails.name",
          categoryId: "$categoryDetails._id",
          count: { $size: "$discussions" }, // Count of discussions using this tag
        },
      },
    ];
  }
};

export const buildDiscussionCategoriesPipeline = (
  search,
  page,
  limit,
  pagination
) => {
  const basePipeline = [
    ...(search
      ? [{ $match: { name: { $regex: search, $options: "i" } } }]
      : []),
    {
      $lookup: {
        from: "discussions",
        localField: "_id",
        foreignField: "category",
        as: "discussions",
      },
    },
  ];
  if (pagination) {
    return [
      ...basePipeline,
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];
  } else {
    return [
      ...basePipeline,
      {
        $project: {
          _id: 1,
          name: 1,
          count: { $size: "$discussions" },
        },
      },
    ];
  }
};
