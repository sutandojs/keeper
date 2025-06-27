const { Model } = require('sutando');
const sha256 = require('js-sha256').sha256;

class PersonalAccessToken extends Model {
  static separator = '|';
  
  casts = {
    abilities: 'json',
    last_used_at: 'datetime',
    expires_at: 'datetime',
  };

  hidden = [
    'token',
  ];

  static async findToken(token) {
    if (!token) {
      return null;
    }
    
    if (token.includes(this.separator) === false) {
      return await this.query().where(
        'token',
        sha256(token)
      ).first();
    }

    const [id, tokenString] = token.split(this.separator, 2);

    const instance = await this.query().find(id)

    if (instance) {
      return instance.token == sha256(tokenString) ? instance : null;
    }

    return null;
  }

  can(ability) {
    return this.abilities.includes('*') || this.abilities.includes(ability);
  }

  cant(ability) {
    return ! this.can(ability);
  }
}

module.exports = PersonalAccessToken;