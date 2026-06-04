import Menu from "../models/menu.model.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|------------------------------------------------------------------
| CREATE MENU ITEM
|------------------------------------------------------------------
*/

export const createMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET RESTAURANT MENU
|------------------------------------------------------------------
*/

export const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menu = await Menu.find({
      restaurant: restaurantId,
    });

    res.status(200).json({
      success: true,
      count: menu.length,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET SINGLE MENU ITEM
|------------------------------------------------------------------
*/

export const getSingleMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await Menu.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| UPDATE MENU ITEM
|------------------------------------------------------------------
*/

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedMenu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| DELETE MENU ITEM
|------------------------------------------------------------------
*/

export const deleteMenuItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ========search manu item by name========
export const searchMenuItemsbyRestuarnt = asyncHandler(async (req, res) => {
  const { restaurantId, q } = req.query;

  const filter = {};

  if (restaurantId) {
    filter.restaurant = restaurantId;
  }

  if (q) {
    filter.$or = [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        description: {
          $regex: q,
          $options: "i",
        },
      },
      {
        category: {
          $regex: q,
          $options: "i",
        },
      },
    ];
  }

  const menuItems = await Menu.find(filter).sort({
    isBestseller: -1,
    rating: -1,
  });

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

/*
|------------------------------------------------------------------
| GET ALL MENUS
|------------------------------------------------------------------
*/

export const getAllMenus = asyncHandler(async (req, res) => {
  const { category, isVeg, search, page = 1, limit = 20 } = req.query;

  const filter = {
    status: "ACTIVE",
  };

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Veg / Non-Veg filter
  if (isVeg !== undefined) {
    filter.isVeg = isVeg === "true";
  }

  // Search filter
  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        category: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const menus = await Menu.find(filter)
    .populate("restaurant", "restaurantName logo rating deliveryTime")
    .sort({
      isBestseller: -1,
      rating: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(Number(limit));

  const totalMenus = await Menu.countDocuments(filter);

  res.status(200).json({
    success: true,
    totalMenus,
    currentPage: Number(page),
    totalPages: Math.ceil(totalMenus / Number(limit)),
    count: menus.length,
    data: menus,
  });
});

export const searchMenuItems = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const filter = {
    status: "ACTIVE",
    isAvailable: true,
  };

  if (q) {
    filter.$or = [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        category: {
          $regex: q,
          $options: "i",
        },
      },
      {
        description: {
          $regex: q,
          $options: "i",
        },
      },
    ];
  }

  const menuItems = await Menu.find(filter)
    .populate("restaurant", "restaurantName")
    .sort({
      isBestseller: -1,
      rating: -1,
    });

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});
