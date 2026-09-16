import {NextResponse} from 'next/server'; import {insights} from '@/lib/ai/provider'; export async function GET(){return NextResponse.json({insights:await insights()});}
