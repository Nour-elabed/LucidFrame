import { Request, Response, NextFunction } from 'express';
import * as AIService from './ai.service';
import { sendSuccess } from '../../utils/response.utils';
import { GenerationType } from './generated.model';

export const generate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, type } = req.body;

    const validTypes: GenerationType[] = ['person', 'product', 'person_with_product'];
    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: `type must be one of: ${validTypes.join(', ')}`,
      });
      return;
    }

    const generated = await AIService.generateImage(req.user!.userId, prompt, type, req.file);
    sendSuccess(res, generated, 'Image generated successfully', 201);
  } catch (err: any) {
    // Provide a user-friendly error instead of a raw 500
    console.error('[AI Controller] Generation failed:', err.message);
    res.status(500).json({
      success: false,
      message: 'Image generation failed. Please try again with a different prompt.',
    });
  }
};

export const getMyGenerations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const generations = await AIService.getUserGenerations(req.user!.userId);
    sendSuccess(res, generations, 'Generations retrieved');
  } catch (err) {
    next(err);
  }
};
