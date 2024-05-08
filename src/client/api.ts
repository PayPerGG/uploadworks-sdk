import {UploadWorksError} from "../shared/error";

export async function getSlugUploadPOST(endpointURL: string, slug: string, key: string, mime: string) {
    
    if (key.length == 0) {
        throw Error("File name is empty.")
    }
    
    
    const response = await fetch(endpointURL, {
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
    
    return {url: data.data.url as string, key: data.data.key as string, slug: data.data.slug as string};
    
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

export async function uploadFileProgress(url: string, file: File, progressCallback= (percent: number) => {}) {
    return new Promise(function (resolve, reject) {

        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr)
                }
                else {
                    reject(xhr)
                }
            }
        };

        if (progressCallback) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    var percentComplete = (e.loaded / file.size) * 100;
                    progressCallback(percentComplete);
                }
            };
        }

        xhr.open("PUT", url);
        xhr.send(file);
    });
}