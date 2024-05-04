// Define types

import {FileRoute, FileRouter, RouteHandlerOptions, WebhookContent} from "./types";
import {UploadWorksError} from "../error";
import {UploadWorksAPI} from "./api";
import {areMimeTypesSame} from "./helpers";

export const createUploadWorks = () => {
    return (options: {
        maxFileSize?: number,
        mime?: string,
        directory?: string
    }) => new FileRoute(options);
};

export const createRouteHandler = <TRouter extends FileRouter>(
    opts: RouteHandlerOptions<TRouter>,
) => {
    const handlers = INTERNAL_DO_NOT_USE_createRouteHandlerCore(
        opts,
    );

    return {
        POST: (req: Request) => handlers.POST(req),
        PUT: (req: Request) => handlers.PUT(req),
        GET: (req: Request) => handlers.GET(req),
    };
};

/** @internal */
const INTERNAL_DO_NOT_USE_createRouteHandlerCore = <
    TRouter extends FileRouter,
>(
    opts: RouteHandlerOptions<TRouter>
) => {
    
    const api: UploadWorksAPI = new UploadWorksAPI(opts.config.key, opts.config.bucket)

    const PUT = async (
        request: Request | { request: Request },
        ) => {
        
        try {
            const req = request instanceof Request ? request : request.request;
            // get slug, run middleware, return url and specs
            const {slug,key,size,mime} = await req.json().catch((e)=>{throw Error("No body was supplied, expected 'slug', 'key', 'size', 'mime'")})
            
            if (!slug) {
                throw new UploadWorksError("No slug provided.")
            } else if (!key) {
                throw new UploadWorksError("No key provided.")
            }
            
            const uploadable = opts.router[slug];

            if (!uploadable) {
                throw new UploadWorksError("No router found with name '"+slug!+"'.")
            }

            const metadata = await uploadable.options.middlewareFunction({req: req,  metadata: {key: key}})
            
            if (uploadable.options.maxFileSize && size as number > uploadable.options.maxFileSize) {
                throw new UploadWorksError("File size is too large.")
            }

            if (uploadable.options.mime && !areMimeTypesSame(uploadable.options.mime, mime)) {
                throw new UploadWorksError("File is not a supported type.")
            }

            let directory = uploadable.options.directory ?? ""
            if (!directory.endsWith("/") && directory != "") directory = directory + "/"
            
            const url = await api.getSignedURLUpload(directory + key, {maxSize: size, metadata: metadata, slug: slug, mimetype: uploadable.options.mime ?? undefined})
            return new Response(JSON.stringify({success: true, data: {key: directory + key, slug: slug, expires: Date.now()+120000, url: url}}), {status: 200})
        }catch (e) {
            let reason = "Something went wrong internally, try again later."
            if (e instanceof UploadWorksError && e.message) {
                reason = e.message ?? reason // it's safe to show uploadworks errors, not any others
            }
            return new Response(JSON.stringify({success: false, cause: reason}), {status: 400})   
        }
        
    }
    
    const POST = async (
        request: Request | { request: Request },
    ) => {
        try {
            const req = request instanceof Request ? request : request.request;
            const auth = req.headers.get("Authorization")
            if (!auth || auth != opts.config.webhook_secret) {
                throw new UploadWorksError("Not authorized for this endpoint.")
            }
            
            const content: WebhookContent = await req.json()
            if (!content.success || !content.data) {
                throw new UploadWorksError("Something went wrong: '"+(content.cause ?? "unknown data")+"'.")
            }
            
//            console.log(content.data)
//            console.log(content.data!.slug!)

            let uploadable = opts.router[content.data!.slug!];
            if (!uploadable) {uploadable = opts.router["error"];} // catchall endpoint
            if (!uploadable) {throw new UploadWorksError("No router found with name '"+content.data!.slug!+"'.")}


            await uploadable.options.uploadCompleteFunction({file: content.data})
    
            return new Response(JSON.stringify({success: true})) // no reponse is 'needed' since UploadWorks doesn't track success of post, just that it was sent.
        }catch (e) {
            let reason = "Something went wrong internally, try again later."
            if (e instanceof UploadWorksError && e.message) {
                reason = e.message ?? reason // it's safe to show uploadworks errors, not any others
            }
            return new Response(JSON.stringify({success: false, cause: reason}), {status: 400})
        }
    };

    // Get a file from endpoint
    const GET = async (request: Request | { request: Request }) => {
        
        return new Response(JSON.stringify({sucess: true, data: {bucket: opts.config.bucket}}), {status: 200})
    };

    return { GET, POST, PUT };
};




