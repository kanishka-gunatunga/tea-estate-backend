import { ZipArchive } from 'archiver';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, rm, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { parseDatabaseUrl } from '../utils/database-url';
import { buildDataExport } from './backup-export.service';

const BACKUP_VERSION = '1.0';

function formatBackupRecord(record: {
  id: string;
  filename: string;
  type: string;
  sizeKB: number;
  records: number | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: record.id,
    filename: record.filename,
    type: record.type,
    sizeKB: record.sizeKB,
    records: record.records,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
  };
}

async function ensureStorageDir() {
  await mkdir(env.BACKUP_STORAGE_PATH, { recursive: true });
}

function buildBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `tea-estate-backup-${timestamp}.zip`;
}

async function runMysqlDump(outputPath: string): Promise<void> {
  const db = parseDatabaseUrl(env.DATABASE_URL);

  await new Promise<void>((resolve, reject) => {
    const args = [
      `--host=${db.host}`,
      `--port=${db.port}`,
      `--user=${db.user}`,
      '--single-transaction',
      '--routines',
      '--triggers',
      '--add-drop-table',
      db.database,
    ];

    const dump = spawn('mysqldump', args, {
      env: { ...process.env, MYSQL_PWD: db.password },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const output = createWriteStream(outputPath);
    let stderr = '';

    dump.stdout.pipe(output);
    dump.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    dump.on('error', (error) => {
      reject(
        new AppError(
          500,
          `mysqldump failed to start. Ensure MySQL client tools are installed. ${error.message}`,
        ),
      );
    });

    dump.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new AppError(500, `mysqldump exited with code ${code}. ${stderr.trim()}`));
    });
  });
}

async function createZipArchive(
  zipPath: string,
  files: Array<{ path: string; name: string }>,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (error: Error) => reject(error));

    archive.pipe(output);

    for (const file of files) {
      archive.file(file.path, { name: file.name });
    }

    void archive.finalize();
  });
}

export async function listBackups() {
  const backups = await prisma.backupRecord.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return backups.map(formatBackupRecord);
}

export async function createBackup(type: 'Manual') {
  await ensureStorageDir();

  const tempDir = path.join(env.BACKUP_STORAGE_PATH, `.tmp-${Date.now()}`);
  const filename = buildBackupFilename();
  const zipPath = path.join(env.BACKUP_STORAGE_PATH, filename);
  const sqlPath = path.join(tempDir, 'database.sql');
  const dataPath = path.join(tempDir, 'data.json');
  const manifestPath = path.join(tempDir, 'manifest.json');

  await mkdir(tempDir, { recursive: true });

  try {
    const { data, manifest, totalRecords } = await buildDataExport();

    await runMysqlDump(sqlPath);
    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          ...manifest,
          database: parseDatabaseUrl(env.DATABASE_URL).database,
          backupVersion: BACKUP_VERSION,
        },
        null,
        2,
      ),
      'utf8',
    );

    await createZipArchive(zipPath, [
      { path: sqlPath, name: 'database.sql' },
      { path: dataPath, name: 'data.json' },
      { path: manifestPath, name: 'manifest.json' },
    ]);

    const { size } = await stat(zipPath);
    const sizeKB = Math.max(1, Math.ceil(size / 1024));

    const record = await prisma.backupRecord.create({
      data: {
        filename,
        type,
        sizeKB,
        records: totalRecords,
        status: 'success',
        filePath: zipPath,
      },
    });

    return formatBackupRecord(record);
  } catch (error) {
    await unlink(zipPath).catch(() => undefined);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, error instanceof Error ? error.message : 'Backup failed');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function getBackupFilePath(id: string) {
  const backup = await prisma.backupRecord.findUnique({ where: { id } });

  if (!backup) {
    throw new AppError(404, 'Backup not found');
  }

  if (backup.status !== 'success') {
    throw new AppError(400, 'Backup file is not available');
  }

  try {
    await stat(backup.filePath);
  } catch {
    throw new AppError(404, 'Backup file missing on server');
  }

  return backup;
}

export async function deleteBackup(id: string) {
  const backup = await prisma.backupRecord.findUnique({ where: { id } });

  if (!backup) {
    throw new AppError(404, 'Backup not found');
  }

  await unlink(backup.filePath).catch(() => undefined);
  await prisma.backupRecord.delete({ where: { id } });

  return { id };
}
