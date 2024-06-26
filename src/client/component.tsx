"use client"

import {ClientFile} from "./types";
import {UploadWorksError} from "../shared/error";
import {getSlugUploadPOST, uploadFile} from "./api";
import * as React from "react";

type Props = {
    slug: string;
    onClientUploadComplete: (file: ClientFile) => void;
    onUploadError: (error: UploadWorksError) => void;
}


export function UploadButton({slug, onClientUploadComplete = function (file: ClientFile) {}, onUploadError = function (error: UploadWorksError) {}}: Props) {


    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [error, setError] = React.useState<string | undefined>(undefined)
    

    // @ts-ignore
    async function onFileChange(e) {
        const file: File = e.target.files[0] ?? undefined
        if (!file) { return }
        setFile(file)
        setError(undefined)
    }
    
    // @ts-ignore
    async function onSubmit(e) {
        try {
            if (!file) { throw new UploadWorksError("File isn't defined, button was pressed.")}

            const {url, key} = await getSlugUploadPOST("", slug, file.name, file.type)
            
            await uploadFile(url,file)
            setError(undefined)
            
            onClientUploadComplete({
                slug: slug,
                uploaded_at: new Date(),
                key: key
            })
            
        } catch (e) {
            const uwe = e as UploadWorksError
            setError(uwe.name)
            onUploadError(uwe)
        }        
    }
    
    return (
        <>
        
        <input type={"file"} onChange={onFileChange}>
            
        </input>
        <button onClick={onSubmit}>
            Click to upload
        </button>
        
        </>
    )
    
}
