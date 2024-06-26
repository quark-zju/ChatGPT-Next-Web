import * as fs from "fs";

const usageLimitFile = 'state/usage-limit';
const defaultUsageLimit = 1001;

function loadUsageLimit(): number {
  try {
    return parseInt(fs.readlinkSync(usageLimitFile));
  } catch (e) {
    // @ts-ignore
    if (e?.code === 'ENOENT') {
      return defaultUsageLimit;
    }
    throw e;
  }
}

function saveUsageLimit(limit: number) {
  try {
    fs.symlinkSync(limit.toString(), usageLimitFile)
  } catch (e) {
    // @ts-ignore
    if (e?.code === 'EEXIST') {
      fs.unlinkSync(usageLimitFile);
      fs.symlinkSync(limit.toString(), usageLimitFile);
    } else {
      throw e;
    }
  }
}

let usage: number | null = null;

export function getUsageRemaining(): number {
  if (usage == null) {
    usage = loadUsageLimit();
  }
  console.log('[Usage] remaining:', usage);
  if (usage > 0) {
    usage -= 1;
    saveUsageLimit(usage);
  } else {
    // Double check.
    usage = loadUsageLimit();
  }
  return usage;
}

export const config = {
  runtime: "nodejs",
};
