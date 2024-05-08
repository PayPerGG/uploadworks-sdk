export function areMimeTypesSame(mimeType1: string, mimeType2: string) {
    // Regular expression to validate MIME types
    const mimeRegex = /^\w+\/[-+.\w*]+$/;

    // Validate input MIME types
    if (!mimeRegex.test(mimeType1) || !mimeRegex.test(mimeType2)) {
//        throw new Error('Invalid MIME type');
        
        return false
    }

    // Split MIME types into main type and subtype
    const [type1, subtype1] = mimeType1.split('/');
    const [type2, subtype2] = mimeType2.split('/');

    // Check if main types are the same and subtype1 matches subtype2 or is a wildcard
    return type1 === type2 && (subtype1 === subtype2 || subtype1 === '*');
}