declare module 'express-jwt' {
  import { RequestHandler } from 'express';

  interface Options {
    secret:
      | string
      | Buffer
      | ((
          req: Request,
          payload: any,
          done: (err: any, secret?: string | Buffer) => void
        ) => void);
    algorithms: string[];
    userProperty?: string;
    getToken?: (req: Request) => string | null;
  }

  function expressJwt(options: Options): RequestHandler;

  export = expressJwt;
}
