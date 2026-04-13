import { GeneratedImageModel, GenerationType } from './generated.model';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const enhancePrompt = (prompt: string, type: GenerationType): string => {
  const prefixes: Record<GenerationType, string> = {
    person: 'Professional portrait photography, editorial style: ',
    product: 'Professional studio product photography, clean white background: ',
    person_with_product: 'Professional lifestyle photograph of a person holding a product: ',
  };

  return `${prefixes[type]}${prompt}, high quality, 8k resolution, photorealistic, studio lighting`;
};

/**
 * Attempts to fetch an image from Pollinations AI with retry logic.
 * Uses different seeds on each attempt to avoid cached failures.
 */
const fetchWithRetry = async (
  prompt: string,
  maxRetries = 3
): Promise<Buffer> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const seed = Math.floor(Math.random() * 100000);
      const fetchUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

      console.log(`[AI] Attempt ${attempt + 1}/${maxRetries} — seed=${seed}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout

      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Pollinations returned HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const imageBytes = Buffer.from(arrayBuffer);

      // Validate we actually got image data (at least 1KB)
      if (imageBytes.length < 1024) {
        throw new Error('Response too small — likely not a valid image');
      }

      return imageBytes;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI] Attempt ${attempt + 1} failed:`, err.message);

      // Wait a bit before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Image generation failed after retries');
};

export const generateImage = async (
  userId: string,
  prompt: string,
  type: GenerationType,
  file?: Express.Multer.File
) => {
  let enhancedPrompt = enhancePrompt(prompt, type);

  if (type === 'person_with_product' && file) {
    console.log(`[ControlNet Pipeline] Reference Image Uploaded: ${file.filename}`);
    enhancedPrompt += `, visually matched to the uploaded referenced product image`;
  }

  // Fetch with retry logic
  const imageBytes = await fetchWithRetry(enhancedPrompt);

  // Save image to disk - ensure directory exists
  const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/usr/src/app/uploads'  // Render's mount path
    : path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('[AI Service] Created uploads directory:', uploadDir);
  }

  const filename = `ai-${uuidv4()}.jpg`;
  const filepath = path.join(uploadDir, filename);
  
  try {
    fs.writeFileSync(filepath, imageBytes);
    console.log('[AI Service] Image saved successfully:', filename);
  } catch (error) {
    console.error('[AI Service] Failed to save image:', error);
    throw new Error('Failed to save generated image');
  }

  const imageUrl = `/uploads/${filename}`;
  console.log('[AI Service] Image URL:', imageUrl);

  // Persist to DB
  const generated = await GeneratedImageModel.create({
    userId,
    prompt,
    type,
    imageUrl,
  });

  // Also create a post so AI images appear in feed
  const { PostModel } = require('../posts/post.model');
  const post = await PostModel.create({
    userId,
    imageUrl,
    caption: `AI Generated: ${prompt}`,
  });
  
  // Populate user info for response
  await post.populate('userId', 'username avatar');

  return {
    ...generated.toObject(),
    post: post.toObject(),
  };
};

export const getUserGenerations = async (userId: string) => {
  return GeneratedImageModel.find({ userId }).sort({ createdAt: -1 }).limit(20);
};
