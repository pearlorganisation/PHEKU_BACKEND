import DiscussionCategory from "../../models/QnA Forum/discussionCategory.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Discussion Category
export const createDiscussionCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  // Create category with the name
  const discussionCategory = await DiscussionCategory.create({ name });

  if (!discussionCategory) {
    return next(new ApiError("Failed to create the Discussion Category", 400));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        "Created the Discussion Category successfully",
        discussionCategory
      )
    );
});

export const getAllDiscussionCategories = asyncHandler(
  async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search } = req.query;

    let discussionCategories;

    if (req.query.pagination) {
      // 🔴 make helper for pipeline
      // Apply pagination for admin panel
      discussionCategories = await DiscussionCategory.aggregate([
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
        {
          $project: {
            _id: 1,
            name: 1,
            count: { $size: "$discussions" },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          },
        },
      ]);

      // Extract metadata and paginated data
      const totalDocuments = discussionCategories[0].metadata[0]?.total || 0;
      const data = discussionCategories[0].data || [];

      const totalPages = Math.ceil(totalDocuments / limit);
      const pagination = {
        total: totalDocuments,
        current_page: page,
        limit,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      };

      return res
        .status(200)
        .json(
          new ApiResponse(
            "Discussion Categories retrieved successfully",
            data,
            pagination
          )
        );
    } else {
      // Return all data without pagination for website users
      discussionCategories = await DiscussionCategory.aggregate([
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
        {
          $project: {
            _id: 1,
            name: 1,
            count: { $size: "$discussions" },
          },
        },
      ]);

      return res
        .status(200)
        .json(
          new ApiResponse(
            "Discussion Categories retrieved successfully",
            discussionCategories
          )
        );
    }
  }
);

// Get a single Discussion Category by ID
export const getDiscussionCategoryById = asyncHandler(
  async (req, res, next) => {
    const discussionCategory = await DiscussionCategory.findById(req.params.id); // Fetch all fields

    if (!discussionCategory) {
      return next(new ApiError("Discussion Category not found", 404));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          "Discussion Category retrieved successfully",
          discussionCategory
        )
      );
  }
);

// Update a Discussion Category
export const updateDiscussionCategoryById = asyncHandler(
  async (req, res, next) => {
    const { name } = req.body;

    const discussionCategory = await DiscussionCategory.findByIdAndUpdate(
      req.params.id,
      { name },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are applied
      }
    );

    if (!discussionCategory) {
      return next(
        new ApiError("Failed to update the Discussion Category", 400)
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          "Discussion Category updated successfully",
          discussionCategory
        )
      );
  }
);

// Delete a Discussion Category
export const deleteDiscussionCategoryById = asyncHandler(
  async (req, res, next) => {
    const discussionCategory = await DiscussionCategory.findByIdAndDelete(
      req.params.id
    );

    if (!discussionCategory) {
      return next(new ApiError("Discussion Category not found", 404));
    }

    return res
      .status(200)
      .json(new ApiResponse("Discussion Category deleted successfully"));
  }
);
