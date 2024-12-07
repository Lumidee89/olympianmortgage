const Content = require('../models/Content');

exports.addContent = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    const newContent = new Content({
      title,
      body,
      createdBy: req.userRole === "admin" ? req.adminId : req.loanOfficerId,
    });

    await newContent.save();

    res.status(201).json({
      message: 'Content added successfully.',
      content: newContent,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding content.',
      error: error.message,
    });
  }
};


exports.getAllContents = async (req, res) => {
    try {
      const contents = await Content.find().populate('createdBy', 'name email'); 
      res.status(200).json({
        message: 'Contents retrieved successfully.',
        data: contents,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching contents.',
        error: error.message,
      });
    }
  };