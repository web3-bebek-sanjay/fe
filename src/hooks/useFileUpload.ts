import { useState } from 'react';
import { uploadFile, deleteFile } from '@/lib/supabase';

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadedUrl: string | null;
  uploadedPath: string | null;
}

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    uploadedUrl: null,
    uploadedPath: null,
  });

  const uploadFileToSupabase = async (
    file: File,
    folder: string = 'remix-files'
  ) => {
    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      error: null,
      uploadedUrl: null,
      uploadedPath: null,
    });

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Simulate upload progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90),
        }));
      }, 200);

      const result = await uploadFile(file, filePath);

      clearInterval(progressInterval);

      if (result.success && result.data) {
        setUploadState({
          isUploading: false,
          uploadProgress: 100,
          error: null,
          uploadedUrl: result.data.publicUrl,
          uploadedPath: result.data.path,
        });

        return {
          success: true,
          url: result.data.publicUrl,
          path: result.data.path,
        };
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        uploadedUrl: null,
        uploadedPath: null,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  };

  const deleteUploadedFile = async (path: string) => {
    try {
      const result = await deleteFile(path);
      if (result.success) {
        setUploadState((prev) => ({
          ...prev,
          uploadedUrl: null,
          uploadedPath: null,
          error: null,
        }));
        return { success: true };
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Delete failed',
      }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  };

  const resetUploadState = () => {
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      error: null,
      uploadedUrl: null,
      uploadedPath: null,
    });
  };

  return {
    ...uploadState,
    uploadFile: uploadFileToSupabase,
    deleteFile: deleteUploadedFile,
    resetUploadState,
  };
};
