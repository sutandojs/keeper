import { Model } from 'sutando';

declare namespace SutandoKeeper {
  interface AccessTokenOptions {
    accessTokenModel?: new (...args: any[]) => PersonalAccessToken;
    type?: string;
    separator?: string;
    token_prefix?: string;
  }

  class PersonalAccessToken extends Model {
    /**
     * The attributes that should be cast.
     */
    casts: {
      abilities: 'json';
      last_used_at: 'datetime';
      expires_at: 'datetime';
    };

    /**
     * Get the tokenable model that the access token belongs to.
     */
    tokenable(): any;

    /**
     * Find a token instance by the given token.
     */
    static findToken(token: string): Promise<this | null>;

    /**
     * Determine if the token has a given ability.
     */
    can(ability: string): boolean;

    /**
     * Determine if the token does not have a given ability.
     */
    cant(ability: string): boolean;
  }

  class NewAccessToken {
    /**
     * The access token instance.
     */
    accessToken: PersonalAccessToken;

    /**
     * The plain text token.
     */
    plainTextToken: string;

    /**
     * Create a new access token result.
     */
    constructor(accessToken: PersonalAccessToken, plainTextToken: string);

    /**
     * Get the instance as an array.
     */
    toData(): { accessToken: PersonalAccessToken; plainTextToken: string };

    /**
     * Convert the object to its JSON representation.
     */
    toJSON(): { accessToken: PersonalAccessToken; plainTextToken: string };

    /**
     * Convert the object to its JSON representation.
     */
    toJson(...args: any[]): string;
  }

  /**
   * HasApiTokens mixin interface for static methods
   */
  interface IHasApiTokens {
    /**
     * Find a access token instance by the given token.
     */
    findByToken<T extends Model>(this: new () => T, token: string, lastUsedAt?: string | Date): Promise<T | null>;

    new (...args: any[]): {
      accessToken: PersonalAccessToken | null;
  
      /**
       * Get the tokens that belong to model.
       */
      relationTokens(): any;
  
      /**
       * Determine if the current API token has a given ability.
       */
      tokenCan(ability: string): boolean;
  
      tokenCant(ability: string): boolean;
  
      /**
       * Create a new personal access token for the user.
       */
      createToken(name: string, abilities?: string[], expiresAt?: Date | string | null): Promise<NewAccessToken>;
  
      /**
       * Get the current access token being used by the user.
       */
      currentAccessToken(): PersonalAccessToken | null;
  
      /**
       * Set the current access token for the user.
       */
      withAccessToken(accessToken: PersonalAccessToken): any;
    }
  }

  /**
   * HasApiTokens mixin factory function
   */
  function HasApiTokens(options?: AccessTokenOptions): <T extends new (...args: any[]) => Model>(ModelClass: T) => T & IHasApiTokens;
}

export = SutandoKeeper;
