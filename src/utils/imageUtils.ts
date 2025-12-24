/**
 * Utility functions for generating responsive image srcsets
 */

export function generateSrcSet(basePath: string, breakpoints = [400, 800, 1200, 1920]): string {
  return breakpoints
    .map((width) => {
      // If path already has optimized directory, use it
      const optimizedPath = basePath.includes('/optimized/')
        ? basePath
        : basePath.replace('/img/', '/img/optimized/').replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
      
      // Add width suffix if not already present
      const suffix = `-${width}w`;
      const ext = optimizedPath.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp';
      const pathWithoutExt = optimizedPath.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      
      // Check if responsive version exists (has width suffix)
      const responsivePath = optimizedPath.includes(suffix)
        ? optimizedPath
        : `${pathWithoutExt}${suffix}${ext}`;
      
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

