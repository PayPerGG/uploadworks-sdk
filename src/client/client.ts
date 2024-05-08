import { UploadWorksError } from "../shared/error";
import { getSlugUploadPOST, uploadFile } from "./api";
import {useState} from "react";

type Props = {
    onUploadBegin: () => void;
    onUploadError: (e: Error) => void;
    onClientUploadComplete: (slug: string, key: string, uploaded_at: Date) => void;
}


/**
 * Client-side function that can be used to upload files quickly.
 *
 * endpointURL: the url of your webhook endpoint (e.g. /api/webhook)
 * slug: the name of the slug for the upload (e.g. imageUploader)
 * onUploadBegin: a function that runs before the file is being uploaded, but after the first request is sent for a post url.
 */
export const useUploadWorks = (endpointURL: string, slug: string, {onUploadBegin, onUploadError, onClientUploadComplete}: Props) => {
    
    const [uploading,setUploading] = useState(false)
    
    async function startUpload(file: File) {
        try {
            if (!file) { throw new UploadWorksError("File isn't defined, button was pressed.")}
            setUploading(true)
            const {url, key} = await getSlugUploadPOST(endpointURL, slug, file.name, file.type)
            onUploadBegin()
            
            await uploadFile(url,file)
            
            onClientUploadComplete(slug, key, new Date())
            setUploading(false)
        } catch (e) {
            setUploading(false)
            onUploadError(e as Error)
        }
    }
    
    return {startUpload, uploading}
};