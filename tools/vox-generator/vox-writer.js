/**
 * MagicaVoxel .vox file writer
 * Format spec: https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt
 */
const fs = require('fs');

function createVoxFile(sizeX, sizeY, sizeZ, voxels, palette) {
  // voxels: [{x, y, z, colorIndex}]  (colorIndex 1-255)
  // palette: [{r, g, b, a}] up to 255 entries (index 0 unused)

  const xyziContent = Buffer.alloc(4 + voxels.length * 4);
  xyziContent.writeUInt32LE(voxels.length, 0);
  voxels.forEach((v, i) => {
    const off = 4 + i * 4;
    xyziContent[off] = v.x;
    xyziContent[off + 1] = v.y;
    xyziContent[off + 2] = v.z;
    xyziContent[off + 3] = v.colorIndex;
  });

  const sizeContent = Buffer.alloc(12);
  sizeContent.writeUInt32LE(sizeX, 0);
  sizeContent.writeUInt32LE(sizeY, 4);
  sizeContent.writeUInt32LE(sizeZ, 8);

  const rgbaContent = Buffer.alloc(1024); // 256 * 4
  for (let i = 0; i < 255; i++) {
    const c = palette[i] || { r: 0, g: 0, b: 0, a: 0 };
    const off = i * 4;
    rgbaContent[off] = c.r;
    rgbaContent[off + 1] = c.g;
    rgbaContent[off + 2] = c.b;
    rgbaContent[off + 3] = c.a !== undefined ? c.a : 255;
  }

  const sizeChunk = makeChunk('SIZE', sizeContent);
  const xyziChunk = makeChunk('XYZI', xyziContent);
  const rgbaChunk = makeChunk('RGBA', rgbaContent);

  const childrenBuf = Buffer.concat([sizeChunk, xyziChunk, rgbaChunk]);
  const mainChunk = makeChunk('MAIN', Buffer.alloc(0), childrenBuf);

  // File header: 'VOX ' + version 150
  const header = Buffer.alloc(8);
  header.write('VOX ', 0, 4, 'ascii');
  header.writeUInt32LE(150, 4);

  return Buffer.concat([header, mainChunk]);
}

function makeChunk(id, content, children) {
  children = children || Buffer.alloc(0);
  const header = Buffer.alloc(12);
  header.write(id, 0, 4, 'ascii');
  header.writeUInt32LE(content.length, 4);
  header.writeUInt32LE(children.length, 8);
  return Buffer.concat([header, content, children]);
}

module.exports = { createVoxFile };
