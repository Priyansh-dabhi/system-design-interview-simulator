# Content Delivery Network (CDN) & Edge Computing

A Content Delivery Network (CDN) is a geographically distributed network of proxy servers and their data centers. The goal is to provide high availability and high performance by distributing the service spatially relative to end-users.

## Core Concepts
- **Origin Server**: Your actual application server or storage bucket (e.g., AWS S3) where the original, authoritative files live.
- **Edge Servers (PoPs - Points of Presence)**: CDN servers located in hundreds of cities around the world, physically close to users.
- **Cache Hit**: User requests a file; the edge server has it and serves it instantly.
- **Cache Miss**: User requests a file; the edge server doesn't have it (or it expired). The edge server fetches it from the origin, serves it to the user, and caches it for future requests.

## Why Use a CDN?
1. **Reduce Latency**: Physics dictates that data takes time to travel. Serving an image to a user in Tokyo from a server in New York takes ~200ms. A Tokyo CDN edge server does it in 10ms.
2. **Reduce Bandwidth Costs**: CDNs absorb the vast majority of traffic. Origin servers don't pay outbound bandwidth costs for cached assets.
3. **Handle Traffic Spikes**: If a video goes viral, the CDN handles the millions of requests, preventing the origin server from crashing.
4. **Security (DDoS Protection)**: CDNs like Cloudflare have massive network capacity and can absorb and filter out massive Distributed Denial of Service attacks before they reach your origin.

## Push vs. Pull CDNs
- **Pull CDN (Most Common)**: The CDN automatically pulls data from the origin server upon a cache miss. Easiest to set up. Best for content with heavy but unpredictable traffic.
- **Push CDN**: You manually upload (push) files directly to the CDN. The origin doesn't serve requests for these files. Best for small sites or predictable, static assets (like a known software update file).

## What to Cache?
- **Static Content**: Images, videos, CSS, JavaScript, fonts. These are highly cacheable and should almost always live on a CDN.
- **Dynamic Content (Edge Computing)**: Historically, HTML tailored to a logged-in user couldn't be cached. Modern Edge Computing (Cloudflare Workers, Lambda@Edge) allows you to run small bits of JavaScript code directly on the edge servers to customize content, stitch HTML, or verify JWT tokens without hitting the origin.

## Cache Invalidation
When an asset changes at the origin (e.g., updating a logo), the CDN must be updated.
1. **TTL (Time to Live)**: The simplest approach. Files naturally expire after a set time.
2. **Purge/Invalidation API**: Calling the CDN provider to force-delete a specific URL from all global edge servers. Can be slow (minutes).
3. **Cache-Busting (File Versioning)**: The best practice. Append a hash or version to the filename (e.g., `style.v23a9f.css`). When the file changes, the HTML points to the new filename. The CDN treats it as a brand new request. Old files naturally age out.

## Real-World Examples
- **Netflix**: Built their own massive CDN called Open Connect. They install custom physical servers directly inside ISPs (Comcast, Verizon) around the world to serve terabytes of video content with zero network hops.
- **Cloudflare / Fastly / Akamai**: Major commercial CDN providers.
- **Amazon CloudFront**: AWS's integrated CDN.

## Common Candidate Mistakes
- Thinking a CDN is a replacement for a database cache (like Redis). CDNs cache HTTP responses at the edge; Redis caches data models in the data center.
- Not knowing how to handle cache invalidation (suggesting an API purge for every single file update instead of file versioning).
- Assuming dynamic user data can be easily cached on a standard CDN without edge logic.

## Follow-Up Interview Probes
- "You updated a javascript file but users are still seeing the old version because of the CDN. How do you architect your build system to prevent this?"
- "Can we use a CDN to cache API responses? If so, what are the security implications?"
- "How does a CDN protect your origin server from a Layer 7 DDoS attack?"
