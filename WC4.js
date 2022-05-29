
//JS version of https://github.com/projectpokemon/PCDWC4Converter

const _blockPositions = [
	0, 1, 2, 3,
	0, 1, 3, 2,
	0, 2, 1, 3,
	0, 3, 1, 2,
	0, 2, 3, 1,
	0, 3, 2, 1,
	1, 0, 2, 3,
	1, 0, 3, 2,
	2, 0, 1, 3,
	3, 0, 1, 2,
	2, 0, 3, 1,
	3, 0, 2, 1,
	1, 2, 0, 3,
	1, 3, 0, 2,
	2, 1, 0, 3,
	3, 1, 0, 2,
	2, 3, 0, 1,
	3, 2, 0, 1,
	1, 2, 3, 0,
	1, 3, 2, 0,
	2, 1, 3, 0,
	3, 1, 2, 0,
	2, 3, 1, 0,
	3, 2, 1, 0
]

const _blockPositionInvert = [0, 1, 2, 4, 3, 5, 6, 7, 12, 18, 13, 19, 8, 10, 14, 20, 16, 22, 9, 11, 15, 21, 17, 23];

//Linear Congruent Random Number Generator
class LCRng {
	constructor(seed) {
		this.nSeed = new Uint32Array(3);
		this.nSeed[0] = seed
		this.nSeed[1] = 0x41C64E6D
		this.nSeed[2] = 0x00006073
	}
	Next() {
		this.nSeed[0] = Math.imul(this.nSeed[1], this.nSeed[0]);
		this.nSeed[0] = (this.nSeed[0] + this.nSeed[2]);
		return (this.nSeed[0] >>> 0x10);
	}

}

//Still here for ARM Implementation
function SwapEndian(array) {
	return array.reverse()
};

//Shuffle 32 byte blocks
function Shuffle(data, shiftValue) {
	var shuffledData = [];
	for (var i = 0; i < 4; i++) {
		//Shuffle the data
		for (let z = 0; z < 32; z++) {
			let y = z + (32 * _blockPositions[i + (shiftValue * 4)])
			shuffledData = shuffledData.concat(data[y + 16])
		}
	}
	for (var i = 0; i < 128; i++) {
		data[i + 16] = shuffledData[i]
	}
	return data
}

//Bitwise XOR
function XORCrypt(nData, pid) {
	var dNData = new Uint8Array(nData.length);
	let initialA = SwapEndian(nData.slice(14, 16))
	let initialSeed = initialA[0] * 0x100 + initialA[1]
	let rng = new LCRng(initialSeed);
	for (let b = 0; b < nData.length; b++) {
		if (b < 16 || b > 244) {
			dNData[b] = nData[b];
		};
	};
	for (var i = 16; i < 244; i += 2) {
		if (i == 144) {
			rng = new LCRng(pid);
		};
		var dataBlock = nData.slice(i, (i + 2));
		var value = SwapEndian(dataBlock);
		let x = 0x100;
		var valueI = 0
		for (let i = 0; i < 2; i++) {
			valueI = valueI + value[i] * x;
			x = x / 0x100
		};
		valueI = valueI >>> 0
		v0 = (valueI ^ rng.Next() >>> 0)
		v1 = v0&0xff
		v2 = (v0&0xff00)/0x100
		dNData[i] = v1;
		dNData[i + 1] = v2

	};
	return dNData;
};

//Encrypt WC4 File
function EncryptWC4(fileArray) {
	if (fileArray.length == 856 || fileArray.length == 260) {
		let pidA = SwapEndian(fileArray.slice(8, 12))
		let pid = 0
		let x = 0x1000000
		for (let i = 0; i < 4; i++) {
			pid = pid + pidA[i] * x
			x = x / 0x100
		}
		let shiftValue = ((pid & 0x3E000) >> 0xD) % 24;
		return XORCrypt(Shuffle(fileArray, _blockPositionInvert[shiftValue]), pid);
	} else {
		console.log("Wrong file size")
		return []
	}
}

//Decrypt PCD
function DecryptPCD(fileArray) {
	if (fileArray.length == 856 || fileArray.length == 260) {
		let pidA = SwapEndian(fileArray.slice(8, 12))
		let pid = 0
		let x = 0x1000000
		for (let i = 0; i < 4; i++) {
			pid = pid + pidA[i] * x
			x = x / 0x100
		}
		let shiftValue = ((pid & 0x3E000) >> 0xD) % 24;
		return Shuffle(XORCrypt(fileArray, pid), shiftValue);
	} else {
		console.log("Wrong file size!")
		return []
	}
}