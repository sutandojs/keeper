const PersonalAccessToken = require('./personal-access-token');
const NewAccessToken = require('./new-access-token');
const sha256 = require('js-sha256').sha256;

function random(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const HasApiTokens = (options = {
  accessTokenModel: PersonalAccessToken,
  separator: '|',
  token_prefix: '',
}) => (Model) => {
  const accessTokenModel = options.accessTokenModel || PersonalAccessToken;
  accessTokenModel.separator = options.separator || '|';
  accessTokenModel.token_prefix = options.token_prefix || '';

  return class extends Model {
    accessToken = null;

    static async findByToken(token, lastUsedAt = null) {
      const accessToken = await accessTokenModel.findToken(token);

      if (!accessToken) {
        return null;
      }

      if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
        return null;
      }

      const tokenable = await this.query().find(accessToken.tokenable_id);

      if (!tokenable) {
        return null;
      }

      tokenable.withAccessToken(accessToken);

      await accessToken.update({
        last_used_at: lastUsedAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

      return tokenable;
    }

    relationTokens() {
      return this.hasMany(
        accessTokenModel,
        'tokenable_id'
      ).where(
        'tokenable_type',
        options.type || this.constructor.name
      );
    }
  
    tokenCan(ability) {
      return this.accessToken && this.accessToken.can(ability);
    }

    tokenCant(ability) {
      return ! this.tokenCan(ability);
    }
  
    async createToken(name, abilities = ['*'], expiresAt = null) {
      const plainTextToken = this.generateTokenString();
  
      const token = await this.related('tokens').create({
        name: name,
        tokenable_type: options.type || this.constructor.name,
        token: sha256(plainTextToken),
        abilities: JSON.stringify(abilities),
        expires_at: expiresAt,
      });
      
      return new NewAccessToken(token, token.getKey() + accessTokenModel.separator + plainTextToken);
    }

    generateTokenString() {
      return accessTokenModel.token_prefix + random(40);
    }
  
    currentAccessToken() {
      return this.accessToken;
    }
  
    withAccessToken(accessToken) {
      this.accessToken = accessToken;
  
      return this;
    }
  }
}

module.exports = HasApiTokens;