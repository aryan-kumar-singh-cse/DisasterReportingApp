/**
 * TwoTruths - Direct Browser-to-S3 Upload Service
 */

import { api } from './api';

export async function uploadPhotoDirectly(file) {
  if (!file) return null;

  const urlData = await api.getUploadUrl(file.type);
  if (!urlData || !urlData.uploadUrl) {
    // Return local object URL for offline/fallback mode
    return URL.createObjectURL(file);
  }

  // Real S3 PUT upload
  const res = await fetch(urlData.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  if (!res.ok) {
    throw new Error(`Failed to upload photo to S3: ${res.statusText}`);
  }

  return urlData.fileUrl;
}
