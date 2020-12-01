const sign = (body) => {
  return `SIGNATURE.${JSON.stringify(body)}`;
};

module.exports = {
  sign,
}
