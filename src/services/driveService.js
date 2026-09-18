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
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Crucial for Google Apps Script CORS
      },
      body: JSON.stringify(payload),
    });

    const textResponse = await response.text();
    console.log("Raw Apps Script Response:", textResponse); // Check your F12 Console if it fails!

    try {
      const result = JSON.parse(textResponse);
      if (result.url) {
        return result.url;
      } else {
        throw new Error(result.error || "Server returned an error.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", textResponse);
      throw new Error("Apps Script returned non-JSON text. Check console.");
    }

  } catch (err) {
    console.error("Google Drive upload error:", err);
    throw err;
  }
}