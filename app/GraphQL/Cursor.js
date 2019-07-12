function cursor(data, after, first) {
  if (first < 0) {
    throw new Error("First must be positive");
  }

  const totalCount = data.length;
  let dataReturned = [];
  let start = 0;
  if (after !== undefined) {
    const buff = new Buffer(after, "base64");
    const id = buff.toString("ascii");
    const index = data.findIndex(obj => obj._id === id);
    if (index === -1) {
      throw new Error("After does not exist");
    }
    start = index + 1;
  }
  dataReturned = first === undefined ? data : data.slice(start, start + first);

  let endCursor;
  const edges = dataReturned.map(user => {
    const buffer = new Buffer(user._id);
    endCursor = buffer.toString("base64");
    return {
      cursor: endCursor,
      node: user
    };
  });
  const hasNextPage = start + first < totalCount;
  const pageInfo =
    endCursor !== undefined
      ? {
          endCursor,
          hasNextPage
        }
      : {
          hasNextPage
        };
  const result = {
    edges,
    pageInfo,
    totalCount
  };
  return result;
}

module.exports = cursor;
