class NewAccessToken {
  accessToken;
  plainTextToken;

  constructor(accessToken, plainTextToken) {
    this.accessToken = accessToken;
    this.plainTextToken = plainTextToken;
  }

  toData() {
    return {
      accessToken: this.accessToken,
      plainTextToken: this.plainTextToken,
    };
  }

  toJSON() {
    return this.toData();
  }

  toJson(...args) {
    return JSON.stringify(this.toData(), ...args);
  }
}

module.exports = NewAccessToken;
