import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadValidationSchema } from '@/lib/testimony/schemas';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    // Validate file type and size
    const validation = uploadValidationSchema.safeParse({
      fileType: file.type,
      fileSize: file.size,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message ?? 'Invalid file' },
        { status: 400 },
      );
    }

    // Generate unique file path
    const ext = file.name.split('.').pop() ?? 'bin';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from('testimonies')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload failed. Please try again.' },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('testimonies').getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
