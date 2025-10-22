// Cloudinary upload utility for client-side image uploads (no secret needed)
// Usage: await uploadToCloudinary(file, cloudName, uploadPreset)
/**
 * Uploads a file to Cloudinary using unsigned upload preset.
 * Uses environment variables CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET if available.
 *
 * @param file File to upload
 * @param cloudName Optional Cloudinary cloud name (overrides env)
 * @param uploadPreset Optional Cloudinary upload preset (overrides env)
 * @returns URL of uploaded image
 */
export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export async function uploadToCloudinary(
  file: File,
  cloudName?: string,
  uploadPreset?: string,
  options?: UploadOptions
): Promise<string> {
  const resolvedCloudName = cloudName || (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'diecgt687';
  const resolvedUploadPreset = uploadPreset || (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned';
  const url = `https://api.cloudinary.com/v1_1/${resolvedCloudName}/image/upload`;

  // Use XHR when progress or cancelation is needed
  if (options?.onProgress || options?.signal) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } catch (e) {
            reject(new Error('Cloudinary response parse failed'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error('Cloudinary upload failed: ' + (data.error?.message || xhr.statusText)));
          } catch {
            reject(new Error('Cloudinary upload failed: ' + xhr.statusText));
          }
        }
      };
      xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
      xhr.onabort = () => reject(new Error('Upload canceled'));
      if (xhr.upload && options?.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            options.onProgress!(pct);
          }
        };
      }
      if (options?.signal) {
        const abortHandler = () => xhr.abort();
        options.signal.addEventListener('abort', abortHandler, { once: true });
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', resolvedUploadPreset);
      xhr.send(fd);
    });
  }

  // Fallback to fetch when no progress/cancel needed
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', resolvedUploadPreset);
  const response = await fetch(url, { method: 'POST', body: formData });
  if (!response.ok) {
    let errorMsg = 'Cloudinary upload failed';
    try {
      const errorData = await response.json();
      errorMsg += ': ' + (errorData.error?.message || JSON.stringify(errorData));
    } catch {}
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data.secure_url;
}
