/**
 * Utility functions for generating responsive image srcsets
 */

export function generateSrcSet(basePath: string, breakpoints = [400, 800, 1200, 1920]): string {
  // Don't generate srcset for GIFs - they should use original path
  if (basePath.toLowerCase().endsWith('.gif')) {
    return '';
  }
  
  // Convert to optimized path
  let optimizedPath = basePath.includes('/img/optimized/')
    ? basePath
    : basePath.replace('/img/', '/img/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Ensure .webp extension
  if (!optimizedPath.endsWith('.webp')) {
    optimizedPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  // Get base path without extension for responsive versions
  const pathWithoutExt = optimizedPath.replace(/\.webp$/i, '');
  
  // Generate srcset with responsive versions
  const srcsetParts = breakpoints
    .map((width) => {
      const responsivePath = `${pathWithoutExt}-${width}w.webp`;
      return `${responsivePath} ${width}w`;
    })
    .filter(Boolean);
  
  return srcsetParts.join(', ');
}

export function getOptimizedImagePath(originalPath: string): string {
  if (!originalPath || originalPath.trim() === '') {
    return '';
  }
  
  // If already optimized, return as is
  if (originalPath.includes('/img/optimized/')) {
    return originalPath;
  }
  
  // For GIFs, use optimized path but keep .gif extension
  if (originalPath.toLowerCase().endsWith('.gif')) {
    return originalPath.replace('/img/', '/img/optimized/');
  }
  
  // If already .webp, just change path to optimized
  if (originalPath.toLowerCase().endsWith('.webp')) {
    return originalPath.replace('/img/', '/img/optimized/');
  }
  
  // Convert to optimized path and WebP
  const optimizedPath = originalPath
    .replace('/img/', '/img/optimized/')
    .replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return optimizedPath;
}

