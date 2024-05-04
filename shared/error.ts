export class UploadWorksError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UploadWorksError";
    }
}