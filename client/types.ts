export type ClientUploadResponse ={
    success: boolean,
    data?: File,
    cause?: any
}

export type ClientFile = {
    key: string,
    uploaded_at: Date,
    slug?: string
};