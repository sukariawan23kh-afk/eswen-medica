import { db } from "../src/lib/db";

async function main() {
  const all = await db.specialOffer.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "asc" }] });
  console.log("Total offers:", all.length);
  // Group by title to find duplicates
  const byTitle = new Map<string, typeof all>();
  for (const o of all) {
    const arr = byTitle.get(o.titleEn) ?? [];
    arr.push(o);
    byTitle.set(o.titleEn, arr);
  }
  // For each title, keep the oldest (smallest createdAt), delete the rest
  let deleted = 0;
  for (const [_title, arr] of byTitle) {
    arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const keep = arr[0];
    for (const o of arr.slice(1)) {
      await db.specialOffer.delete({ where: { id: o.id } });
      deleted++;
      console.log("Deleted duplicate:", o.id, o.titleEn);
    }
    console.log("Kept:", keep.id, keep.titleEn);
  }
  const after = await db.specialOffer.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "asc" }] });
  console.log("After cleanup:", after.length, "offers");
}

main().catch((e) => { console.error(e); process.exit(1); });
