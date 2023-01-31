import { DB } from "$sqlite/mod.ts";

export type Peraturan = {
  jenis: string;
  tahun: number;
  nomor: number;
  judul: string;
  tanggal_ditetapkan: Date;
  tanggal_diundangkan: Date;
  tanggal_berlaku: Date;
  nomor_text: string;
};

// deno-lint-ignore no-explicit-any
function buildWhereClause({ ...params }: Record<string, any>) {
  (Object.keys(params) as Array<keyof typeof params>).forEach((key) => {
    if (!params[key]) {
      delete params[key];
    }
  });
  const conditions = Object.keys(params).map((key) => `${key} = :${key}`).join(
    " AND ",
  );
  return {
    whereClause: conditions ? ` WHERE ${conditions}` : "",
    whereParams: params,
  };
}

export const getListPeraturan = (db: DB, {
  jenis,
  tahun,
  page: pageParam,
  pageSize: pageSizeParam,
}: {
  jenis?: string;
  tahun?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { whereClause, whereParams } = buildWhereClause({ jenis, tahun });
  const page = pageParam ?? 1;
  const pageSize = pageSizeParam ?? 10;
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const hasil = db.queryEntries<Peraturan>(
    `SELECT * FROM peraturan ${whereClause} ORDER BY tahun DESC, nomor DESC LIMIT :limit  OFFSET :offset`,
    { ...whereParams, limit, offset },
  );
  const [[total]] = db.query<number[]>(
    `SELECT COUNT(*) FROM peraturan ${whereClause}`,
    whereParams,
  );
  return { total, hasil, page, pageSize };
};

export const getFilterByJenisCount = (
  db: DB,
  params: { jenis?: string; tahun?: string },
) => {
  const { whereClause, whereParams } = buildWhereClause(params);
  return db.queryEntries<{ jenis: string; jumlah: number }>(
    `SELECT jenis, count(*) AS jumlah FROM peraturan ${whereClause} GROUP BY jenis`,
    whereParams,
  );
};

export const getFilterByTahunCount = (
  db: DB,
  params: { jenis?: string; tahun?: string },
) => {
  const { whereClause, whereParams } = buildWhereClause(params);
  return db.queryEntries<{ tahun: number; jumlah: number }>(
    `SELECT tahun, count(*) AS jumlah FROM peraturan ${whereClause} GROUP BY tahun ORDER BY tahun DESC`,
    whereParams,
  );
};

export const getPeraturan = (
  db: DB,
  jenis: string,
  tahun: string,
  nomor: string,
) => {
  const [peraturan] = db.queryEntries<Peraturan>(
    `SELECT * FROM peraturan WHERE jenis = :jenis AND tahun = :tahun AND nomor = :nomor`,
    { jenis, tahun, nomor },
  );
  if (peraturan) return peraturan;
  return null;
};

export type SumberPeraturan = {
  id: number;
  nama: string;
  url_page: string;
  url_pdf: string;
};

export const getSumberPeraturan = (
  db: DB,
  jenis: string,
  tahun: string,
  nomor: string,
) => {
  return db.queryEntries<SumberPeraturan>(
    `SELECT * FROM sumber WHERE jenis_tahun_nomor = :key`,
    [`${jenis}/${tahun}/${nomor}`],
  );
};
