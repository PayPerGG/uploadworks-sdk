import {UploadWorksError} from "../error";


export const regex = /^\x00-\x7F/;

export async function getSlugUploadPOST(slug: string, key: string, mime: string) {
    
    if (!regex.test(key)) {
        key = key.replace(new RegExp("[^" + regex.source + "]", "g"), "".replace(" ", ""));
        if (key.length == 0) {
            throw Error("File name is empty.")
        }
    }
    
    
    const response = await fetch("/api/webhook", {
        method: "PUT",
        body: JSON.stringify({
            slug: slug,
            key: key,
            mime: mime
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        throw new UploadWorksError(data.cause)
    }
    
    
    return {url: data.data.url, key: data.data.key, slug: data.data.slug};
    
}


export async function uploadFile(url: string, file: File) {
//    const formdata = new FormData();
//    formdata.append("file", file);

    try {
        const response = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
        if (response.status != 200) {
            throw new UploadWorksError("Failed to upload, internal error occurred.")
        }
    } catch (error) {
        throw new UploadWorksError((error as Error).name)
    }
}