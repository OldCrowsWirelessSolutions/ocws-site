import { NextResponse } from 'next/server';
import { getTodayHoliday } from '@/lib/corvus-calendar';

export async function GET() {
  const holiday = getTodayHoliday();
  const today = new Date();

  return NextResponse.json({
    holiday,
    date: {
      month: today.getMonth() + 1,
      day: today.getDate(),
      year: today.getFullYear(),
      dayOfWeek: today.getDay(),
    },
  });
}
