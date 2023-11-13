/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */
const { createReadStream, createWriteStream } = require("fs");

const AdmZip = require("adm-zip"),
  fs = require("fs").promises,
  PNG = require("pngjs").PNG,
  path = require("path"),
  { pipeline } = require("stream");


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(pathIn);
      zip.extractAllTo(pathOut, true);
      resolve()
    } catch (err) {
      reject(err)
    }
  });
};
/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const checkPNG = (array) => {
  let newArray = []
  for (let i = 0; i < array.length; i++) {
    ext = path.extname(array[i]);
    if (ext === ".png") {
      newArray.push(`unzipped/${array[i]}`)
    } 
  }
  return newArray
}

const readDir = (dir) => {
  return new Promise((resolve, reject) => {
      fs.readdir(dir)
        .then((data) => checkPNG(data))
        .then((data) => resolve(data))
        .catch((err) => reject(err))
  })
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const errorHandler = (err) => {
  if (err) { console.log(err); }
}

greyFilter = (r, g, b) => {
  return (r + g + b) / 3
}

blackOut = () => {
  return 0
}

green = (r, g, b, data, idx) => {
  const intensity = (r + g + b) / 3;
  const blue = intensity * 2;
  const clampedBlue = Math.min(255, Math.max(0, blue));
  if (data[idx] === r) {
    return 
  } else if (data[idx+1] === g) {
    return g
  } else {
    return clampedBlue
  }
}

const applyFilter = (height, width, data, filter) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let idx = (width * y + x) << 2;
      let r = data[idx]
      let g = data[idx + 1]
      let b = data[idx + 2]

      data[idx] = filter(r,g,b,data,idx)
      data[idx + 1] = filter(r,g,b,data,idx)
      data[idx + 2] = filter(r,g,b,data,idx)
    }
  }
  return data
}

const filteredPhotoOut = (pathOut, pngArray, filter) => {
  return new Promise((resolve,reject) => {
    try {
      let pngCount = 1
      for (png of pngArray) {
        const newPathOut = path.join(pathOut,`output${pngCount}.png`)
        const newPathin = path.join(__dirname, png)
        pngCount++

        pipeline(
          createReadStream(newPathin), 
          new PNG({ filterType: 4 })
          .on("parsed", function () {
            this.data = applyFilter(this.height, this.width, this.data, filter),
            this.pack()
          }),
          createWriteStream(newPathOut),
          errorHandler
        )
      resolve()
      }
    } catch(error) {
      reject(error)
    }
  })
};

module.exports = {
  unzip,
  readDir,
  filteredPhotoOut,
};
