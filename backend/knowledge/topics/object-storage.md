# Blob and Object Storage

When designing systems that handle media (images, videos, user uploads, backups), traditional relational databases are the wrong choice. Object storage is designed to store massive amounts of unstructured data efficiently and cheaply.

## Object Storage Basics
- **What it is**: Data is managed as "objects" rather than files in a directory tree or blocks on a disk. Each object contains the data itself, a variable amount of metadata, and a globally unique identifier (URL).
- **Examples**: Amazon S3, Google Cloud Storage (GCS), Azure Blob Storage.
- **Pros**: Infinitely scalable, highly durable (AWS guarantees 99.999999999% durability), extremely cheap compared to database storage.
- **Cons**: Not suitable for fast, incremental updates. You cannot modify a single byte of an object; you must overwrite the entire object. High latency compared to local disk.

## How it Fits into System Design
You almost never store blobs directly in a SQL or NoSQL database (it bloats the database, degrades performance, and costs a fortune). Instead:
1. The client uploads the image to Object Storage.
2. Object Storage returns the URL of the image.
3. The server stores that URL (a tiny string) in the relational database, associated with the user.

## Pre-Signed URLs (Secure Uploads/Downloads)
A common system design problem is: "How do millions of users upload videos without overwhelming our application servers?"
- **The Bad Way**: The client sends the 1GB video to your Node.js API server. The Node.js server buffers it in memory, then uploads it to S3. This crushes your server's memory and bandwidth.
- **The Good Way (Pre-Signed URLs)**:
  1. The client asks your API server: "I want to upload a video."
  2. The API server authenticates the user, then asks S3 for a temporary, secure "Pre-Signed Upload URL" valid for 15 minutes.
  3. The API returns this URL to the client.
  4. The client uploads the 1GB video *directly* to S3 using that URL, completely bypassing your API servers.
  5. S3 triggers an event (e.g., via AWS SNS) notifying your backend that the upload is complete.

## Content Delivery and Optimization
Raw uploads are rarely served directly to users.
- **Processing**: When a video is uploaded, S3 triggers an event to a worker queue (e.g., AWS SQS -> EC2 instances). The workers transcode the video into multiple resolutions (1080p, 720p) and formats (HLS/DASH for streaming), then save those back to S3.
- **Serving**: An S3 bucket is almost always put behind a CDN (like CloudFront). The user requests the video from the CDN. If the CDN doesn't have it, it pulls it from S3.

## Storage Tiers
Object storage is cheap, but can be made even cheaper by utilizing lifecycle policies to move data to slower tiers.
- **Standard**: High availability, low latency. Good for active content (profile pictures, current videos).
- **Infrequent Access (IA)**: Cheaper storage, but you pay a fee every time you access it. Good for older content.
- **Cold Storage (Glacier)**: Extremely cheap storage. Retrieval takes minutes to hours. Good for compliance backups or archiving inactive accounts.

## Common Candidate Mistakes
- Proposing storing images directly as BLOBs in PostgreSQL or MongoDB.
- Designing a system where massive files are routed through the application servers before going to S3.
- Forgetting to mention putting a CDN in front of an S3 bucket for read-heavy systems (like Instagram or YouTube).

## Follow-Up Interview Probes
- "How do you ensure that only authorized users can download a specific private video from your S3 bucket?" *(Hint: Pre-signed download URLs or CDN signed cookies).*
- "If users upload 10 TB of videos per day, how does your backend architecture handle the transcoding process without crashing?"
- "What happens if a user uploads a video directly to S3 using a pre-signed URL, but the upload fails halfway through?"
