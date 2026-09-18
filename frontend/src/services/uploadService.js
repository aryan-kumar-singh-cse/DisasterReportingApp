/**
 * Direct Browser-to-S3 Photo Upload Service
 */

/**
 * Uploads a photo file directly to S3 via presigned URL, or falls back to local URL
 * @param {File} file
 * @param {Function} getUploadUrlFn
 * @returns {Promise<{ s3Key: string, photoUrl: string }>}
 */
export async function uploadIncidentPhoto(file, getUploadUrlFn) {
  if (!file) {
    throw new Error('No photo file provided for upload');
  }

  // If getUploadUrlFn is available and API URL is configured, use S3 direct upload
  if (getUploadUrlFn) {
    try {
      const { uploadUrl, s3Key, photoUrl } = await getUploadUrlFn(file.type || 'image/jpeg');

      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'image/jpeg'
          },
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error(`S3 upload failed with status ${uploadRes.status}`);
        }

        return {
          s3Key,
          photoUrl: photoUrl || uploadUrl.split('?')[0]
        };
      }
    } catch (err) {
      console.warn('Direct S3 upload failed or unavailable, falling back to local photo preview:', err);
    }
  }

  // Graceful fallback for local development or mock mode
  const localUrl = URL.createObjectURL(file);
  return {
    s3Key: `local-${Date.now()}`,
    photoUrl: localUrl
  };
}
