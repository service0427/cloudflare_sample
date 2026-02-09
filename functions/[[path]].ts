/**
 * Cloudflare Pages Function using Hono
 */
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

type Bindings = {
    DB: D1Database;
    BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/api/*', cors());

const PUBLIC_URL = "https://image.toprekr.com";

// API: List Images
app.get('/api/images', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM images ORDER BY uploaded_at DESC'
        ).all();

        // Add full URL and Edge Metadata to results
        const images = results.map((img: any) => ({
            ...img,
            url: `${PUBLIC_URL}/${img.key}`
        }));

        // Get current Edge location
        // @ts-ignore
        const { city, country, colo, region } = c.req.raw.cf || {};

        return c.json({
            meta: {
                served_by: { city, country, colo, region },
                message: "Served directly from Cloudflare's Edge Network closest to you!"
            },
            images
        });
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// API: Upload Image
app.post('/api/upload', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (file instanceof File) {
            const timestamp = Date.now();
            const key = `${timestamp}-${file.name}`;

            // 1. Upload to R2
            await c.env.BUCKET.put(key, file.stream(), {
                httpMetadata: {
                    contentType: file.type,
                },
            });

            // 2. Insert Metadata into D1
            await c.env.DB.prepare(
                'INSERT INTO images (key, filename, content_type, size) VALUES (?, ?, ?, ?)'
            ).bind(key, file.name, file.type, file.size).run();

            return c.json({
                success: true,
                message: "Upload successful",
                data: {
                    key: key,
                    url: `${PUBLIC_URL}/${key}`
                }
            });
        }

        return c.json({ success: false, error: 'No file uploaded' }, 400);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Create schema endpoint (for dev/setup convenience)
app.get('/api/setup', async (c) => {
    try {
        await c.env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                filename TEXT,
                content_type TEXT,
                size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
        return c.text("Schema created successfully");
    } catch (e) {
        return c.text("Error creating schema: " + e.message, 500);
    }
});

export const onRequest = handle(app);
