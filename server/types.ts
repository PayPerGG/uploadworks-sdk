export type RouteHandlerOptions<TRouter extends FileRouter> = {
    /**
    * The instance of your router.
    */
    router: TRouter;
    config:  {
        /**
         ** The bucket identifier, found in the url when viewing the bucket.
         **/
        bucket: string,
        /**
         * The API key of your bucket, generate at https://upload.works/app/keys
         **/
        key: string,
        /**
        * The secret used to ensure webhooks come only from UploadWorks.
        **/
        webhook_secret: string
    }
};

export type WebhookContent ={
    success: boolean,
    data?: File,
    cause?: any
}

export class FileRoute {
    
    options: {
        /**
         * The function ran when the upload url is requested, throw UploadWorksError to prevent.
         */
        middlewareFunction: MiddlewareFunction,
        /**
         * The function ran when the upload is completed
         */
        uploadCompleteFunction: UploadCompleteFunction,
        /**
         * The maximum size the file may be, defaults to 5GB
         */
        maxFileSize?: number,
        /**
         * The mime type of file expected.
         * Accepts wildcard; e.g. image/*, image/png, e.t.c.
         */
        mime?: string,
        /**
         * The directory the file should be upload to
         */
        directory?: string
    }
    
    constructor(options: any) {
        this.options = options
    }

    /**
     * The action used when a file in a certain slug is requested by the client.
     * Throw UploadWorksError to prevent the file and show a custom error.
     * Requests are honored if there is no exception
     */
    middleware(middlewareFunction: MiddlewareFunction) {
        this.options.middlewareFunction = middlewareFunction;
        return this;
    }
    
    /**
     * The function used when a file has been uploaded and the webhook responds with success.
     * This will never be used if you don't setup the webhook.
     */
    onUploadComplete(uploadCompleteFunction: UploadCompleteFunction) {
        this.options.uploadCompleteFunction = uploadCompleteFunction;
        return this;
    }
}

export type File = {
    id: string;
    uploaded_at: Date,
    account: string,
    bucket: string,
    key: string,
    file_size?: number,
    file_type?: string,
    metadata?: any
    slug?: string
};

type Metadata = any;

export type FileRouter = Record<string, FileRoute>;

export type MiddlewareFunction = (params: { req: Request, metadata: {key: string} }) => Promise<Metadata>;

export type UploadCompleteFunction = (params: { file: File }) => Promise<any>;
