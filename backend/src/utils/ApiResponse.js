class ApiResponse {
  constructor(message = "Success", data = null, statusCode) {
    this.success = statusCode < 400;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }

  // Called by res.json() automatically | Converts the ApiResponse to a JSON-friendly format, excluding statusCode.
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}

export { ApiResponse };
