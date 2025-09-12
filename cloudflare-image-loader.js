export default function cloudflareImageLoader({ src, width, quality }) {
  // Check if the image is from the Cloudflare Images domain
  if (src.includes('imgs.divinity.milklegend.xyz')) {
    // Extract the image ID from the URL
    const imageId = src.split('/').pop();
    
    // Construct Cloudflare Images URL with transformations
    const params = new URLSearchParams();
    params.set('width', width.toString());
    params.set('quality', (quality || 75).toString());
    params.set('format', 'auto');
    
    return `https://imgs.divinity.milklegend.xyz/cdn-cgi/image/${params.toString()}/${imageId}`;
  }
  
  // For other domains, return the original src
  return src;
}
