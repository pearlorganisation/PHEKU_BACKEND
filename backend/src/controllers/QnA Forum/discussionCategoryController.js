import DiscussionCategory from "../../models/QnA Forum/discussionCategory";
import ApiError from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

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
