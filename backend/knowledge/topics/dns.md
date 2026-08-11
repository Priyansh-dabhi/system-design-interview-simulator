# DNS (Domain Name System) & Domain Resolution

DNS is the phonebook of the Internet. Humans access information online through domain names (like `google.com`), while web browsers interact through Internet Protocol (IP) addresses (like `142.250.190.46`). DNS translates domain names to IP addresses.

## How Domain Resolution Works
When a user types `www.example.com` into their browser, the following lookup chain occurs:

1. **Browser/OS Cache**: The browser checks its local cache, then the OS cache. If found, resolution stops here.
2. **Recursive Resolver (ISP)**: If not in local cache, the OS queries the Recursive Resolver (usually provided by the ISP or a public DNS like Google's `8.8.8.8` or Cloudflare's `1.1.1.1`).
3. **Root Name Server**: If the resolver doesn't have the IP cached, it queries a Root Name Server. The root server doesn't know the IP but knows where the Top Level Domain (TLD) server is for `.com`.
4. **TLD Name Server**: The resolver queries the `.com` TLD server. The TLD server knows which Authoritative Name Server handles `example.com`.
5. **Authoritative Name Server**: The resolver queries the Authoritative Name Server. This server holds the actual DNS records for `example.com` and returns the specific IP address for `www.example.com`.
6. **Return & Cache**: The resolver caches the IP (based on the TTL) and returns it to the browser.

## Key DNS Record Types
- **A Record**: Maps a domain name to an IPv4 address.
- **AAAA Record**: Maps a domain name to an IPv6 address.
- **CNAME (Canonical Name)**: Maps an alias name to a true (canonical) domain name (e.g., mapping `blog.example.com` to `example.com`). *Important: A CNAME cannot be placed at the root apex (e.g., you cannot put a CNAME on `example.com`, only on subdomains).*
- **ALIAS / ANAME**: Non-standard but provided by providers like Route53 to map the root apex to another domain dynamically (resolves the CNAME limitation).
- **MX Record**: Directs email to a mail server.
- **TXT Record**: Text notes, highly used for domain verification and email security (SPF, DKIM, DMARC).

## TTL (Time to Live)
Every DNS record has a TTL, which dictates how long resolvers should cache the record before asking the Authoritative Name Server again.
- **High TTL (e.g., 24 hours)**: Reduces load on your DNS servers and speeds up resolution for users. Good for stable IPs.
- **Low TTL (e.g., 60 seconds)**: Allows for rapid failover or infrastructure changes. If a server dies, you can update the IP and users will route to the new IP in 1 minute.

## Advanced Routing via DNS
Authoritative DNS servers (like Route53 or Cloudflare) can return different IP addresses based on complex logic, effectively acting as a global load balancer:
- **Weighted Routing**: Route 80% of traffic to IP A, 20% to IP B (useful for canary deployments).
- **Latency-Based Routing**: Ping the user's location and return the IP of the data center that will provide the lowest latency.
- **Geolocation Routing**: Return an IP based on the user's country (useful for compliance/GDPR or localization).
- **Failover Routing**: Actively monitor a primary IP. If it goes down, automatically start returning a backup IP.

## Common Candidate Mistakes
- Suggesting changing a DNS record for instant, real-time load balancing (ignoring the reality of TTL and global ISP caching delays).
- Confusing a Domain Registrar (where you buy the name) with a DNS Provider (who hosts the Authoritative Name Server). They are often the same company, but architecturally distinct.

## Follow-Up Interview Probes
- "If you change the A record for your domain to point to a new server, why might some users still hit the old server an hour later?"
- "How does Latency-Based DNS routing actually know the latency between the user and your data center?"
- "Why can't you use a CNAME for the root domain (example.com), and how do modern cloud providers work around this?"
