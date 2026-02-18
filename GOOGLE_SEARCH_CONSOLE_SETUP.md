# Google Search Console Setup Guide

## Submit Your Sitemap to Google Search Console

### Step 1: Verify Your Website Ownership

#### Method 1: HTML File Upload (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter your website URL (e.g., `https://teamvortex.com`)
4. Choose "HTML file" verification method
5. Download the verification file (e.g., `google1234567890abcdef.html`)
6. Upload it to your `public/` folder
7. Deploy your site
8. Click "Verify" in Google Search Console

#### Method 2: HTML Meta Tag
1. Choose "HTML tag" verification method
2. Copy the meta tag provided
3. Add it to `public/index.html` in the `<head>` section:
   ```html
   <meta name="google-site-verification" content="your-verification-code" />
   ```
4. Deploy your site
5. Click "Verify"

#### Method 3: DNS Verification (If you manage DNS)
1. Choose "Domain name provider" method
2. Add TXT record to your DNS settings
3. Wait for DNS propagation (can take 24-48 hours)
4. Click "Verify"

---

### Step 2: Submit Your Sitemap

Once verified:

1. **In Google Search Console:**
   - Click on your property
   - Go to "Sitemaps" in the left sidebar
   - Enter your sitemap URL: `sitemap.xml`
   - Click "Submit"

2. **Your sitemap URL will be:**
   ```
   https://yourdomain.com/sitemap.xml
   ```

3. **Google will:**
   - Fetch your sitemap
   - Start crawling your pages
   - Index them in search results (takes 1-7 days)

---

### Step 3: Update Your Sitemap

Your current sitemap is at `public/sitemap.xml`. Let me check and update it:

**Current sitemap structure:**
- Should list all important pages
- Should include priority and change frequency
- Should be updated when you add new pages

---

## Your Current Sitemap

Let me check your existing sitemap and update it if needed.

---

## Sitemap Best Practices

### 1. Include Important Pages
- Homepage
- Events page
- Team page
- Sponsors page
- Individual event pages (dynamic)

### 2. Set Priorities
- Homepage: 1.0 (highest)
- Main pages: 0.8
- Event pages: 0.6-0.8
- Other pages: 0.5

### 3. Update Frequency
- Homepage: daily
- Events: weekly
- Static pages: monthly

### 4. Dynamic Sitemap (Recommended)
For events that change frequently, create a dynamic sitemap that auto-updates.

---

## Robots.txt Configuration

Your `robots.txt` should allow Google to crawl your sitemap:

```txt
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## Verification Methods Comparison

| Method | Difficulty | Recommended |
|--------|-----------|-------------|
| HTML File | Easy | ✅ Yes |
| Meta Tag | Easy | ✅ Yes |
| DNS | Medium | For domain-level |
| Google Analytics | Easy | If already using GA |
| Google Tag Manager | Easy | If already using GTM |

---

## After Submission

### What to Monitor:

1. **Coverage Report**
   - Check which pages are indexed
   - Fix any errors

2. **Performance Report**
   - See search impressions
   - Track clicks and CTR

3. **Enhancements**
   - Mobile usability
   - Core Web Vitals
   - Page experience

### Timeline:
- **Verification**: Instant
- **Sitemap Processing**: 1-24 hours
- **Indexing**: 1-7 days
- **Ranking**: 2-4 weeks

---

## Troubleshooting

### Sitemap Not Found
- ✓ Check file is in `public/` folder
- ✓ Verify URL is accessible: `yourdomain.com/sitemap.xml`
- ✓ Check file permissions
- ✓ Clear CDN cache if using one

### Verification Failed
- ✓ Ensure verification file is in root directory
- ✓ File must be accessible without login
- ✓ Check for redirects
- ✓ Wait a few minutes and retry

### Pages Not Indexed
- ✓ Check robots.txt isn't blocking
- ✓ Ensure pages are linked from sitemap
- ✓ Check for noindex meta tags
- ✓ Wait 7-14 days for initial indexing

---

## Advanced: Dynamic Sitemap Generation

For automatically updating your sitemap with new events:

### Option 1: Server-Side Generation
Create an API endpoint that generates sitemap dynamically:

```javascript
// server/routes/sitemap.js
router.get('/sitemap.xml', async (req, res) => {
  const events = await Event.find({ status: 'published' });
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://yourdomain.com/events</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  
  events.forEach(event => {
    xml += `
  <url>
    <loc>https://yourdomain.com/events/${event.slug}</loc>
    <lastmod>${event.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  });
  
  xml += '\n</urlset>';
  
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});
```

### Option 2: Build-Time Generation
Use a script to generate sitemap during build:

```javascript
// scripts/generate-sitemap.js
const fs = require('fs');
const axios = require('axios');

async function generateSitemap() {
  const events = await axios.get('https://yourapi.com/api/events');
  
  // Generate XML...
  
  fs.writeFileSync('public/sitemap.xml', xml);
}

generateSitemap();
```

Add to `package.json`:
```json
{
  "scripts": {
    "build": "npm run generate-sitemap && react-scripts build",
    "generate-sitemap": "node scripts/generate-sitemap.js"
  }
}
```

---

## SEO Checklist

After submitting sitemap:

- [ ] Verify ownership in Google Search Console
- [ ] Submit sitemap.xml
- [ ] Submit robots.txt
- [ ] Add meta descriptions to all pages
- [ ] Add Open Graph tags for social sharing
- [ ] Optimize page titles
- [ ] Add structured data (JSON-LD)
- [ ] Ensure mobile-friendly design
- [ ] Optimize page load speed
- [ ] Add alt text to images
- [ ] Create quality content
- [ ] Build backlinks

---

## Quick Start Commands

### 1. Verify your sitemap is accessible:
```bash
curl https://yourdomain.com/sitemap.xml
```

### 2. Test robots.txt:
```bash
curl https://yourdomain.com/robots.txt
```

### 3. Check if Google can access:
Use Google's URL Inspection tool in Search Console

---

## Important URLs

- **Google Search Console**: https://search.google.com/search-console
- **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Robots.txt Tester**: https://support.google.com/webmasters/answer/6062598
- **Rich Results Test**: https://search.google.com/test/rich-results

---

## Need Help?

Common issues and solutions:

1. **"Sitemap could not be read"**
   - Check XML syntax
   - Ensure proper encoding (UTF-8)
   - Verify file is accessible

2. **"Sitemap is HTML"**
   - You're serving HTML instead of XML
   - Check server configuration
   - Ensure correct Content-Type header

3. **"Couldn't fetch sitemap"**
   - Check URL is correct
   - Verify no authentication required
   - Check server is responding

---

## Pro Tips

1. **Submit multiple sitemaps** if you have many pages:
   - `sitemap-events.xml`
   - `sitemap-pages.xml`
   - `sitemap-index.xml` (master sitemap)

2. **Use sitemap index** for large sites:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <sitemap>
       <loc>https://yourdomain.com/sitemap-events.xml</loc>
     </sitemap>
     <sitemap>
       <loc>https://yourdomain.com/sitemap-pages.xml</loc>
     </sitemap>
   </sitemapindex>
   ```

3. **Monitor regularly**:
   - Check weekly for crawl errors
   - Update sitemap when adding pages
   - Resubmit after major changes

4. **Use Search Console API** for automation:
   - Auto-submit new pages
   - Monitor indexing status
   - Get alerts for issues
