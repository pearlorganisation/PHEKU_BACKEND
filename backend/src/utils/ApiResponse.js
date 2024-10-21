class ApiResponse {
  constructor(
    message = "Success",
    data = null,
    metadata = null,
    extraFields = null
  ) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.metadata = metadata;
    Object.assign(this, extraFields); //copies all enumerable own properties from one or more source objects to a target object. It returns the modified target object.
  }

  // Called by res.json() automatically
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      ...(this.data && { data: this.data }), // Only include data if it's present
      ...(this.metadata && { metadata: this.metadata }),
    };
  }
}

export { ApiResponse };
