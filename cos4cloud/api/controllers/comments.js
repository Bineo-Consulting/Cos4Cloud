
const addComment = (req, res) => {
  const CommentsService = require('../../services/comments.service')
  const params = req.query;
  return CommentsService.add(req.path, params).then(aux => res.json(aux))
}
module.exports = { addComment }