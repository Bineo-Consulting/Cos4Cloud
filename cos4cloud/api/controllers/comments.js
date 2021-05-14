const CommentsService = require('../../services/comments.service')

const addComment = (req, res) => {
  const params = req.query;
  return CommentsService.add(req.path, params).then(aux => res.json(aux))
}
module.exports = { addComment }