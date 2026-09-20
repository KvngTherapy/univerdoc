const MATRIC_REGEX = /^M\.\d{2}\/[A-Z]{2,}\/[A-Z]{2,}\/\d{4,6}$/;

function isValidMatricNo(matricNo) {
  if (!matricNo || typeof matricNo !== 'string') return false;
  return MATRIC_REGEX.test(matricNo.trim());
}

module.exports = {
  MATRIC_REGEX,
  isValidMatricNo
};
