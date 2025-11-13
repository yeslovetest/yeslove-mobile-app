function dataURLtoFile(dataUrl: string, filename: string) {
    // covert base64/URLEncoded data component to raw binary data held in a string - 
    // for web browser testing (not needed on mobile)
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default dataURLtoFile;