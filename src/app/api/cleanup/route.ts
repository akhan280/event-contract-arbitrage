// app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const deletedShares = await prisma.share.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    return NextResponse.json({ 
      message: `Deleted ${deletedShares.count} expired shares`,
      count: deletedShares.count 
    });
  } catch (error) {
    console.error('Error cleaning up expired shares:', error);
    return NextResponse.json({ error: 'Failed to cleanup expired shares' }, { status: 500 });
  }
}