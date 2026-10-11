// Controller for the /api/test route
// A controller holds the logic for what a route should respond with

export const getTest = (req, res) => {
  res.json({ message: 'FocusArena backend is working' })
}
