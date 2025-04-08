// Simple file storage
export async function uploadToIPFS(file, projectName) {
    if (!file) {
        return { url: '' };
    }

    try {
        // Create a URL for the video file
        const videoUrl = URL.createObjectURL(file);
        return { url: videoUrl };
    } catch (error) {
        console.error('Error storing video:', error);
        throw new Error('Failed to process video');
    }
}

export function getIPFSUrl(projectName) {
    return '';
}
