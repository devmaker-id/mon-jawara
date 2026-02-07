function byComment(comment) {
  return (item) => item.comment === comment;
}

function byName(name) {
  return (item) => item.name === name;
}

function id(item) {
  return item['.id'];
}

module.exports = {
  byComment,
  byName,
  id
};