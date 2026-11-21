// A small, deterministic flash-translation-layer model for the live phone view.
// Pages are representative 256-byte teaching pages; full file bytes stay in the
// in-browser file record so that open/restart/hash actions use real local data.

export const PAGE_BYTES = 256;
export const PAGES_PER_BLOCK = 8;

const clone = value => structuredClone(value);
const pageAddress = page => `B${page.blockId}·P${String(page.index).padStart(2, '0')}`;

export function createStorageModel({ blockCount = 4 } = {}) {
  return {
    clock: 0,
    nextLogicalAddress: 0,
    blocks: Array.from({ length: blockCount }, (_, blockId) => ({
      id: blockId,
      eraseCount: 0,
      pages: Array.from({ length: PAGES_PER_BLOCK }, (_, index) => ({
        blockId,
        index,
        state: 'free',
        fileId: null,
        logicalPage: null,
        sequence: 0,
      })),
    })),
    files: [],
  };
}

export function representativePageCount(size) {
  return Math.min(6, Math.max(1, Math.ceil(Math.max(1, Number(size) || 1) / PAGE_BYTES)));
}

export function storageStats(model) {
  const pages = model.blocks.flatMap(block => block.pages);
  return {
    totalPages: pages.length,
    freePages: pages.filter(page => page.state === 'free').length,
    validPages: pages.filter(page => page.state === 'valid').length,
    invalidPages: pages.filter(page => page.state === 'invalid').length,
    files: model.files.filter(file => file.status === 'valid').length,
    deletedFiles: model.files.filter(file => file.status === 'deleted').length,
  };
}

function flatPages(model) {
  return model.blocks.flatMap(block => block.pages);
}

function replacePage(model, target, next) {
  model.blocks[target.blockId].pages[target.index] = next;
}

function makeFileId(model) {
  return `file-${model.clock + 1}`;
}

export function writeFile(model, descriptor) {
  const next = clone(model);
  const pageCount = representativePageCount(descriptor.size ?? descriptor.bytes?.length);
  const free = flatPages(next).filter(page => page.state === 'free');
  if (free.length < pageCount) {
    return { ok: false, model, reason: 'No free representative pages remain. Run garbage collection first.' };
  }
  next.clock += 1;
  const id = descriptor.id || makeFileId(model);
  const logicalAddress = next.nextLogicalAddress;
  next.nextLogicalAddress += pageCount;
  const physicalPages = free.slice(0, pageCount).map((page, logicalPage) => {
    const written = { ...page, state: 'valid', fileId: id, logicalPage, sequence: next.clock };
    replacePage(next, page, written);
    return { blockId: written.blockId, index: written.index, address: pageAddress(written) };
  });
  const file = {
    ...descriptor,
    id,
    logicalAddress,
    physicalPages,
    pageCount,
    status: 'valid',
    recoverable: true,
    createdAt: next.clock,
  };
  next.files.push(file);
  return {
    ok: true,
    model: next,
    file,
    event: {
      type: 'program',
      title: 'UFS program sequence',
      detail: `Logical pages L${logicalAddress}–L${logicalAddress + pageCount - 1} mapped to ${physicalPages.map(page => page.address).join(', ')}.`,
      steps: ['Smartphone app writes a file', 'File system allocates logical pages', 'UFS controller maps free NAND pages', 'ISPP programs the selected SLC byte'],
    },
  };
}

export function logicalDelete(model, fileId) {
  const next = clone(model);
  const file = next.files.find(item => item.id === fileId);
  if (!file || file.status !== 'valid') return { ok: false, model, reason: 'Choose a stored file before deleting it.' };
  next.clock += 1;
  for (const address of file.physicalPages) {
    const page = next.blocks[address.blockId].pages[address.index];
    replacePage(next, page, { ...page, state: 'invalid', sequence: next.clock });
  }
  file.status = 'deleted';
  file.deletedAt = next.clock;
  return {
    ok: true,
    model: next,
    file,
    event: {
      type: 'logical-delete',
      title: 'Logical deletion only',
      detail: `${file.name} left the file-system directory. Its NAND pages are invalid, but no physical erase has happened.`,
      steps: ['Directory entry removed', 'Logical pages marked invalid', 'NAND charge is still present', 'Garbage collection can reclaim the block later'],
    },
  };
}

