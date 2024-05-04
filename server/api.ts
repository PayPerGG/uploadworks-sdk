export class UploadWorksAPI {
    private readonly key: string;
    private readonly bucket: string;
    private readonly host: string;
    
    private headers() {
        return {
            "Content-Type": "application/json",
            "Authorization": this.key
        }
    }
    
    constructor(key: string, bucket: string, host?: string) {
        this.key=key
        this.bucket=bucket
        this.host = host ?? "https://upload.works/"
    }
    
    /**
     * file: The name of the file, using / for folders
     * ttl: the tile to live for the signed url, default 21600s
     */
    async getSignedURL(file: string, ttl?: number): Promise<string> {
        const response = await fetch(`${this.host}api/buckets/${this.bucket}/file`,
              {
                  method: "POST",
                  body: JSON.stringify({
                  fileKey: file,
                  ttl: ttl ?? 21600
              }), headers: this.headers(), cache: "no-cache"}
              )
        .then((e)=> e.json())
        if (!response.success) {
            throw Error(response.cause)
        }
        return response.data.url as string
    }
    
    async deleteFile(file: string) {
        //todo
    }
    
    
    async getSignedURLUpload(file: string, options: {mimetype?: string, slug?: string, maxSize?: number, metadata?: string}) {
        const response = await fetch(`${this.host}api/buckets/${this.bucket}/upload`,
            {
                method: "POST",
                body: JSON.stringify({
                    fileKey: file,
                    fileSize: options.maxSize ?? undefined,
                    fileType: options.mimetype ?? undefined,
                    slug: options.slug ?? undefined,
                    metadata: options.metadata ?? undefined
            }), headers: this.headers(), cache: "no-cache"}
            )
        .then((e)=> e.json())
        if (!response.success) {
            throw Error(response.cause)
        }
        return response.data.url as string
    }
    
    
}

// POST api/buckets/{bucket}/file BODY: fileKey, ttl

//const url = await utapi.getSignedURL(fileKey, {
//    expiresIn: 60 * 60, // 1 hour
//    // expiresIn: '1 hour',
//    // expiresIn: '3d',
//    // expiresIn: '7 days',
//});