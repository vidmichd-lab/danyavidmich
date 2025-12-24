/**
 * Utility functions for generating responsive image srcsets
 */

export function generateSrcSet(basePath: string, breakpoints = [400, 800, 1200, 1920]): string {
  return breakpoints
    .map((width) => {
      // Convert to optimized path
      let optimizedPath = basePath.includes('/optimized/')
        ? basePath
        : basePath.replace('/img/', '/img/optimized/').replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
      
      // Ensure .webp extension
      if (!optimizedPath.endsWith('.webp')) {
        optimizedPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
      
      // Add width suffix
      const suffix = `-${width}w`;
      const pathWithoutExt = optimizedPath.replace(/\.webp$/i, '');
      const responsivePath = `${pathWithoutExt}${suffix}.webp`;
      
      return `${responsivePath} ${width}w`;
    })
    .join(', ');
}

export function getOptimizedImagePath(originalPath: string): string {
  // If already optimized, return as is
  if (originalPath.includes('/optimized/')) {
    return originalPath;
  }
  
  // Convert to optimized path
  const optimizedPath = originalPath
    .replace('/img/', '/img/optimized/')
    .replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  
  return optimizedPath;
}

