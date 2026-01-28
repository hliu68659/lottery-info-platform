import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';
import * as schema from './drizzle/schema.ts';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL未设置');
  process.exit(1);
}

async function exportData() {
  const connection = await mysql.createConnection({
    uri: dbUrl,
    ssl: 'amazon',
  });
  const db = drizzle(connection);

  let sqlContent = `-- Database backup for lottery-info-platform\n-- Generated: ${new Date().toISOString()}\n\n`;

  try {
    // 导出users表
    const users = await db.select().from(schema.users);
    if (users.length > 0) {
      sqlContent += `INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES\n`;
      sqlContent += users.map(u => 
        `(${u.id}, '${u.openId}', ${u.name ? `'${u.name}'` : 'NULL'}, ${u.email ? `'${u.email}'` : 'NULL'}, ${u.loginMethod ? `'${u.loginMethod}'` : 'NULL'}, '${u.role}', '${u.createdAt.toISOString()}', '${u.updatedAt.toISOString()}', '${u.lastSignedIn.toISOString()}')`
      ).join(',\n') + ';\n\n';
    }

    // 导出lottery_types表
    const lotteryTypes = await db.select().from(schema.lotteryTypes);
    if (lotteryTypes.length > 0) {
      sqlContent += `INSERT INTO lottery_types (id, code, name, isCustom, apiUrl, intervalHours, displayOrder, enabled, createdAt, updatedAt) VALUES\n`;
      sqlContent += lotteryTypes.map(lt => 
        `(${lt.id}, '${lt.code}', '${lt.name}', ${lt.isCustom ? 1 : 0}, ${lt.apiUrl ? `'${lt.apiUrl}'` : 'NULL'}, ${lt.intervalHours}, ${lt.displayOrder}, ${lt.enabled ? 1 : 0}, '${lt.createdAt.toISOString()}', '${lt.updatedAt.toISOString()}')`
      ).join(',\n') + ';\n\n';
    }

    // 导出number_attributes表
    const numberAttrs = await db.select().from(schema.numberAttributes);
    if (numberAttrs.length > 0) {
      sqlContent += `INSERT INTO number_attributes (id, number, zodiac, color, createdAt, updatedAt) VALUES\n`;
      sqlContent += numberAttrs.map(na => 
        `(${na.id}, ${na.number}, '${na.zodiac}', '${na.color}', '${na.createdAt.toISOString()}', '${na.updatedAt.toISOString()}')`
      ).join(',\n') + ';\n\n';
    }

    fs.writeFileSync('database-backup.sql', sqlContent);
    console.log('✓ 数据库已导出到 database-backup.sql');
    console.log(`✓ 包含 ${users.length} 个用户, ${lotteryTypes.length} 个开奖系统, ${numberAttrs.length} 个号码属性`);
  } catch (error) {
    console.error('导出失败:', error.message);
  } finally {
    await connection.end();
  }
}

exportData();
