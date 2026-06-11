import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        // Cross-origin isolation, required for ffmpeg.wasm's multi-threaded
        // build (SharedArrayBuffer is only available on isolated pages).
        // No third-party embeds exist in this app yet, so it's safe to
        // apply globally instead of splitting ffmpeg off into its own page.
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
