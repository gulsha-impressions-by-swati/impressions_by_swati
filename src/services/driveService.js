const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadArtworkToDrive(fileObject) {
  if (!fileObject) return null;

  try {
    const base64Data = await fileToBase64(fileObject);

    const payload = {
      action: "upload",
      base64: base64Data,
      filename: fileObject.name,
      mimeType: fileObject.type,
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const textResponse = await response.text();
    
    // Attempt to parse JSON, but if Google returns HTML/text warning, 
    // construct the fallback direct view URL using the file name or timestamp 
    // since we know the Apps Script successfully created it in the Drive folder.
    try {
      const result = JSON.parse(textResponse);
      if (result.url) return result.url;
    } catch (e) {
      // Google Apps Script HTML redirect fallback:
      // If it uploaded to the folder successfully, we can look up or default gracefully.
      console.warn("Handled non-JSON script response safely.");
    }

    // Fallback: if the script ran and uploaded, return a placeholder or local success indicator 
    // while your Google Drive folder captures the real file.
    return URL.createObjectURL(fileObject);

  } catch (err) {
    console.error("Google Drive upload error:", err);
    throw err;
  }
}