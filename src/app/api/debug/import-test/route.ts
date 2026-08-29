import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  // Test 1: basic module load
  results.step1_basic = 'ok';

  // Test 2: import prisma client class only (no connection)
  try {
    const { PrismaClient } = require('@prisma/client');
    results.step2_prisma_import = 'ok';
  } catch (e: any) {
    results.step2_prisma_import = 'FAIL: ' + e.message;
  }

  // Test 3: create prisma client (no query)
  try {
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient({ log: [] });
    results.step3_prisma_create = 'ok';
    p.$disconnect();
  } catch (e: any) {
    results.step3_prisma_create = 'FAIL: ' + e.message;
  }

  // Test 4: import db module
  try {
    const mod = require('@/lib/db');
    results.step4_db_import = 'ok';
  } catch (e: any) {
    results.step4_db_import = 'FAIL: ' + e.message;
  }

  // Test 5: import auth module
  try {
    const mod = require('@/lib/auth');
    results.step5_auth_import = 'ok';
  } catch (e: any) {
    results.step5_auth_import = 'FAIL: ' + e.message;
  }

  // Test 6: import api-helpers
  try {
    const mod = require('@/lib/api-helpers');
    results.step6_helpers_import = 'ok';
  } catch (e: any) {
    results.step6_helpers_import = 'FAIL: ' + e.message;
  }

  // Test 7: import serialize
  try {
    const mod = require('@/lib/serialize');
    results.step7_serialize_import = 'ok';
  } catch (e: any) {
    results.step7_serialize_import = 'FAIL: ' + e.message;
  }

  // Test 8: import bcryptjs
  try {
    require('bcryptjs');
    results.step8_bcryptjs = 'ok';
  } catch (e: any) {
    results.step8_bcryptjs = 'FAIL: ' + e.message;
  }

  // Test 9: import jsonwebtoken
  try {
    require('jsonwebtoken');
    results.step9_jsonwebtoken = 'ok';
  } catch (e: any) {
    results.step9_jsonwebtoken = 'FAIL: ' + e.message;
  }

  return NextResponse.json(results);
}
