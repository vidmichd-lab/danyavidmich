/**
 * Utility functions for generating responsive image srcsets
 */

export function generateSrcSet(basePath: string, breakpoints = [400, 800, 1200, 1920]): string {
  // Don't generate srcset for GIFs - they should use original path
  if (basePath.toLowerCase().endsWith('.gif')) {
    return '';
  }
  
  // Decode URL-encoded path first to handle spaces and special characters
  let decodedPath = decodeURIComponent(basePath);
  
  // Convert to optimized path
  let optimizedPath = decodedPath.includes('/img/optimized/')
    ? decodedPath
    : decodedPath.replace('/img/', '/img/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Ensure .webp extension
  if (!optimizedPath.endsWith('.webp')) {
    optimizedPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  // Get base path without extension for responsive versions
  const pathWithoutExt = optimizedPath.replace(/\.webp$/i, '');
  
  // Generate srcset with responsive versions (properly encoded)
  const srcsetParts = breakpoints
    .map((width) => {
      const responsivePath = `${pathWithoutExt}-${width}w.webp`;
      // Encode the path properly for URLs
      const encodedPath = encodeURI(responsivePath).replace(/#/g, '%23');
      return `${encodedPath} ${width}w`;
    })
    .filter(Boolean);
  
  return srcsetParts.join(', ');
}

export function getOptimizedImagePath(originalPath: string): string {
  if (!originalPath || originalPath.trim() === '') {
    return '';
  }
  
  // Decode URL-encoded path first to handle spaces and special characters
  let decodedPath = decodeURIComponent(originalPath);
  
  // If already optimized, return as is (but ensure proper encoding)
  if (decodedPath.includes('/img/optimized/')) {
    // Re-encode the path properly for URLs
    return encodeURI(decodedPath).replace(/#/g, '%23');
  }
  
  // For GIFs, use optimized path but keep .gif extension
  if (decodedPath.toLowerCase().endsWith('.gif')) {
    const optimizedPath = decodedPath.replace('/img/', '/img/optimized/');
    return encodeURI(optimizedPath).replace(/#/g, '%23');
  }
  
  // If already .webp, just change path to optimized
  if (decodedPath.toLowerCase().endsWith('.webp')) {
    const optimizedPath = decodedPath.replace('/img/', '/img/optimized/');
    return encodeURI(optimizedPath).replace(/#/g, '%23');
  }
  
  // Convert to optimized path and WebP
  const optimizedPath = decodedPath
    .replace('/img/', '/img/optimized/')
    .replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Encode the path properly for URLs (spaces become %20, etc.)
  return encodeURI(optimizedPath).replace(/#/g, '%23');
}

