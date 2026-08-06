import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const data = result as {
      secure_url: string;
      public_id: string;
    };

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    });

  } catch (err: any) {
    console.error('Cloudinary upload error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Upload failed',
      },
      {
        status: 500,
      }
    );
  }
}