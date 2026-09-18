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
    
    try {
      const result = JSON.parse(textResponse);
      if (result.url) {
        return result.url; // This is the permanent Google Drive URL
      } else {
        throw new Error(result.error || "Upload failed from server response.");
      }
    } catch (e) {
      console.error("Non-JSON response received from Apps Script. Check deployment permissions (Who has access -> Anyone).", textResponse);
      throw new Error("Failed to upload image: Server returned HTML instead of JSON.");
    }

  } catch (err) {
    console.error("Google Drive upload error:", err);
    throw err;
  }
}