"use client";

import { useState } from 'react';

interface UploadResult {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
}

interface UseCloudinaryUploadReturn {
    uploadImage: (file: File, folder?: string) => Promise<UploadResult>;
    uploadMultiple: (files: File[], folder?: string) => Promise<UploadResult[]>;
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File, folder: string = 'campus-hive'): Promise<UploadResult> => {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            setProgress(50);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setProgress(100);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    const uploadMultiple = async (files: File[], folder: string = 'campus-hive'): Promise<UploadResult[]> => {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            const results: UploadResult[] = [];
            
            for (let i = 0; i < files.length; i++) {
                const result = await uploadImage(files[i], folder);
                results.push(result);
                setProgress(((i + 1) / files.length) * 100);
            }

            return results;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        uploadMultiple,
        isUploading,
        progress,
        error,
    };
}