export function restoreFile(model, fileId) {
  const next = clone(model);
  const file = next.files.find(item => item.id === fileId);
  if (!file || file.status !== 'deleted' || !file.recoverable) {
    return { ok: false, model, reason: 'This file is no longer in the recoverable logical-deletion state.' };
  }
  next.clock += 1;
  for (const address of file.physicalPages) {
    const page = next.blocks[address.blockId].pages[address.index];
    if (page.state !== 'invalid') return { ok: false, model, reason: 'A required NAND page has already been reclaimed.' };
    replacePage(next, page, { ...page, state: 'valid', sequence: next.clock });
  }
  file.status = 'valid';
  delete file.deletedAt;
  return {
    ok: true,
    model: next,
    file,
    event: {
      type: 'restore',
      title: 'File restored before reclamation',
      detail: `${file.name} was relinked to its existing NAND pages; no program or erase pulse was needed.`,
      steps: ['File-system entry restored', 'Invalid page flags returned to valid', 'UFS mapping remains unchanged', 'Existing NAND charge is read back'],
    },
  };
}

export function garbageCollect(model) {
  const next = clone(model);
  const candidates = next.blocks
    .map(block => ({ block, invalid: block.pages.filter(page => page.state === 'invalid').length, valid: block.pages.filter(page => page.state === 'valid').length }))
    .filter(candidate => candidate.invalid > 0)
    .sort((a, b) => b.invalid - a.invalid || a.block.id - b.block.id);
  if (!candidates.length) return { ok: false, model, reason: 'There are no invalid pages for garbage collection.' };

  const source = candidates[0].block;
  const validPages = source.pages.filter(page => page.state === 'valid');
  const destinations = flatPages(next).filter(page => page.state === 'free' && page.blockId !== source.id).slice(0, validPages.length);
  if (destinations.length < validPages.length) return { ok: false, model, reason: 'Garbage collection needs free destination pages for valid-page relocation.' };

  next.clock += 1;
  const relocations = [];
  validPages.forEach((page, index) => {
    const destination = destinations[index];
    const written = { ...destination, state: 'valid', fileId: page.fileId, logicalPage: page.logicalPage, sequence: next.clock };
    replacePage(next, destination, written);
    const file = next.files.find(item => item.id === page.fileId);
    if (file) {
      file.physicalPages = file.physicalPages.map(address => address.blockId === page.blockId && address.index === page.index
        ? { blockId: written.blockId, index: written.index, address: pageAddress(written) }
        : address);
    }
    relocations.push({ from: pageAddress(page), to: pageAddress(written), fileId: page.fileId });
  });

  const invalidRemoved = source.pages.filter(page => page.state === 'invalid').length;
  source.pages.forEach(page => replacePage(next, page, { ...page, state: 'free', fileId: null, logicalPage: null, sequence: next.clock }));
  source.eraseCount += 1;
  next.files.forEach(file => {
    if (file.status === 'deleted' && file.physicalPages.every(address => address.blockId === source.id)) {
      file.status = 'collected';
      file.recoverable = false;
      file.bytes = null;
      file.preview = '';
    }
  });
  return {
    ok: true,
    model: next,
    sourceBlock: source.id,
    relocations,
    invalidRemoved,
    event: {
      type: 'garbage-collect',
      title: `Garbage collection erased block ${source.id}`,
      detail: `${relocations.length} valid page(s) relocated; ${invalidRemoved} invalid page(s) removed; B${source.id} then received one physical erase cycle.`,
      steps: ['Select block with invalid pages', `Relocate ${relocations.length} valid page(s)`, `Discard ${invalidRemoved} invalid page(s)`, `FN erase NAND block B${source.id}`],
    },
  };
}

export function physicallyEraseFile(model, fileId) {
  const next = clone(model);
  const file = next.files.find(item => item.id === fileId);
  if (!file) return { ok: false, model, reason: 'No mapped file is selected.' };
  const blocks = new Set(file.physicalPages.map(page => page.blockId));
  blocks.forEach(blockId => {
    next.blocks[blockId].pages.forEach(page => replacePage(next, page, { ...page, state: 'free', fileId: null, logicalPage: null }));
    next.blocks[blockId].eraseCount += 1;
  });
  file.status = 'collected';
  file.recoverable = false;
  file.bytes = null;
  file.preview = '';
  return { ok: true, model: next, blocks: [...blocks] };
}

export function pagesForDisplay(model) {
  return model.blocks.map(block => ({ ...block, pages: block.pages.map(page => ({ ...page, address: pageAddress(page) })) }));
}
