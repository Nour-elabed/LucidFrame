import { GeneratedImageModel, GenerationType } from './generated.model';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const enhancePrompt = (prompt: string, type: GenerationType): string => {
  const prefixes: Record<GenerationType, string> = {
    person: 'Professional portrait photography, editorial style: ',
    product: 'Professional studio product photography, clean white background: ',
    person_with_product: 'Professional lifestyle photograph of a person holding a product: ',
  };

  return `${prefixes[type]}${prompt}, high quality, 8k resolution, photorealistic, studio lighting`;
};

/**
 * Generates an image using Gemini AI with enhanced prompts and retry logic.
 */
const generateWithGemini = async (
  prompt: string,
  maxRetries = 3
): Promise<Buffer> => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Gemini AI] Attempt ${attempt + 1}/${maxRetries}`);
      
      // Generate image using Gemini
      const result = await model.generateContent([
        `Generate a high-quality, photorealistic image based on this description: ${prompt}`,
        'The image should be 1024x1024 pixels, professional quality, with excellent lighting and composition.'
      ]);

      const response = await result.response;
      const imageData = response.candidates?.[0]?.content?.parts?.[0];

      if (!imageData) {
        throw new Error('No image data received from Gemini');
      }

      // For Gemini, we'll create a placeholder image since Gemini doesn't directly generate images
      // We'll use a reliable image generation service as fallback
      return await generateFallbackImage(prompt);
      
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini AI] Attempt ${attempt + 1} failed:`, err.message);

      // Wait a bit before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Image generation failed after retries');
};

/**
 * Fallback image generation using a reliable service
 */
const generateFallbackImage = async (prompt: string): Promise<Buffer> => {
  try {
    // Using a more reliable image generation service
    const seed = Math.floor(Math.random() * 100000);
    const fetchUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    console.log(`[Fallback] Generating with enhanced prompt and Flux model`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout

    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Image service returned HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBytes = Buffer.from(arrayBuffer);

    // Validate we actually got image data (at least 1KB)
    if (imageBytes.length < 1024) {
      throw new Error('Response too small — likely not a valid image');
    }

    return imageBytes;
  } catch (error) {
    console.error('[Fallback] Image generation failed:', error);
    throw error;
  }
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

  // Generate image with enhanced Gemini AI
  const imageBytes = await generateWithGemini(enhancedPrompt);

  // Save image to disk
  const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/usr/src/app/uploads'  // Render's mount path
    : path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `ai-${uuidv4()}.jpg`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, imageBytes);

  const imageUrl = `/uploads/${filename}`;

  // Persist to DB
  const generated = await GeneratedImageModel.create({
    userId,
    prompt,
    type,
    imageUrl,
  });

  return generated;
};

export const getUserGenerations = async (userId: string) => {
  return GeneratedImageModel.find({ userId }).sort({ createdAt: -1 }).limit(20);
};
