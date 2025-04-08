'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useContractOperations } from '../hooks/useContractOperations';
import { uploadToIPFS } from '../utils/storage';
import Link from 'next/link';
import contractConfig from '../utils/contractConfig.json';

export default function ListProject() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [videoError, setVideoError] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');
    const videoInputRef = useRef(null);
    const router = useRouter();
    const { listProject, error: contractError, clearError } = useContractOperations();

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        setVideoError('');
        setUploadProgress('');

        if (file) {
            // Check file type
            if (!file.type.startsWith('video/')) {
                setVideoError('Please upload a valid video file');
                return;
            }

            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setVideoError('Video size should be less than 50MB');
                return;
            }

            setVideoFile(file);
            const videoUrl = URL.createObjectURL(file);
            setVideoPreview(videoUrl);
            console.log('Video preview URL created:', videoUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVideoError('');
        setUploadProgress('');
        clearError();
        
        try {
            // Validate form data
            if (!formData.name?.trim()) {
                throw new Error('Project name is required');
            }
            if (!formData.description?.trim()) {
                throw new Error('Project description is required');
            }

            let videoUrl = '';
            
            if (videoFile) {
                try {
                    setUploadProgress('Processing video...');
                    const result = await uploadToIPFS(videoFile, formData.name);
                    videoUrl = result.url;
                    setUploadProgress('Video processed successfully!');
                } catch (uploadError) {
                    setVideoError(uploadError.message);
                    setLoading(false);
                    return;
                }
            }

            setUploadProgress('Creating project...');
            const success = await listProject(
                formData.name.trim(), 
                formData.description.trim()
            );

            if (success) {
                router.push('/projects');
            } else if (contractError) {
                setVideoError(contractError);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            setVideoError(error.message || 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    const removeVideo = () => {
        setVideoFile(null);
        setVideoPreview('');
        setVideoError('');
        setUploadProgress('');
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-green-700">List a New Project</h1>
                <Link 
                    href="/projects" 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    View Listed Projects
                </Link>
            </div>
            
            {videoError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{videoError}</span>
                </div>
            )}

            {uploadProgress && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
                    <span className="block sm:inline">{uploadProgress}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-green-700">
                        Project Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                        required
                        maxLength={50}
                        disabled={loading}
                        placeholder="Enter your project name"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-green-700">
                        Project Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 resize-none text-gray-900"
                        required
                        maxLength={200}
                        disabled={loading}
                        placeholder="Describe your project"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.description.length}/200 characters
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                        Project Video (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {!videoPreview ? (
                                <>
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="video-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                                        >
                                            <span>Upload a video</span>
                                            <input
                                                id="video-upload"
                                                name="video-upload"
                                                type="file"
                                                accept="video/*"
                                                className="sr-only"
                                                onChange={handleVideoChange}
                                                ref={videoInputRef}
                                                disabled={loading}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">MP4, WebM up to 50MB</p>
                                </>
                            ) : (
                                <div className="relative">
                                    <video
                                        src={videoPreview}
                                        className="max-h-48 rounded"
                                        controls
                                    />
                                    <button
                                        type="button"
                                        onClick={removeVideo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Listing fee: {contractConfig.contracts.ProjectListing.subscriptionFee} ETH
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Creating Project...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
