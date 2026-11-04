const tryCatch = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  };
};
export default tryCatch;
