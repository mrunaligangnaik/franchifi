const Franchise = require("../models/Franchise");

const getFranchiseById = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id)
      .populate("owner", "name email role"); // safe populate

    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    // increment views safely
    franchise.views += 1;
    await franchise.save();

    res.json(franchise);
  } catch (error) {
    console.error("Get Franchise Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFranchiseById,
};
