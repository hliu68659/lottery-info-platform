import { createConnection } from 'mysql2/promise';
import fs from 'fs';
import { URL } from 'url';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL未设置');
  process.exit(1);
}

// 解析 mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}
const url = new URL(dbUrl);
const config = {
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: true,
};

console.log(`连接到 ${config.host}:${config.port}/${config.database}`);

async function backup() {
  let connection;
  try {
    connection = await createConnection(config);
    console.log('✓ 数据库连接成功');

    let sqlContent = `-- Database backup for lottery-info-platform\n-- Generated: ${new Date().toISOString()}\n\n`;

    // 获取所有表
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [config.database]
    );

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // 获取CREATE TABLE语句
      const [createResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlContent += `\nDROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlContent += `${createResult[0]['Create Table']};\n`;

      // 获取表数据
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const values = rows.map(row => {
          return '(' + columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? '1' : '0';
            return val;
          }).join(', ') + ')';
        }).join(',\n');

        sqlContent += `INSERT INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES\n${values};\n`;
      }
    }

    fs.writeFileSync('database-backup.sql', sqlContent);
    console.log('✓ 数据库已备份到 database-backup.sql');
  } catch (error) {
    console.error('备份失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

backup();
