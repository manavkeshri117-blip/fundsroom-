function required(value, name) {
  if (value === undefined || value === null || String(value).trim() === "") {
    const error = new Error(`${name} is required`);
    error.status = 400;
    throw error;
  }
}

function positiveNumber(value, name) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    const error = new Error(`${name} must be greater than 0`);
    error.status = 400;
    throw error;
  }
}

module.exports = { required, positiveNumber };
