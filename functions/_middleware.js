const IMAGE_ASSET_PATTERN = /^\/img\/.+\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "www.danyavidmich.com") {
    url.hostname = "danyavidmich.com";
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  // Cloudflare may keep stale fallback HTML for missing image URLs; never expose that as an image response.
  if (IMAGE_ASSET_PATTERN.test(url.pathname) && contentType.includes("text/html")) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }

  return response;
}
